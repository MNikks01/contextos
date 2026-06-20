# ADR-009 — Claude as the default model

**Status:** Accepted · **Maps to:** D-003 · **Date:** 2026-06-19

## Context
ContextOS's core tasks are coding, agentic tool-use, and long-context reasoning over codebases. Model choice materially affects quality and cost.

## Decision
Default to **Claude** (Opus-class for reasoning/agents/code; Sonnet for standard Q&A; Haiku for bulk/cheap tasks), with GPT and Gemini swappable per task behind the abstraction (ADR-008). Reviewed quarterly.

## Alternatives
- **GPT-default:** strong general reasoning + ecosystem; kept as failover/diversity.
- **Gemini-default:** very large context + cost-competitive; kept for massive-context tasks.
- **Open-weight default:** cheapest at volume but ops burden + quality gap today (revisit later, ADR-010/029).

## Consequences
- Best-in-class coding/agent quality on the hot path; long context suits codebase work.
- Provider diversity preserved via the abstraction (no lock-in).

## Risks
- Over-reliance on one vendor's pricing/policy. *Mitigation:* abstraction + failover + quarterly review; route cheap tasks off Opus (ADR-026).
- Model deprecation/behavior drift. *Mitigation:* pin + test model versions; CI eval gate (ADR-027) catches regressions.
