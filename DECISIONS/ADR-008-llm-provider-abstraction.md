# ADR-008 — LLM provider abstraction layer

**Status:** Accepted · **Maps to:** D-003 · **Date:** 2026-06-19

## Context
We depend on frontier LLM APIs (Claude/GPT/Gemini) whose quality, price, and availability shift monthly. Binding product code to one vendor SDK creates lock-in and outage fragility.

## Decision
Build a thin **`LLMProvider` abstraction** in `packages/llm` (`complete`/`stream`/`withTools`/`embed`) with `ClaudeProvider | OpenAIProvider | GeminiProvider` implementations behind a router. **No other component calls a vendor SDK** (see ADR-031).

## Alternatives
- **Use a vendor SDK directly:** simplest, but lock-in + no failover + scattered cost/observability.
- **Adopt a heavy framework (LangChain) as the abstraction:** more than we need; couples us to its model and churn.

## Consequences
- Swap providers, route by cost/capability (ADR-026), fail over on outage, and centralize retries/timeouts/caching/observability/cost attribution.
- Quarterly model review can change defaults without product changes.

## Risks
- Lowest-common-denominator feature set (provider-specific capabilities hidden). *Mitigation:* capability flags expose provider-specific features when worth it.
- Abstraction drift/over-engineering. *Mitigation:* keep it thin; it wraps calls, it is not an orchestration framework.
