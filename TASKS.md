# ContextOS — TASKS

> Implementation-ready work breakdown: **Epic → Feature → Story → Task**, sized for execution by a small team using AI coding agents. Tasks are ~0.5–2 days. This document is the backlog; [SPRINTS.md](./SPRINTS.md) sequences it into time. Story IDs reference [USER_STORIES.md](./USER_STORIES.md) (e.g., US-25). Definition of Done is in §Final.

## 1. Executive Summary

This backlog decomposes ContextOS from epics down to implementation tasks. It is organized into **12 epics** that map to the feature ladder in [FEATURES.md](./FEATURES.md): foundation/platform, context store & memory, retrieval, AI orchestration, the Context Handoff wedge, the MCP integration hub, collaboration/teams, governance/security/guardrails, agents/automation, observability/dashboards, evals/quality, and launch/GTM. Within each epic, features are broken into stories (with acceptance criteria) and stories into concrete engineering tasks. The backlog is **wedge-ordered**: the MVP epics (E1–E5, E10–E11) are fully detailed because they are built first; later epics (E6–E9, E12) are detailed enough to plan and estimate. Because ContextOS reuses the Codebase Intelligence (#2) and MCP Generator (#3) engines, several tasks are "integrate engine X" rather than "build engine X" — this is the wedge dividend.

Every task assumes the conventions in [CLAUDE.md](./CLAUDE.md)/[AGENTS.md](./AGENTS.md): TypeScript, Turborepo monorepo, Drizzle + RLS, provider abstraction for all LLM calls, OpenTelemetry tracing + cost attribution, and an eval gate in CI. "Done" means typed, tested (unit + relevant eval), traced + cost-attributed, RLS-safe, and documented (spec updated in the same change).

---

## 2. Epic E1 — Foundation & Platform

### Feature E1.1 — Monorepo & infrastructure scaffold
**Story:** As a developer, I want a working monorepo + local infra so I can run the whole system locally. *(Acceptance: `pnpm dev` runs web+api+workers; CI green; `docker compose up` brings up Postgres+pgvector, Redis, otel-collector.)*
- [ ] Init Turborepo + pnpm; `apps/{web,api}`; `packages/{ui,llm,rag,mcp,db,auth,observability,evals}`
- [ ] Base NestJS app with module boundaries (auth/context/retrieval/integration/orchestration/governance/billing)
- [ ] Next.js App Router shell (Tailwind + shadcn/ui), auth-aware layout
- [ ] `docker-compose.yml`: Postgres 16 + pgvector, Redis, otel-collector
- [ ] GitHub Actions: lint, typecheck, unit test, build; preview deploy on PR
- [ ] Drizzle setup + migration runner; first migration (orgs/users/memberships/projects)
- [ ] RLS scaffolding: `app.org_id` session var + tenant-isolation policy helper + a test that proves isolation

### Feature E1.2 — Auth & Org (US-1, US-4, US-5, US-10)
**Story:** Sign up, create an org, invite teammates with roles. *(Acceptance: a user can sign up via GitHub, create an org, invite a member as `member`, and RLS prevents cross-org reads.)*
- [ ] Email + GitHub/Google OAuth; session + JWT issuance/refresh
- [ ] Organizations, memberships, RBAC roles (owner/admin/member/viewer) + guard decorator
- [ ] API keys (scoped, rotatable) with secret shown once
- [ ] `/me`, org CRUD, member invite/role endpoints
- [ ] RLS policies on all tenant tables + automated cross-tenant-leak test (invariant)

### Feature E1.3 — Billing & metering (US-92..96)
**Story:** Upgrade to Pro self-serve; usage is metered; spend caps enforced. *(Acceptance: Stripe checkout upgrades the org; `usage_records` accrue; a project spend cap blocks `/ask` with 402.)*
- [ ] Stripe Billing: plans (Free/Pro), checkout, portal, webhook (signature-verified)
- [ ] Usage metering: write `usage_records` on every LLM/embedding/tool call
- [ ] Spend-cap enforcement middleware (pre-call budget check → 402)
- [ ] Plan-gating middleware (feature flags by plan)

---

## 3. Epic E2 — Context Store & Memory (MVP core)

### Feature E2.1 — Projects & repositories (US-2)
- [ ] Project CRUD; connect GitHub repo via OAuth app + webhook registration
- [ ] Repo clone + ingestion pipeline kickoff (enqueue index job)
- [ ] `index-status` endpoint + progress events

### Feature E2.2 — Context items (US-11..13, US-17, US-22)
**Story:** Record/edit/version decisions, ADRs, conventions, glossary. *(Acceptance: creating a decision stores v1; editing creates v2; supersede links items; stale job flags old items.)*
- [ ] CRUD for `context_items` (decision/adr/convention/glossary/note), versioned
- [ ] Supersede flow (`superseded_by`) + conflict surfacing (US-22)
- [ ] Embed `context_items` for semantic match (pgvector)
- [ ] Stale-flagging background job (US-16)

### Feature E2.3 — Memory extraction (US-12, US-15, US-20)
**Story:** Auto-extract candidate decisions/conventions from PRs/commits/chats for review.
- [ ] Worker: parse PR/commit/chat → LLM proposes candidate context items (Haiku/Sonnet)
- [ ] Review/approve UI; agent write-back path (US-20)
- [ ] "Remember this" action from a chat message (US-15)

### Feature E2.4 — Feedback loop (US-76)
- [ ] Thumbs/notes on AI output → `feedback`; pipe into evals dataset

---

## 4. Epic E3 — Retrieval (reuse #2 engine)
**Story:** Connect a repo → it indexes → semantic+keyword search returns relevant chunks. *(Acceptance: search returns file:line snippets ranked sensibly; reindex on push touches only changed files.)*
- [ ] Integrate `packages/rag`: tree-sitter AST chunker (multi-language) → `chunks`
- [ ] Dual embedding (code + NL summary); content-hash cache (skip unchanged)
- [ ] pgvector HNSW + Postgres FTS + trigram; hybrid retrieve with reciprocal rank fusion
- [ ] Symbol-graph builder (`symbols`/`symbol_edges`) + graph-expansion in retrieval
- [ ] Cross-encoder / LLM re-rank; context assembler (budget, dedupe, citations)
- [ ] Incremental reindex worker on push webhook (changed files only)

---

## 5. Epic E4 — AI Orchestration (US-35..44, US-77)
**Story:** Ask the codebase a question → grounded, cited, streamed answer with visible cost. *(Acceptance: `/ask` streams tokens then citations then a done-event with cost; low confidence yields "I don't know".)*
- [ ] `packages/llm` provider abstraction (Claude/GPT/Gemini) + embeddings
- [ ] Model router (reasoning/cheap/long-context) + policy + spend-cap check
- [ ] Prompt caching (stable prefix); answer caching (SHA + question key)
- [ ] `/ask` (RAG Q&A, SSE streaming, citations, confidence); `/search`; `/chat`
- [ ] Grounding enforcement + "I don't know"; Zod-validated structured outputs
- [ ] Per-request cost recording + `X-RateLimit-*` headers

---

## 6. Epic E5 — Context Handoff (the wedge) (US-25..34)
**Story:** Export context, restore it warm into a fresh AI session, and have the AI stop repeating mistakes. *(Acceptance: a bundle exports JSON + generated CLAUDE.md/AGENTS.md; importing into a new session demonstrably loads conventions; `contextos pull/push` works in a terminal.)*
- [ ] Bundle export (JSON + generated `CLAUDE.md`/`AGENTS.md`/`llms.txt`) — the open Handoff format
- [ ] Bundle import/restore; bundle diff endpoint (US-34)
- [ ] CLI: `contextos pull` / `contextos push` for local sessions
- [ ] MCP prompt `/load-context` (Handoff via MCP)
- [ ] Auto-sync context to repo `CLAUDE.md`/`AGENTS.md` on change (US-31)
- [ ] Scope a handoff to one module/feature (US-32)

---

## 7. Epic E6 — Integrations / MCP Hub (V2) (US-45..54)
- [ ] MCP client manager; vault-backed credential storage (refs only)
- [ ] Connect GitHub/Notion/Jira/Slack/DB MCP servers; per-tool permission scopes
- [ ] Tool-call audit + rate limit + injection-aware handling of tool outputs
- [ ] ContextOS-as-MCP-server (`/mcp` streamable HTTP): tools/resources/prompts (US-30)
- [ ] Reuse #3 generator for custom internal tools (US-52)
- [ ] Central integration management UI (US-50, US-53)

---

## 8. Epic E7 — Collaboration & Teams (V1) (US-55..62)
- [ ] Invites, shared workspaces, shared (team-wide) context
- [ ] Comments, @mentions, activity feed
- [ ] Context review/approval workflow (US-18)
- [ ] New-hire guided onboarding tour (US-29, US-60)
- [ ] Fork-context-as-template (US-62)

---

## 9. Epic E8 — Governance, Security, Guardrails (US-63..75)
- [ ] Append-only audit log on all actions (actor/action/resource/metadata)
- [ ] PII redaction; prompt-injection detector; tool allowlist
- [ ] HITL approval flow + UI; sandbox for code-executing tools
- [ ] Spend caps per project/team (US-72) + alerts
- [ ] Policy engine (allowed models/tools, retention, caps) — V2 (US-75)
- [ ] Guardrails console UI — V2 (US-66..68)
- [ ] SSO/SAML/SCIM (WorkOS); on-prem Helm packaging — V3 (US-71, US-74)

---

## 10. Epic E9 — Agents & Automation (V2) (US-83..91)
- [ ] Agent runtime: single-agent loop, budgets (steps/tokens/$/time), loop detection, sandbox
- [ ] Trajectory tracing + failure taxonomy (reuse #4)
- [ ] Multi-agent orchestrator (LangGraph): context/coder/reviewer agents
- [ ] Workflow triggers (on PR/issue) + workflow runs (US-86, US-87)
- [ ] HITL gates on destructive/expensive actions (US-91)
- [ ] Replay a failed run (US-90)

---

## 11. Epic E10 — Observability & Dashboards (US-76..82, US-104..105)
- [ ] OpenTelemetry instrumentation across services (incl. AI/cost spans)
- [ ] Dashboards: system health, AI cost, AI quality, agent ops, customer usage, business funnel
- [ ] Alerts: latency/error SLO, cost anomaly, quality regression, security (cross-tenant attempt)
- [ ] "Show context sent" debug view (US-104)
- [ ] Per-query cost surfaced in UI (US-77)

---

## 12. Epic E11 — Evals & Quality
- [ ] Golden datasets (codebase Q&A, memory extraction, agent tasks) in `packages/evals`
- [ ] LLM-as-judge harness + deterministic citation/schema checks
- [ ] CI eval gate (`pnpm test:eval`) blocking quality regressions
- [ ] Production sampling → grow golden dataset from real traffic + feedback

---

## 13. Epic E12 — Launch & GTM
- [ ] Landing page, docs site, pricing page
- [ ] OSS repo for Handoff format + CLI + chunker (open-core, D-007)
- [ ] Onboarding emails; product analytics; activation funnel instrumentation
- [ ] Product Hunt / HN / build-in-public assets; demo video of the Handoff "aha"

---

## 14. Cross-Cutting Tasks (apply throughout)
- [ ] Tenant-isolation invariant tests on every new tenant table
- [ ] Cost attribution on every LLM/tool call (no untracked spend)
- [ ] Trace every request end-to-end; tail-sample errors/slow/expensive
- [ ] Idempotency keys on all cost-incurring POSTs
- [ ] Update the relevant `.md` spec in the same PR when behavior changes (D-011)

---

## 15. Estimation & Sequencing Notes
- MVP epics (E1–E5, E10–E11) are ~6 two-week sprints for a focused founder + AI agents (see [SPRINTS.md](./SPRINTS.md)), *assuming #2 and #3 engines exist to reuse*. Building those engines cold adds ~6 sprints (the wedge accounts for this by shipping them first).
- E6–E9 (V2) are ~4–6 additional sprints; E8/E9 enterprise + agents are the heaviest.
- The single highest-leverage task is **E5 (Context Handoff)** — it is the demoable "aha"; prioritize it even slightly ahead of polish on E2/E4.

## 16. Tradeoffs, Risks, Alternatives
- **Tradeoff — reuse vs. rebuild:** reusing #2/#3 is faster but couples ContextOS to those engines' APIs; we accept the coupling (shared monorepo packages make it clean).
- **Risk — eval gate slows iteration:** mitigated by fast, focused golden sets; the alternative (silent quality regressions) is worse.
- **Alternative rejected — build teams/agents before the wedge:** would delay the "aha" and inflate scope; wedge-ordered backlog prevents it.

## 17. Future Considerations
A public, automatically-generated task board (from this file) synced to Linear/GitHub Projects; AI-agent-executable task specs (each task with enough context for an agent to implement against the docs — the spec-first dividend, D-011).

## 18. Definition of Done (every task)
Typed · unit-tested (+ relevant eval) · traced + cost-attributed · RLS/tenant-safe · documented (spec updated) · behind a feature flag if risky.

## 19. Related Documents
[FEATURES.md](./FEATURES.md) · [USER_STORIES.md](./USER_STORIES.md) · [SPRINTS.md](./SPRINTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md)

*Last reviewed 2026-06-19.*
