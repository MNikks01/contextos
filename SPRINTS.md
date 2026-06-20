# ContextOS — SPRINTS

> Time-sequenced execution plan: 2-week sprints from setup through MVP, V1, and into V2. Each sprint has a goal, scope (referencing [TASKS.md](./TASKS.md) epics), exit criteria, and a demoable increment. Assumes a focused founder + AI coding agents, building ContextOS *after* the Codebase Intelligence (#2) and MCP Generator (#3) engines exist to reuse (the wedge order, DECISION_LOG.md D-002).

## 1. Executive Summary

ContextOS reaches a launchable MVP in **~6 two-week sprints (~12 weeks)** when assembled from the reusable #2 (retrieval) and #3 (MCP) engines, plus a Sprint 0 for setup. V1 (team-ready, the revenue core) is ~4 more sprints; V2 (agents, integrations, the platform) is ~8 more. The sequencing is **wedge-first and demo-driven**: every sprint ends with a demoable increment, and Sprint 5 (Context Handoff) is the deliberate climax of the MVP because it produces the visceral "aha" — a fresh AI session that starts *warm* and stops repeating mistakes — that drives activation, word-of-mouth, and the Product Hunt launch. If ContextOS is built flagship-first (without the prior #2/#3 engines), prepend ~6 sprints to build the retrieval and MCP layers, per ROADMAP.md §6.

The operating cadence inside every sprint: ship one demoable increment, keep the CI eval gate green (no quality regressions), update the relevant spec docs (D-011), and publish one build-in-public artifact (the founder's distribution engine).

---

## 2. Sprint 0 — Setup (Week 0)
**Goal:** a developer can run the whole system locally and CI is green.
**Scope:** E1.1 (monorepo, Docker Compose with Postgres+pgvector/Redis/otel, CI, base NestJS + Next.js, Drizzle + RLS scaffolding). Freeze the spec docs as v1 of the blueprint.
**Exit criteria:** `pnpm dev` runs web + api + workers; `docker compose up` brings up infra; CI runs lint/typecheck/test/build; the tenant-isolation RLS test passes.
**Demo:** the empty app boots, a health endpoint returns, the isolation test is green.

## 3. Sprint 1 — Auth, Org, Billing (Weeks 1–2)
**Goal:** a user can sign up, create an org, invite a teammate, and upgrade to Pro.
**Scope:** E1.2 (auth/org/RBAC/RLS, API keys), E1.3 (Stripe Free/Pro, usage metering, spend-cap middleware).
**Exit criteria:** GitHub OAuth signup → org creation → member invite with role; RLS blocks cross-org reads (tested); Stripe checkout upgrades the org; a usage record is written on a stubbed call; a spend cap returns 402.
**Demo:** sign up, create an org, invite a teammate, upgrade to Pro in the UI.
**Risk watch:** auth edge cases; keep it boring (use a proven auth library, don't roll your own).

## 4. Sprint 2 — Projects, Ingestion, Retrieval reuse (Weeks 3–4)
**Goal:** connect a repo → it indexes → semantic + keyword search returns relevant code.
**Scope:** E2.1 (project/repo connect + webhook + ingestion kickoff), E3 (integrate `packages/rag`: AST chunker, dual embedding, content-hash cache, pgvector HNSW + FTS, hybrid retrieval + rerank, symbol graph).
**Exit criteria:** connecting a real repo indexes it; `/search` returns ranked file:line snippets; reindex on a push touches only changed files; vector queries are `org_id`+`project_id` scoped.
**Demo:** connect a public repo, watch it index, search it semantically and by identifier.
**Risk watch:** indexing throughput + embedding cost — verify the content-hash cache works.

## 5. Sprint 3 — AI Q&A grounded in code (Weeks 5–6)
**Goal:** ask the codebase a question and get a grounded, cited, streamed answer with visible cost.
**Scope:** E4 (provider abstraction + model router, prompt/answer caching, `/ask` with SSE + citations + confidence, grounding + "I don't know", per-request cost), E10 partial (cost surfaced in UI), E11 start (first golden Q&A set).
**Exit criteria:** `/ask` streams tokens → citations → done-event with `cost_usd`/model; low-confidence retrieval returns "I don't know"; the first golden eval set runs in CI.
**Demo:** ask "how does auth work here?" and get a correct answer citing file:line, with the cost shown.
**Risk watch:** hallucination — enforce grounding + citations from the start; this is where trust is won or lost.

## 6. Sprint 4 — Context Store & Memory (Weeks 7–8)
**Goal:** the team can capture decisions/conventions (manually and auto-proposed), and answers respect them.
**Scope:** E2.2 (context items CRUD, versioning, supersede, embed, stale-flag), E2.3 (memory extraction from PRs/commits + review UI, "remember this"), E2.4 (feedback loop).
**Exit criteria:** decisions/conventions are recorded and versioned; the extractor proposes candidates from a real PR; `/ask` answers reflect approved conventions; feedback writes to the evals dataset.
**Demo:** correct the AI once, capture it as a convention, ask again — the AI now respects it.
**Risk watch:** extraction precision — keep humans in the loop (propose, don't auto-commit).

## 7. Sprint 5 — Context Handoff (Weeks 9–10) ⭐ the wedge climax
**Goal:** export context and restore it warm into a fresh AI session (Claude Code/Cursor) so the AI starts warm and stops repeating mistakes.
**Scope:** E5 (bundle export JSON + generated `CLAUDE.md`/`AGENTS.md`, import/restore, diff; CLI `pull`/`push`; MCP `/load-context` prompt; auto-sync to repo files; scoped handoff).
**Exit criteria:** a bundle exports the open Handoff format; importing into a new session demonstrably loads conventions/decisions; `contextos pull/push` works in a terminal; the MCP `/load-context` prompt restores context into an MCP host.
**Demo:** the headline demo — a fresh Claude Code session with no context makes a known mistake; load the bundle; it stops. **This is the Product Hunt money shot.**
**Risk watch:** the demo must be airtight; rehearse it; this is the activation moment.

## 8. Sprint 6 — Observability, Evals, Polish → Private Beta (Weeks 11–12)
**Goal:** cost + quality are visible, evals gate CI, and the product is ready for design partners.
**Scope:** E10 (dashboards: cost/quality/usage; alerts; "show context sent"), E11 (golden evals + CI gate; production sampling), onboarding flow + polish.
**Exit criteria:** an eng lead can see AI spend + answer-helpfulness; CI blocks a deliberate quality regression; onboarding gets a new user to the Handoff "aha" in < 10 minutes.
**Demo:** the dashboard + the full new-user journey to first warm session.
**→ MVP COMPLETE (~12 weeks).** Launch **Private Beta** with 10–20 design-partner teams; begin Product Hunt prep.

---

## 9. V1 Sprints — Team-Ready (Weeks 13–20)

### Sprint 7 — Teams & Collaboration (Weeks 13–14)
Shared workspaces + team-wide context, invites, comments, @mentions, activity feed, context review/approval, new-hire guided tour. **Exit:** a team works from one shared context; a new hire takes the tour and loads team context on day one.

### Sprint 8 — Governance basics (Weeks 15–16)
Audit logs on all actions, RBAC hardening, PII redaction, spend caps + alerts at team level. **Exit:** every AI action is audited; an admin sets a team spend cap and gets an alert at threshold.

### Sprint 9 — Search & Reporting + Auto-docs (Weeks 17–18)
Unified semantic+keyword search across context/code/docs; usage/cost/adoption reports; living auto-docs + architecture map (reuse #2). **Exit:** the eng-lead reporting dashboard is real; auto-docs regenerate on change.

### Sprint 10 — Reliability & Beta → GA (Weeks 19–20)
Multi-provider failover, graceful degradation, backups + tested DR restore; Team tier billing live. **Exit:** **V1 GA** — teams can adopt and pay; survive a simulated provider outage.

---

## 10. V2 Sprints — Agents, Integrations, Platform (Weeks 21+)
- **S11–12: MCP Integration Hub** (E6) — connect GitHub/Notion/Jira/Slack/DB; ContextOS-as-MCP-server; central governance of tool calls.
- **S13–14: Agent runtime + observability** (E9, reuse #4) — single-agent loop, budgets, sandbox, trajectory traces, failure taxonomy, replay.
- **S15–16: Guardrails console + policy engine** (E8 V2) — injection/PII/tool-permission/HITL configuration; org policies.
- **S17–18: Automation/workflows + marketplace hooks** (E9, E6) — PR/issue triggers; install community items (feeds #7).

## 11. V3 (quarter-scale, Year 2+)
SSO/SAML/SCIM, on-prem/VPC (Helm), SOC 2 Type II, audit exports, multi-org, marketplace GA. Sequenced against enterprise pipeline, not a fixed calendar.

---

## 12. Cadence, Tradeoffs, Risks
**Cadence (every sprint):** one demoable increment; CI eval gate green; specs updated (D-011); one build-in-public post; monthly metric review (activation/retention/MRR/COGS).
**Tradeoffs:** we front-load the wedge (Handoff at Sprint 5) even slightly ahead of polish, because activation beats completeness pre-PMF. We defer teams/agents to V1/V2 to protect MVP focus.
**Risks:** (1) the Handoff demo not landing — mitigated by making Sprint 5 the climax and rehearsing the demo; (2) eval gate slowing iteration — mitigated by fast golden sets; (3) scope creep from V2 features — mitigated by sprint-goal discipline and the [FEATURES.md §8](./FEATURES.md) prioritization method.
**Alternatives:** flagship-first (build #2/#3 inside ContextOS) — slower to first value, higher cold-build risk; rejected per D-002 but documented in ROADMAP.md §6.

## 13. Future Considerations
Once V1 ships, sprints become demand-driven (enterprise pipeline pulls V3; marketplace demand pulls #7 hooks). The sprint structure should shift from feature-sequenced to metric-sequenced (optimize the activation→retention→expansion funnel) once there are enough users to instrument it.

## 14. Related Documents
[TASKS.md](./TASKS.md) · [FEATURES.md](./FEATURES.md) · ROADMAP.md · [GTM.md](./GTM.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

*Last reviewed 2026-06-19.*
