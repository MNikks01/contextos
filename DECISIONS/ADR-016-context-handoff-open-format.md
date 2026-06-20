# ADR-016 — Open, portable Context Handoff format

**Status:** Accepted · **Maps to:** CD-002, D-010 · **Date:** 2026-06-19

## Context
The Context Handoff (export context from one AI session/tool, restore it warm into another) is the wedge. A natural instinct is to make the format proprietary to maximize lock-in.

## Decision
Make the **Handoff bundle an open, documented, exportable format** (JSON + generated `CLAUDE.md`/`AGENTS.md`/`llms.txt`). Customers can export and use their context anywhere.

## Alternatives
- **Proprietary, non-exportable format:** maximizes raw lock-in, but kills the developer trust required to win bottom-up, and contradicts D-010 (don't hold context hostage).

## Consequences
- Portability builds trust → adoption (the thing that actually wins developers).
- Positions the format to become a de-facto standard (like MCP for tools) → ecosystem centrality, a stronger moat than lock-in.
- The real moat is the *living, governed, integrated* platform, not the raw bundle (see RISKS moat analysis).

## Risks
- "Portability lowers switching cost." *Mitigation:* exporting a snapshot ≠ replicating the platform (retrieval, governance, integrations, freshness); switching cost lives in the *living* system + accumulated usage.
- A competitor adopts our format. *Mitigation:* that grows the standard we anchor; we compete on the platform, not the file.
