# ContextOS — DATABASE

> Complete data model: entities, relationships, ERD, DDL sketches, indexing, multi-tenancy, lifecycle, and migration strategy. Datastore = **PostgreSQL + pgvector**, single primary store (decision DECISION_LOG.md D-004). ORM = **Drizzle** (type-safe, raw-SQL control for vector queries).

## 1. Executive Summary

ContextOS stores three fundamentally different kinds of data, and the schema is organized around their differences: **curated knowledge** (human/agent-authored, versioned, high-trust — decisions, conventions, glossary, ADRs), **derived knowledge** (mechanical, regenerable — code chunks, embeddings, the symbol graph), and **operational data** (identity, billing, audit, usage, agent runs). All of it is **multi-tenant** with `org_id` on every row and **Postgres Row-Level Security (RLS)** enforcing isolation at the database, not just the application. Vectors live in **pgvector** with HNSW indexes; lexical search uses Postgres full-text; the two are fused in the application for hybrid retrieval. High-volume, append-only tables (audit, usage, events) are **time-partitioned** and retained by policy. This document gives the entity catalog, an ERD, DDL sketches for the load-bearing tables, the indexing strategy, the multi-tenancy model, data lifecycle/retention, and the migration discipline. It is sufficient to implement the schema directly.

The design principle: **isolation is an invariant, not a feature** (no query may cross `org_id`), and **derived data is always regenerable** (we can drop and rebuild chunks/embeddings/graph from source + commit SHA), which keeps the system resilient to embedding-model upgrades and reindex bugs.

---

## 2. Entity Catalog

| Entity | Kind | Purpose |
|--------|------|---------|
| `users` | operational | Identity |
| `organizations` | operational | Tenant boundary |
| `memberships` | operational | user ↔ org with role (RBAC) |
| `projects` | operational | A workspace, usually = a product/repo group |
| `repositories` | operational | Connected repos (provider, url, default branch, `last_indexed_sha`, status) |
| `context_items` | curated | Decision / ADR / convention / glossary / note — **versioned**, status (active/stale/superseded) |
| `context_bundles` | curated | Context Handoff snapshots (portable export) |
| `documents` | derived | Ingested files/docs (path, language, size, hash) |
| `chunks` | derived | AST-aware chunks of documents (+ metadata, `tsv` for lexical) |
| `chunk_summaries` | derived | LLM natural-language summary per code chunk (dual-embedding) |
| `embeddings` | derived | Vector per chunk (pgvector) |
| `symbols` | derived | Symbol graph nodes (function/class/module + location) |
| `symbol_edges` | derived | Symbol graph edges (calls/imports/inherits/references) |
| `integrations` | operational | Connected MCP servers/tools (vault credential ref, scopes, status) |
| `agents` | operational | Agent definitions (name, model, tools, guardrail config) |
| `agent_runs` | operational | Executions (status, cost, trajectory ref, failure type) |
| `workflows` / `workflow_runs` | operational | Automation definitions + executions |
| `conversations` / `messages` | operational | AI chat history |
| `feedback` | operational | Thumbs/notes on AI output → feeds evals |
| `events` | operational | Domain event log (async) |
| `audit_logs` | operational | Immutable security/compliance trail |
| `usage_records` | operational | Metered LLM/compute usage (billing) |
| `subscriptions` / `plans` / `invoices` | operational | Billing |
| `api_keys` | operational | Programmatic + MCP access (scoped) |
| `policies` | operational | Governance rules (allowed models/tools, retention, spend caps) |
| `secret_refs` | operational | Pointers to vault entries (never the secret itself) |

---

## 3. Entity-Relationship Diagram

```mermaid
erDiagram
    organizations ||--o{ memberships : has
    users ||--o{ memberships : in
    organizations ||--o{ projects : owns
    projects ||--o{ repositories : connects
    repositories ||--o{ documents : contains
    documents ||--o{ chunks : split_into
    chunks ||--|| embeddings : has
    chunks ||--o| chunk_summaries : summarized_by
    repositories ||--o{ symbols : defines
    symbols ||--o{ symbol_edges : from
    symbols ||--o{ symbol_edges : to
    projects ||--o{ context_items : has
    projects ||--o{ context_bundles : snapshots
    projects ||--o{ integrations : uses
    projects ||--o{ agents : defines
    agents ||--o{ agent_runs : executes
    projects ||--o{ workflows : defines
    workflows ||--o{ workflow_runs : executes
    projects ||--o{ conversations : has
    conversations ||--o{ messages : contains
    messages ||--o{ feedback : receives
    organizations ||--o{ audit_logs : records
    organizations ||--o{ usage_records : meters
    organizations ||--|| subscriptions : billed_by
    organizations ||--o{ policies : governed_by
    integrations ||--o{ secret_refs : uses
```

