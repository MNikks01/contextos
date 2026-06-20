# DECISIONS.md — ContextOS

> The decisions that bind ContextOS, in a fast-scannable form for AI agents and new contributors. These mirror and localize the portfolio-level DECISION_LOG.md (IDs match) and add ContextOS-specific decisions (CD-NNN). **To deviate from any decision, add a superseding entry — never silently break one.**

## 1. Inherited portfolio decisions (authoritative source: DECISION_LOG.md)

| ID | Decision | One-line rationale |
|----|----------|--------------------|
| **D-001** | Do not train/fine-tune our own models (2–3 yrs) | Rent intelligence (Claude/GPT/Gemini); moat is context, not weights |
| **D-002** | Wedge build order: #3 → #2 → #1 | Ship fast, build audience, de-risk; ContextOS assembles proven engines |
| **D-003** | Claude default + provider abstraction | Best for code/agents; abstraction avoids lock-in + enables cost routing |
| **D-004** | PostgreSQL + pgvector (single primary store) | One DB; transactional consistency; RLS isolation; defer dedicated vector DB |
| **D-005** | TypeScript everywhere; NestJS services | Founder strength; shared types; fast hiring; Python only as a sidecar |
| **D-006** | Turborepo monorepo + shared packages | Huge shared surface across the 7 products |
| **D-007** | Open-core licensing | OSS primitives drive distribution/trust; platform is proprietary |
| **D-008** | Stripe; seat + usage hybrid pricing | AI COGS are usage-driven; hybrid balances margin + predictability |
| **D-009** | Managed-first cloud; Kubernetes later | Avoid ops tax pre-scale; split/K8s only on measured need |
| **D-010** | Customer code/data never trains any model | The #1 enterprise objection; trust is the price of entry |
| **D-011** | Documentation-first / spec-first development | High-quality specs are the leverage point for AI-agent-assisted build |

## 2. ContextOS-specific decisions

### CD-001 — The Context Handoff is the MVP wedge
- **Decision:** the MVP centers on the Context Handoff (persist context from one AI session/tool, restore it warm into another), not on teams, agents, or breadth.
- **Reason:** it directly solves the loudest pain (context loss), is the most demoable "aha," and drives activation/virality.
- **Tradeoff:** the MVP looks "narrow"; we accept this — a beloved wedge beats a shallow platform.
- **Revisit if:** activation data shows a different feature is the true "aha."

### CD-002 — Context is portable (open Handoff format)
- **Decision:** the Handoff bundle is an open, exportable format; we never hold context hostage.
- **Reason:** portability builds the developer trust that wins the market; the moat is accumulated/governed/integrated context, not lock-in (supports D-010).
- **Tradeoff:** lowers raw switching cost; mitigated because the *living platform* (governance, integrations, retrieval) is the real moat.

### CD-003 — Orchestration is the only LLM caller
- **Decision:** all provider calls route through the Orchestration plane / `packages/llm`; no other component calls a vendor SDK.
- **Reason:** one place for routing, caching, guardrails, cost attribution, observability.
- **Tradeoff:** a thin indirection layer; worth it for control + provider independence.

### CD-004 — Prefer workflows over agents
- **Decision:** default to deterministic workflows; use agents only where dynamic reasoning is required, always sandboxed/budgeted/traced/HITL-gated.
- **Reason:** reliability is the product; autonomous agents compound errors and are hard to trust/debug.
- **Revisit if:** agent reliability + eval coverage make broader autonomy safe.

### CD-005 — Tenant isolation is a tested invariant
- **Decision:** `org_id` + Postgres RLS; every retrieval query is tenant+project scoped; an automated test proves no cross-tenant access.
- **Reason:** we hold customers' crown-jewel code; a single leak is existential.
- **Non-negotiable.**

### CD-006 — Reuse #2/#3 engines rather than rebuild
- **Decision:** ContextOS integrates the Codebase Intelligence (#2) retrieval engine and the MCP Generator (#3) integration layer via shared monorepo packages.
- **Reason:** the wedge dividend — faster build, proven components.
- **Tradeoff:** coupling to those engines' APIs; acceptable in a shared monorepo.

### CD-007 — Cost-per-task is a product metric (70%+ gross-margin mandate)
- **Decision:** every LLM/tool call is metered; cost-per-task is tracked and surfaced; architecture must sustain ≥70% gross margin.
- **Reason:** AI COGS can silently destroy the business.
- **Mechanism:** routing, caching, lean retrieval, spend caps ([AI_ARCHITECTURE.md §9](./AI_ARCHITECTURE.md)).

## 3. Open Decisions (not yet made — see [PROJECT_MEMORY.md §3](./PROJECT_MEMORY.md))
- Auth provider (Auth.js/Clerk/WorkOS) · ORM final (Drizzle vs. Prisma) · embedding model/dims · pricing specifics · broker timing · sourced market data.

## 4. How to change a decision
Add a new entry (`CD-NNN` or a portfolio `D-NNN` in DECISION_LOG.md) that states the new decision, the reason, the tradeoffs, and marks the old one **"Superseded by …"**. Never delete or silently contradict a decision — agents and humans rely on this file as authoritative.

*Mirrors DECISION_LOG.md; ContextOS-specific decisions are authoritative here. Last reviewed 2026-06-19.*
