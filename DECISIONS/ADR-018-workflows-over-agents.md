# ADR-018 — Prefer workflows over autonomous agents

**Status:** Accepted · **Maps to:** CD-004 · **Date:** 2026-06-19

## Context
Agents are exciting and a buyer expectation, but autonomous multi-step loops compound errors, are hard to debug, have variable cost, and erode trust when they fail in front of paying engineers.

## Decision
**Default to deterministic workflows** (chained LLM calls + tools in code). Use **agents only where the next step genuinely depends on dynamic context** (multi-hop investigation, "implement this issue"), always sandboxed, budgeted (steps/tokens/$/time), traced, and HITL-gated on risky actions. **Operational boundary:** if the control flow can be enumerated in advance, it is a workflow, not an agent.

## Alternatives
- **Agent-first ("autonomous everything"):** flashy, unreliable, expensive, hard to govern — wrong for a trust-critical product.
- **No agents at all:** misses genuinely dynamic tasks and a real buyer expectation.

## Consequences
- Higher reliability, debuggability, and predictable cost on critical paths.
- Agents are a constrained, well-instrumented capability, not the default.

## Risks
- The workflow/agent line blurs in practice. *Mitigation:* the explicit boundary above; agent use requires the full guardrail set; eval each agent's success rate before broadening autonomy.