---

## 4. DDL Sketches (load-bearing tables)

```sql
create extension if not exists vector;
create extension if not exists pg_trgm;   -- identifier fuzzy match

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free',           -- free|pro|team|enterprise
  data_region text default 'us',                -- residency (V3)
  created_at timestamptz default now()
);

create table memberships (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  primary key (org_id, user_id)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- CURATED KNOWLEDGE (versioned, high-trust)
create table context_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  project_id uuid not null references projects(id) on delete cascade,
  type text not null check (type in ('decision','adr','convention','glossary','note')),
  title text not null,
  body text not null,
  version int not null default 1,
  status text not null default 'active',        -- active|stale|superseded
  superseded_by uuid references context_items(id),
  embedding vector(1536),                        -- for semantic match of curated context
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DERIVED KNOWLEDGE (regenerable)
create table documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null, repo_id uuid not null references repositories(id) on delete cascade,
  path text not null, language text, size_bytes int, content_hash text not null
);

create table chunks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  document_id uuid not null references documents(id) on delete cascade,
  content text not null,
  symbol text, kind text, language text,
  start_line int, end_line int,
  content_hash text not null,                    -- skip re-embed if unchanged
  tsv tsvector
);

create table embeddings (
  chunk_id uuid primary key references chunks(id) on delete cascade,
  org_id uuid not null,
  embedding vector(1536) not null
);

create table symbols (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null, repo_id uuid not null,
  name text not null, kind text, path text, start_line int, end_line int
);
create table symbol_edges (
  org_id uuid not null, repo_id uuid not null,
  from_symbol uuid references symbols(id) on delete cascade,
  to_symbol uuid references symbols(id) on delete cascade,
  edge_type text                                 -- calls|imports|inherits|references
);

-- OPERATIONAL (append-only, partitioned)
create table audit_logs (
  id bigserial primary key,
  org_id uuid not null,
  actor_type text, actor_id uuid,                -- user|agent|system
  action text not null, resource text, resource_id uuid,
  metadata jsonb, created_at timestamptz default now()
) partition by range (created_at);

create table usage_records (
  id bigserial primary key,
  org_id uuid not null, project_id uuid,
  kind text,                                      -- llm|embedding|tool|storage
  model text, tokens_in int, tokens_out int, cost_usd numeric,
  created_at timestamptz default now()
) partition by range (created_at);
```

### Index DDL
```sql
-- Vector (HNSW, cosine) for derived + curated semantic search
create index on embeddings using hnsw (embedding vector_cosine_ops);
create index on context_items using hnsw (embedding vector_cosine_ops);
-- Lexical
create index on chunks using gin (tsv);
create index chunks_symbol_trgm on chunks using gin (symbol gin_trgm_ops);
-- Tenancy / hot paths
create index on chunks (org_id, document_id);
create index on context_items (org_id, project_id, status);
create index on symbol_edges (org_id, repo_id, from_symbol);
create index on symbol_edges (org_id, repo_id, to_symbol);
create index on audit_logs (org_id, created_at);
create index on usage_records (org_id, created_at);
```

---

## 5. Indexing Strategy

- **Vector:** HNSW (`vector_cosine_ops`) on `embeddings.embedding` and `context_items.embedding`. Tune `m` and `ef_construction` for the recall/latency target; raise `ef_search` at query time for higher recall when needed. Re-evaluate at Tier 2–3 when p95 vector latency approaches SLO.
- **Lexical:** GIN on `chunks.tsv` (full-text) + trigram on `chunks.symbol` for identifier fuzzy match (`getUserById`). Hybrid retrieval fuses vector + lexical via reciprocal rank fusion in the Retrieval service.
- **Graph:** B-tree on `symbol_edges(from_symbol)` and `(to_symbol)` to make recursive CTEs (callers/callees, blast radius) fast.
- **Tenancy:** every multi-tenant hot table carries `(org_id, …)` composite indexes; queries are always `org_id`-filtered first.
- **Time-series:** `audit_logs`, `usage_records`, `events` partitioned by month with `(org_id, created_at)` indexes; old partitions detached/archived per retention policy. At Tier 3+, analytics on these migrate to a columnar store (ClickHouse).

---

## 6. Multi-Tenancy Strategy

