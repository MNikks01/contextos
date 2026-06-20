# ADR-025 — Prompt + answer caching

**Status:** Accepted · **Maps to:** CD-007 · **Date:** 2026-06-19

## Context
LLM tokens are the dominant variable cost ([../SCALE_ANALYSIS.md](../SCALE_ANALYSIS.md)). Many calls share a large, stable prefix (system prompt + curated context), and many questions repeat against an unchanged repo.

## Decision
Use **two caches**: (1) **provider prompt caching** of the stable system-prompt + curated-context prefix; (2) an **answer cache** keyed on `(repo SHA + normalized question + scope)` returning prior grounded answers, invalidated on reindex of relevant files.

## Alternatives
- **No caching:** simplest, margin-destroying at scale.
- **Cache everything aggressively:** risks stale/wrong answers after code changes.

## Consequences
- Major COGS reduction on repeated/similar calls; faster responses (cache hits).
- Cache-hit rate becomes a tracked margin KPI.

## Risks
- Stale answers after code changes. *Mitigation:* answer-cache key includes repo SHA; invalidate on reindex of cited files; TTL bounds; never cache low-confidence/"I don't know".
- Prompt-cache TTL (~5 min) misses across bursts. *Mitigation:* batch related calls; warm the prefix for active sessions.
- Cross-tenant cache leakage. *Mitigation:* cache keys are `org_id`-namespaced; an invariant test covers it.
