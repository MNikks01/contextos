# ADR-031 — Orchestration is the only LLM caller

**Status:** Accepted · **Maps to:** CD-003 · **Date:** 2026-06-19

## Context
If many components call LLM providers directly, cost control, caching, guardrails, routing, and observability fragment and drift, and tenant/cost invariants become unenforceable.

## Decision
**All** LLM/embedding calls route through the **Orchestration plane / `packages/llm`**. No other component (UI, integrations, agents) calls a provider SDK directly. Orchestration owns routing (ADR-026), caching (ADR-025), guardrails (in/out), cost attribution, and observability.

## Alternatives
- **Let each component call providers:** simplest locally, but scatters cost/guardrails/observability and breaks the margin/safety invariants.
- **A shared library without a central service:** better, but still risks bypass; the architectural rule + the abstraction together enforce it.

## Consequences
- One choke point for cost, caching, guardrails, routing, failover, and tracing → enforceable invariants (every call metered, guardrailed, traced).
- Easier to reason about and to optimize margin.

## Risks
- Orchestration becomes a hotspot/bottleneck. *Mitigation:* it extracts into its own service at Tier 3 and scales independently; it is stateless per request.
- Developer temptation to bypass for convenience. *Mitigation:* lint/architecture rule forbidding direct provider imports outside `packages/llm`.
