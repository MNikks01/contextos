# ADR-026 — Task-class model routing

**Status:** Accepted · **Maps to:** CD-007 · **Date:** 2026-06-19

## Context
Using a frontier reasoning model for trivial tasks (classification, summaries, extraction) is wasteful; using a cheap model for hard reasoning/agents degrades quality. A single default model is the wrong answer either way.

## Decision
Route by **task class** in the Orchestration layer: `reasoning/agents/code` → Opus-class; `standard Q&A/summaries` → Sonnet-class; `bulk/cheap` (classification, extraction, memory) → Haiku-class; `massive-context` → largest cost-effective window. Routing is **policy-aware** (org's allowed models) and **budget-aware** (downgrade/queue near a spend cap).

## Alternatives
- **Single default model:** simpler, but either over-pays or under-performs.
- **Manual per-feature model selection:** brittle; routing centralizes the policy.

## Consequences
- Big margin lever (cheap tasks cost ~an order of magnitude less); quality preserved where it matters.
- Provider failover and cost-based routing live in one place (ADR-008/031).

## Risks
- Misrouting a hard task to a cheap model hurts quality. *Mitigation:* conservative task-class mapping; CI evals catch quality regressions; allow per-call override.
- Routing logic complexity. *Mitigation:* keep it a small, testable function; quarterly review with model/price changes.
