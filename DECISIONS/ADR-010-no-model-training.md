# ADR-010 — Do not train or pre-train our own models

**Status:** Accepted · **Maps to:** D-001 · **Date:** 2026-06-19

## Context
There is perennial temptation (and investor curiosity) to "own the model." Pre-training a frontier model costs tens-to-hundreds of millions and requires a research org we don't have.

## Decision
**Do not pre-train or train foundation models** for the first 2–3 years. Rent intelligence via frontier APIs. The moat is context, workflow, integration, governance, and data — not weights.

## Alternatives
- **Pre-train a model:** capital-intensive, off-strategy, competes where our edge is zero.
- **Train a small specialized model early:** premature without proprietary data + proven retention.

## Consequences
- Collapses technical risk from "research lab" to "well-architected SaaS" a small team can execute.
- Model quality improves for free as providers advance; we ride the curve.
- Differentiation must come from the layers we own (context/governance), which is the strategy anyway.

## Risks
- Vendor dependency + per-token COGS in our cost structure. *Mitigation:* abstraction + routing + caching + spend caps; D-001 revisit conditions defined for *fine-tuning/distillation* (not pre-training) at scale.
- "Not building a model" perceived as un-ambitious. *Mitigation:* the ambition is owning the context layer; the model is a commodity input.
