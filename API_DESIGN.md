# ContextOS — API DESIGN

> Complete API contract: conventions, auth, REST endpoints with request/response shapes, GraphQL read layer, internal/service APIs, the ContextOS MCP server contract, webhooks, errors, rate limits, versioning, and SDKs. A frontend or integration engineer should be able to build against this directly.

## 1. Executive Summary

ContextOS exposes four API surfaces, each chosen deliberately: **REST** (the primary, public, mutation-and-read surface — predictable, cacheable, easy to secure and meter), **GraphQL** (an optional read-only layer for dashboard/analytics screens that over-fetch with REST), **Internal/service APIs** (typed RPC between services as the monolith splits), and the **MCP server** (ContextOS exposed as a Model Context Protocol server so any AI tool/agent can consume the org's context). The design is **TypeScript-typed end-to-end** — request/response schemas are defined once with Zod and shared between client and server, and the OpenAPI spec is generated from them as the single source of truth that drives docs and SDKs. Everything is **org-scoped**, **idempotent on cost-incurring writes**, **rate-limited with headers**, **versioned under `/v1`**, and returns **RFC-7807 problem+json** errors. AI endpoints **stream** (Server-Sent Events) for perceived latency and **return cost + citations** in every response, making cost and grounding first-class parts of the contract.

The governing principle: **the API is the product's contract with both humans and agents.** Because ContextOS is consumed by autonomous agents (via MCP and the SDK) as much as by the web app, the contracts must be machine-precise — typed schemas, structured recoverable errors, idempotency, and explicit cost/citation fields.

---

## 2. Conventions

- **Base URL:** `https://api.contextos.dev/v1`
- **Auth:** `Authorization: Bearer <jwt|api_key>`. Org scope is derived from the key, or set explicitly with `X-Org-Id` for multi-org users.
- **Content type:** `application/json`; field naming `snake_case`.
- **Pagination:** cursor-based — `?cursor=<opaque>&limit=<n>`; responses include `{ "data": [...], "next_cursor": "..." }`.
- **Idempotency:** `Idempotency-Key: <uuid>` **required** on POSTs that incur LLM/compute cost or side effects (`/ask`, `/chat`, agent runs, bundle creation). The server stores the key→response for 24h and replays on retry.
- **Rate limits:** surfaced via `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. 429 on breach with `Retry-After`.
- **Streaming:** AI endpoints support `Accept: text/event-stream` (SSE). Non-streaming clients get a buffered JSON response.
- **Versioning:** URI-versioned (`/v1`). Breaking changes → `/v2` with a deprecation window; additive changes are non-breaking. Capability flags expose provider-specific features.
- **Errors:** RFC-7807 `application/problem+json` (see §9).
- **Tenant safety:** every endpoint enforces RBAC (deny-by-default) and RLS; no endpoint can return cross-`org_id` data.

---

## 3. Authentication & Authorization

```
POST /v1/auth/login           # email/OAuth (GitHub/Google) → session + JWT
POST /v1/auth/refresh         # rotate access token
GET  /v1/me                   # current user + orgs + roles
POST /v1/orgs                 # create org (caller becomes owner)
GET  /v1/orgs/:id
POST /v1/orgs/:id/members     # invite { email, role }
PATCH /v1/orgs/:id/members/:userId   # change role
DELETE /v1/orgs/:id/members/:userId
POST /v1/api-keys             # { name, scopes[] } → { id, secret(once) }
GET  /v1/api-keys             # list (no secrets)
DELETE /v1/api-keys/:id
# Enterprise (V3)
POST /v1/orgs/:id/sso         # configure SAML/OIDC
POST /v1/orgs/:id/scim        # provisioning token
```

Roles: `owner > admin > member > viewer`. Scopes on API keys are least-privilege (e.g., `context:read`, `ask:write`, `integrations:admin`). An agent acting on behalf of a user inherits the **narrower** of {user role, agent scopes, integration scopes}.

**Example — create API key**
```http
POST /v1/api-keys
{ "name": "ci-agent", "scopes": ["context:read", "ask:write"] }
→ 201 { "id": "key_…", "secret": "cos_sk_…", "scopes": [...], "created_at": "…" }
```

---

## 4. Projects & Repositories

```
POST /v1/projects                         # { name } → project
GET  /v1/projects                         # list (cursor)
GET  /v1/projects/:id
DELETE /v1/projects/:id
POST /v1/projects/:id/repositories        # connect { provider, url, default_branch }
GET  /v1/projects/:id/repositories
POST /v1/projects/:id/reindex             # force full reindex → { job_id }
GET  /v1/projects/:id/index-status        # { sha, status, progress, last_indexed_at }
DELETE /v1/repositories/:id               # disconnect + purge derived data
```

**Example — connect repo**
```http
POST /v1/projects/proj_1/repositories
{ "provider": "github", "url": "https://github.com/acme/api", "default_branch": "main" }
→ 202 { "repository_id": "repo_1", "index_job_id": "job_1", "status": "indexing" }
```
Indexing is asynchronous (event-driven, see [ARCHITECTURE.md §5](./ARCHITECTURE.md)); poll `index-status` or subscribe to the `index.completed` webhook.

---

## 5. Context (Memory plane)

```
POST  /v1/projects/:id/context            # create decision/adr/convention/glossary/note
GET   /v1/projects/:id/context?type=&q=&status=
GET   /v1/context/:itemId
PATCH /v1/context/:itemId                 # edit → new version
POST  /v1/context/:itemId/supersede       # { superseded_by }
GET   /v1/projects/:id/context/stale      # background-flagged stale items
```

**Example — record a decision**
```http
POST /v1/projects/proj_1/context
{ "type": "decision", "title": "Use Drizzle, not Prisma",
  "body": "Drizzle chosen for raw-SQL control over pgvector queries. Tradeoff: less magic." }
→ 201 { "id": "ctx_1", "version": 1, "status": "active", "created_at": "…" }
```

---

## 6. Context Handoff (the wedge)

```
POST /v1/projects/:id/bundles             # create handoff snapshot → { bundle_id, format }
GET  /v1/bundles/:bundleId                # export: JSON + generated CLAUDE.md/AGENTS.md
POST /v1/projects/:id/bundles/import      # restore from a bundle (multipart or JSON)
GET  /v1/bundles/:a/diff/:b               # structured diff between two bundles
```

**Example — export a bundle**
```http
GET /v1/bundles/bndl_1
→ 200 {
  "bundle_id": "bndl_1",
  "project_id": "proj_1",
  "generated_at": "2026-06-19T…",
  "context": { "decisions": [...], "conventions": [...], "glossary": [...] },
  "files": { "CLAUDE.md": "…", "AGENTS.md": "…" },
  "format_version": "1.0"   // the open Context Handoff format
}
```
The bundle is the portable artifact that makes any AI session start *warm*. Its format is an **open standard** (see [OPEN_SOURCE.md](./OPEN_SOURCE.md)); portability is intentional (D-010).

---

## 7. AI / Retrieval (Orchestration plane)

```
POST /v1/projects/:id/ask                 # RAG Q&A (streams); Idempotency-Key
POST /v1/projects/:id/search              # hybrid retrieval (no generation)
POST /v1/projects/:id/chat                # conversational; conversation_id
GET  /v1/conversations/:id/messages
POST /v1/messages/:id/feedback            # { rating, note } → feeds evals
```

**Example — ask (SSE streaming)**
```http
POST /v1/projects/proj_1/ask
Accept: text/event-stream
Idempotency-Key: 9f2c…
{ "question": "How does auth work here?", "scope": { "module": "auth" } }

event: token        data: {"text":"Authentication is handled in "}
event: token        data: {"text":"packages/auth via session JWTs…"}
event: citations    data: [{"path":"packages/auth/session.ts","start":12,"end":48}]
event: done         data: {"cost_usd":0.0021,"model":"claude-sonnet","tokens_in":3100,"tokens_out":240,"confidence":"high"}
```
Every `/ask` response carries **citations** (file:line) and **cost**. On low retrieval confidence the model returns an "I don't know" answer with `confidence: "low"` rather than hallucinating. The system prompt prefix is prompt-cached.

**Example — search (no LLM)**
```http
POST /v1/projects/proj_1/search
{ "query": "where do we validate webhooks", "k": 8, "filters": { "language": "ts" } }
→ 200 { "results": [ { "path":"…","start":…,"end":…,"snippet":"…","score":0.82 }, … ] }
```

---

## 8. Integrations / MCP Hub · Agents · Workflows · Governance · Billing

### Integrations (MCP Hub)
```
GET   /v1/integrations/catalog            # available MCP servers
POST  /v1/projects/:id/integrations       # connect { type, credential_ref, scopes[] }
GET   /v1/projects/:id/integrations
GET   /v1/integrations/:id/tools          # exposed tools + permissions
PATCH /v1/integrations/:id/permissions
DELETE /v1/integrations/:id
```

### Agents & Workflows
```
POST /v1/projects/:id/agents              # define { name, model, tools[], guardrails }
POST /v1/agents/:id/runs                  # start { input }; Idempotency-Key → { run_id }
GET  /v1/runs/:id                         # status + trajectory (steps/tools/cost)
POST /v1/runs/:id/approve                 # HITL gate for a paused risky action
POST /v1/runs/:id/cancel
POST /v1/projects/:id/workflows           # define trigger + steps
POST /v1/workflows/:id/runs
```

**Example — agent run status (trajectory)**
```http
GET /v1/runs/run_1
→ 200 {
  "run_id":"run_1","status":"awaiting_approval","cost_usd":0.04,
  "steps":[
    {"type":"reason","summary":"plan: locate handler, propose fix"},
    {"type":"tool","name":"search_code","args":{...},"latency_ms":120},
    {"type":"tool","name":"create_pr","status":"blocked_hitl"}
  ],
  "pending_approval":{"action":"create_pr","reason":"destructive/external"}
}
```

### Governance & Observability
```
GET  /v1/orgs/:id/audit-logs?from=&to=&actor=
GET  /v1/orgs/:id/usage?group_by=project|user|model
GET  /v1/orgs/:id/cost?from=&to=
POST /v1/orgs/:id/policies                # allowed models/tools, retention, spend caps
POST /v1/projects/:id/spend-cap           # { monthly_usd }
```

### Billing
```
GET  /v1/billing/subscription
POST /v1/billing/checkout                 # Stripe session
POST /v1/billing/portal
```

---

## 9. Error Model (RFC-7807 problem+json)

All errors share the shape:
```json
{ "type": "https://contextos.dev/errors/spend-cap-exceeded",
  "title": "Spend cap exceeded",
  "status": 402,
  "detail": "Project monthly cap of $50 reached.",
  "instance": "/v1/projects/proj_1/ask",
  "trace_id": "otel-abc123" }
```

| HTTP | `type` slug | When |
|------|-------------|------|
| 400 | `invalid-request` | schema validation failed (Zod details included) |
| 401 | `unauthenticated` | missing/invalid token |
| 403 | `forbidden` | RBAC/scope denied |
| 402 | `spend-cap-exceeded` / `quota-exceeded` | budget/plan limit hit |
| 404 | `not-found` | resource or cross-tenant (never reveal existence) |
| 409 | `index-not-ready` / `conflict` | repo still indexing; version conflict |
| 422 | `unprocessable` | semantically invalid (e.g., bad bundle format) |
| 429 | `rate-limited` | includes `Retry-After` |
| 503 | `provider-unavailable` | LLM provider down (after failover attempts) |

Errors are **structured and recoverable** so agents can adapt (e.g., on `index-not-ready`, an agent waits and retries). `trace_id` ties every error to an OpenTelemetry trace for debugging.

---

## 10. Webhooks (inbound & outbound)

**Inbound (signed):**
```
POST /v1/webhooks/github     # push/PR → reindex + memory extraction
POST /v1/webhooks/stripe     # billing events (signature-verified)
POST /v1/webhooks/:integration
```
Inbound webhooks are signature-verified, enqueued immediately (fast 202), and processed async (never block the sender).

**Outbound (org-configured):** ContextOS posts signed events to customer endpoints — `index.completed`, `agent.run.completed|failed`, `context.updated`, `spend.threshold.reached` — with HMAC signatures and retry-with-backoff.

---

## 11. GraphQL Read Layer (optional, dashboards)

A single `/v1/graphql` endpoint serves the analytics/observability UI where REST would over-fetch nested data. **Reads only**; all mutations stay REST (simpler idempotency, metering, and audit).
```graphql
type Query {
  org(id: ID!): Org
  usage(orgId: ID!, range: DateRange!, groupBy: UsageGroup!): [UsagePoint!]!
  cost(orgId: ID!, range: DateRange!): CostBreakdown!
  project(id: ID!): Project
  auditLogs(orgId: ID!, filter: AuditFilter, after: String, first: Int): AuditConnection!
}
type Project { id: ID! name: String! contextItems: [ContextItem!]! agents: [Agent!]! indexStatus: IndexStatus! }
```
Ship GraphQL only when a dashboard's read complexity justifies it; REST is the default.

---

## 12. Internal / Service APIs & the MCP Server

**Internal:** as the monolith splits (Tier 2+), services talk over typed HTTP or gRPC, e.g., `Retrieval.retrieve(query, projectId, k) → Chunk[]`. Contracts are shared Zod/proto types; internal calls carry the tenant context and a trace id.

**MCP server (ContextOS-as-a-server):** exposed at `/mcp` (streamable HTTP, API-key auth, org+project scoped) so any MCP host/agent can use ContextOS:
- Tools: `get_project_context`, `ask_codebase`, `search_code`, `record_decision`, `get_conventions`.
- Resources: `context://{project}/decisions`, `context://{project}/architecture`.
- Prompts: `/load-context {project}` (the Context Handoff), `/onboard {project}`.

See [MCP.md](./MCP.md) for the full MCP contract and `mcp.json` for the client config template.

---

## 13. SDKs
A TypeScript SDK (`@contextos/sdk`) and a thin Python client are **generated from the OpenAPI spec** (the source of truth). The SDK handles auth, retries with backoff, idempotency-key generation, SSE streaming, and typed responses. Agent frameworks (LangGraph/CrewAI/OpenAI Agents) consume either the SDK or the MCP server.

---

## 14. Tradeoffs, Risks, Alternatives

- **REST-primary vs. GraphQL-everywhere:** REST gives predictable caching, metering, idempotency, and auditing — critical when every call has a cost and a compliance footprint. GraphQL is confined to reads where it genuinely reduces over-fetching. Pure-GraphQL was rejected for mutation complexity around idempotency/metering.
- **URI versioning vs. header versioning:** URI (`/v1`) is explicit and cache-friendly; chosen for clarity to third-party/agent consumers.
- **Streaming complexity:** SSE adds client complexity but is essential for perceived latency on AI calls; non-streaming fallback is always available.
- **Risk — idempotency gaps:** a missing idempotency key on a retried `/ask` could double-bill; mitigated by *requiring* the header on cost-incurring writes and rejecting (400) cost writes without it.
- **Risk — cross-tenant leakage via API:** mitigated by RLS + deny-by-default RBAC + 404-not-403 on cross-tenant resources (never confirm existence).

## 15. Future Considerations
gRPC for high-throughput internal calls at Tier 3; a public, rate-limited "context API" product for third parties; webhooks → an event-subscription API; signed, replayable audit export API for compliance; capability negotiation as MCP/agent protocols evolve.

## 16. Related Documents
[ARCHITECTURE.md](./ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md) · [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md) · [MCP.md](./MCP.md) · [SECURITY.md](./SECURITY.md) · [mcp.json](./mcp.json)

*Last reviewed 2026-06-19.*