**Default (Free/Pro/Team): shared schema + `org_id` discriminator + Row-Level Security.**
```sql
alter table context_items enable row level security;
create policy tenant_isolation on context_items
  using (org_id = current_setting('app.org_id')::uuid);
```
The application sets `app.org_id` per request (from the authenticated session/API key) inside a transaction; every query is then transparently scoped. This makes isolation a database-enforced invariant — even a buggy query cannot leak across tenants.

**Vector isolation:** every similarity query includes `where org_id = $1` (and usually `repo_id`/`project_id`); retrieval never crosses tenants. This is covered by automated tests as a hard invariant.

**Enterprise (Tier 3+):** optional **schema-per-tenant** or **database-per-tenant** for the largest/most sensitive customers; **per-tenant encryption keys** (BYOK) for sensitive blobs (context bundles, integration creds); **data residency** by region (`organizations.data_region`).

**Hard rule:** no query crosses `org_id` without an explicit, audited platform-admin scope (used only for support, fully logged).

---

## 7. Data Lifecycle & Retention

- **Derived data** (`documents`/`chunks`/`chunk_summaries`/`embeddings`/`symbols`) is regenerated on push: a GitHub webhook triggers incremental reindex, re-embedding only files whose `content_hash` changed. The index is tied to `repositories.last_indexed_sha`. All derived data for a deleted repo is purged on disconnect.
- **Curated data** (`context_items`) is versioned and never hard-deleted on edit; edits create a new version; supersession is explicit (`superseded_by`). Stale-flagging is a background job.
- **Operational time-series** (`messages`, `events`, `usage_records`) is retained per plan/policy (e.g., 7/30/90/365 days), enforced by partition-drop jobs.
- **Audit logs** are **immutable** (no UPDATE/DELETE; append-only), retained per compliance (1–7 years), and exportable for SOC 2 evidence (V3). At Enterprise, a hash-chain provides tamper-evidence.
- **Secrets** are never stored in the DB — only `secret_refs` pointing to a vault entry.
- **Right to deletion:** an org can export all data and request full deletion; derived + curated + operational data is purged, audit retained per legal obligation.

---

## 8. Backups & Disaster Recovery
Managed Postgres with daily automated backups + point-in-time recovery (PITR). **Restores are tested quarterly** (a backup you haven't restored is a hope, not a backup). Vector indexes are regenerable from source, so DR focuses on OLTP + curated data. RPO ≤ 5 min (PITR), RTO target ≤ 1 hour at Tier 2+. Full runbook in [DEVOPS.md](./DEVOPS.md).

---

## 9. Migrations
Drizzle migrations in CI; **forward-only**; never destructive without a backfill + dual-write/dual-read window. RLS policies are version-controlled with the schema. Embedding-model upgrades use **versioned embeddings** (a new `embeddings_v2` table or a `model_version` column) with dual-read during migration, then cutover — because re-embedding a large corpus is expensive and must be online.

---

## 10. Tradeoffs, Risks, Alternatives

- **Tradeoff — pgvector vs. dedicated vector DB:** one datastore (operational simplicity, transactional consistency between metadata and vectors) vs. specialized recall/latency at extreme scale. We choose pgvector until a measured SLO breach (D-004 revisit).
- **Tradeoff — shared schema + RLS vs. schema/DB-per-tenant:** shared is simplest and cheapest; per-tenant is stronger isolation for Enterprise. We offer per-tenant only where the deal requires it.
- **Risk — cross-tenant leakage:** mitigated by RLS + mandatory `org_id` filters + automated invariant tests.
- **Risk — embedding-model migration cost:** mitigated by versioned embeddings + content-hash caching + regenerability.
- **Alternative rejected — document DB (Mongo) as primary:** rejected; relational integrity, RLS, transactional consistency, and pgvector make Postgres the better single store for this domain.

## 11. Future Considerations
Columnar analytics store (ClickHouse) for usage/audit at Tier 3; sharding `org_id` (Citus/Spanner-class) at Tier 4; a dedicated, sharded vector store for the largest tenants; an org-wide knowledge graph spanning repos (V3) likely backed by Postgres + a graph extension (Apache AGE) or a dedicated graph store if traversal depth demands it.

## 12. Related Documents
[ARCHITECTURE.md](./ARCHITECTURE.md) · [API_DESIGN.md](./API_DESIGN.md) · [RAG.md](./RAG.md) · [SECURITY.md](./SECURITY.md) · [DEVOPS.md](./DEVOPS.md)

*Last reviewed 2026-06-19.*
