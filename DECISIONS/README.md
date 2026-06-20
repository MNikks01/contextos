# ContextOS — Architecture Decision Records (ADRs)

> Full decision records for ContextOS. Each ADR follows the format: **Context · Decision · Alternatives · Consequences · Risks** (+ Status). ADRs are the *authoritative rationale*; the localized summary in [../DECISIONS.md](../DECISIONS.md) and the portfolio [../../DECISION_LOG.md](../../DECISION_LOG.md) point here. To change a decision, add a new ADR that supersedes the old one (mark the old `Superseded by ADR-NNN`); never delete.

**Status legend:** Accepted · Proposed · Superseded · Deprecated.

| ADR | Title | Status | Maps to |
|-----|-------|--------|---------|
| 001 | Use PostgreSQL as the single primary datastore | Accepted | D-004 |
| 002 | Use pgvector (defer dedicated vector DB) | Accepted | D-004 |
| 003 | Use NestJS for backend services | Accepted | D-005 |
| 004 | Use Redis for cache, rate-limiting, and queues | Accepted | — |
| 005 | Modular monolith first; services later | Accepted | D-009 |
| 006 | TypeScript everywhere (Python only as a sidecar) | Accepted | D-005 |
| 007 | Turborepo monorepo with shared packages | Accepted | D-006 |
| 008 | LLM provider abstraction layer | Accepted | D-003 |
| 009 | Claude as the default model | Accepted | D-003 |
| 010 | Do not train or pre-train our own models | Accepted | D-001 |
| 011 | RAG over fine-tuning for knowledge | Accepted | D-001 |
| 012 | Hybrid retrieval (vector + lexical + graph) | Accepted | — |
| 013 | AST-aware chunking via tree-sitter | Accepted | — |
| 014 | Dual embedding (code + NL summary) | Accepted | — |
| 015 | Row-Level Security for multi-tenancy | Accepted | D-004 |
| 016 | Open, portable Context Handoff format | Accepted | CD-002 |
| 017 | MCP for all tool/data integrations | Accepted | — |
| 018 | Prefer workflows over autonomous agents | Accepted | CD-004 |
| 019 | Stripe with seat + usage hybrid billing | Accepted | D-008 |
| 020 | BullMQ on Redis for the job queue | Accepted | — |
| 021 | OpenTelemetry for observability | Accepted | — |
| 022 | Drizzle as the ORM (resolves open question) | Accepted | OQ-4 |
| 023 | Next.js (App Router) for the frontend | Accepted | D-005 |
| 024 | Managed cloud first; Kubernetes later | Accepted | D-009 |
| 025 | Prompt + answer caching | Accepted | CD-007 |
| 026 | Task-class model routing | Accepted | CD-007 |
| 027 | Eval gate in CI | Accepted | — |
| 028 | Secrets in a vault, never in DB/code | Accepted | — |
| 029 | Customer data never trains any model | Accepted | D-010 |
| 030 | Open-core licensing | Accepted | D-007 |
| 031 | Orchestration is the only LLM caller | Accepted | CD-003 |
| 032 | REST primary; GraphQL for reads only | Accepted | — |
| 033 | Wedge build order (#3 → #2 → #1) | Accepted | D-002 |
| 034 | Sandbox technology for code execution (gVisor) | Proposed | new |
| 035 | Designate #2 as the authoritative RAG engine spec | Accepted | new (resolves audit contradiction) |

*35 ADRs. Last reviewed 2026-06-19.*
