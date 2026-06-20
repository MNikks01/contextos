# ADR-027 — Eval gate in CI

**Status:** Accepted · **Date:** 2026-06-19

## Context
LLM output quality silently regresses when prompts, models, chunking, or retrieval change. Unit tests don't catch faithfulness/citation/recall regressions. Quality *is* the product (trust).

## Decision
Maintain **golden-dataset evals** (codebase Q&A with verified answers + expected citations, memory extraction, agent tasks) in `packages/evals`, scored by **LLM-as-judge + deterministic checks** (citation existence/support, schema validity), and run them as a **CI gate** (`pnpm test:eval`) that blocks merges on regression. Sample production traffic + feedback to grow the dataset.

## Alternatives
- **Manual QA:** doesn't scale, not repeatable, misses regressions.
- **No evals:** quality drifts; trust erodes; the most dangerous "save time" choice.

## Consequences
- Prompt/model/retrieval changes are safe to make (regressions caught pre-merge).
- Eval scores become a publishable trust asset and a product KPI.
- Reuses the harness that is also the #4 product.

## Risks
- Eval LLM cost + flakiness (judge variance). *Mitigation:* small focused golden sets; deterministic checks where possible; judge prompts version-pinned; thresholds, not exact-match.
- Slows iteration. *Mitigation:* fast subset on PR, full suite nightly.
