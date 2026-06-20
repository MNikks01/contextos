# PROJECT_MEMORY.md — ContextOS

> Durable working memory for humans and AI agents resuming work on ContextOS. This is the "where are we, what's true, what's next" file — the persistent state that survives between sessions. Update it at the end of every working session. Pairs with [AI_CONTEXT.md](./AI_CONTEXT.md) (what ContextOS *is*) and [DECISIONS.md](./DECISIONS.md) (why it's this way).

## 1. Current State (as of 2026-06-19)
- **Phase:** Documentation / spec-first blueprint. **No application code yet** — by design (D-011). This folder is the buildable spec.
- **Docs status:** All 27 core ContextOS documents authored at venture-grade depth + 6 AI-agent context files (`CLAUDE.md`, `AGENTS.md`, `AI_CONTEXT.md`, `PROJECT_MEMORY.md`, `DECISIONS.md`, `llms.txt`) + `mcp.json`. See [CONTEXTOS_COMPLETION_REPORT.md](./CONTEXTOS_COMPLETION_REPORT.md) for word counts and gaps.
- **Build position:** ContextOS is project #1 but is built **3rd** in the wedge (after #3 MCP Generator and #2 Codebase Intelligence), which it reuses.
- **Repo:** `/ai-startup-lab/contextos/`. Foundation docs in `/ai-startup-lab/` root (START_HERE, ROADMAP, DECISION_LOG, guides, etc.).

## 2. What Is True (facts to rely on)
- **Datastore:** PostgreSQL + pgvector, `org_id` + RLS (D-004). Tenant isolation is an invariant.
- **AI:** Claude default behind a provider abstraction (D-003); no model training (D-001); RAG is central; workflows preferred over agents.
- **Stack:** TypeScript everywhere; NestJS backend; Next.js frontend; Turborepo monorepo; Drizzle ORM; Redis/BullMQ; OpenTelemetry; Stripe (D-005/006/008).
- **Strategy:** wedge build order #3→#2→#1 (D-002); open-core (D-007); managed-first infra, K8s later (D-009); customer code never trains any model (D-010).
- **MVP centerpiece:** the **Context Handoff** (Sprint 5) — the activation "aha."

## 3. Open Questions (to resolve before/while building)
- **OQ-1:** Final auth provider — Auth.js vs. Clerk vs. WorkOS (WorkOS likely for enterprise SSO later). *Owner: founder. Decide by Sprint 1.*
- **OQ-2:** Exact embedding model + dimensions (depends on quality/cost eval). *Decide by Sprint 2.*
- **OQ-3:** Pricing specifics — per-seat vs. flat Team; free-tier query cap. *Validate with design partners.*
- **OQ-4:** Drizzle vs. Prisma final call (leaning Drizzle for raw-SQL vector control). *Decide by Sprint 0.*
- **OQ-5:** When to introduce a managed message broker vs. staying on Redis Streams (tier-dependent).
- **OQ-6:** Market sizing (TAM/SAM/SOM) needs sourced data before any priced raise (currently Fermi estimates).

## 4. Assumptions In Play
- The #2 (Codebase Intelligence) and #3 (MCP Generator) engines will exist and be reusable when ContextOS is built (per the wedge). If building flagship-first, prepend ~6 sprints to build them.
- A focused founder + AI coding agents can reach MVP in ~12 weeks given the reuse.
- The market for a tool-agnostic context layer forms over the next 1–3 years; validated by usage, not slides.

## 5. Next Steps (recommended, in order)
1. Resolve OQ-1, OQ-4 (auth + ORM) — Sprint 0 prerequisites.
2. Stand up the monorepo + infra + RLS (Sprint 0, [TASKS.md](./TASKS.md) E1.1).
3. Auth/org/billing (Sprint 1).
4. Confirm the #2 retrieval engine is available to integrate (or schedule its build first).
5. Recruit 3–5 design partners from the build-in-public / #2/#3 audience in parallel with Sprint 0–2.

## 6. Session Log (append newest at top)
- **2026-06-20 (Phase 2.1)** — Architecture & strategy hardening pass (no new scope). Created: DOCUMENT_AUDIT, SCALE_ANALYSIS (authoritative 10→100K + costs), DECISIONS/ (35 ADRs + index), GAP_ANALYSIS (vs 8 competitors), BUSINESS_VALIDATION (falsifiable plan), IMPLEMENTATION_ORDER (P1/P2/P3), FOUNDER_REVIEW (brutal), PHASE_2_1_REPORT. Resolved contradictions: ORM→Drizzle (ADR-022), RAG authority→#2 engine (ADR-035), sandbox→gVisor/Firecracker (ADR-034, proposed). Top findings: (1) over-documented vs. de-risked; (2) #2 reuse dependency gates MVP timeline; (3) RAG quality is the moat but least-proven; (4) margin unmodeled; (5) zero customer validation. Next action per review: 10 design partners + RAG eval harness BEFORE more docs. Awaiting go-ahead for Phase 2.2 (implementation-depth pass on RAG/MCP/AGENT_DESIGN + concrete schemas/prompts).
- **2026-06-19** — Authored the full ContextOS documentation blueprint at venture-grade depth (Phase 2). Added AI-agent context files (AI_CONTEXT, PROJECT_MEMORY, DECISIONS). No code yet.

## 7. How To Use This File
- **Resuming work?** Read this + [AI_CONTEXT.md](./AI_CONTEXT.md), then the doc relevant to your task.
- **Finishing a session?** Update §1 (state), §3 (open questions), §5 (next steps), and prepend a §6 entry.
- **Made a decision?** Record it in [DECISIONS.md](./DECISIONS.md) and reflect it here.

*Keep this honest and current — it is the single source of "where we are." Last reviewed 2026-06-19.*
