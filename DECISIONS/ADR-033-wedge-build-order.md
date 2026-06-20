# ADR-033 — Wedge build order (#3 → #2 → #1)

**Status:** Accepted · **Maps to:** D-002 · **Date:** 2026-06-19

## Context
ContextOS (#1) is the strategic prize but is a 6–9 month cold build with no audience and unproven execution of the hard parts (RAG-over-code, MCP). The MCP Generator (#3) and Codebase Intelligence (#2) are independently valuable and *are* ContextOS's hardest internal components.

## Decision
Build in **wedge order: #3 (MCP Generator) → #2 (Codebase Intelligence) → #1 (ContextOS)**. Ship #3 fast (viral, top-of-funnel, teaches MCP), master #2 (the retrieval moat), then *assemble* ContextOS from these proven engines as reusable monorepo packages.

## Alternatives
- **Flagship-first (build #1 cold):** bolder narrative, but slower to first value, no audience, highest cold-build risk; documented as the alternative in ROADMAP §6.
- **Parallel everything:** guaranteed loss of focus for a small team (the top business risk).

## Consequences
- Usable artifact in ~6 weeks (#3) → audience + revenue + MCP mastery before the big build.
- ContextOS becomes assembly, not invention → ~12-week MVP instead of 6–9 months.
- De-risks the hardest engineering as standalone products.

## Risks
- The reuse dependency is load-bearing: ContextOS's timeline/architecture assume #2/#3 exist and are clean to import. *Mitigation:* pin #2/#3 package APIs early; if building #1 first, prepend ~6 sprints (the audit flags this as a top scheduling risk).
- A wedge product unexpectedly becomes the whole business. *Mitigation:* acceptable — it means PMF; re-prioritize toward it.
