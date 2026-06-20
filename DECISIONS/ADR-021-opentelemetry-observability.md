# ADR-021 — OpenTelemetry for observability

**Status:** Accepted · **Date:** 2026-06-19

## Context
Every AI call has a cost and a quality dimension, and agent trajectories span many steps/tools. We need vendor-neutral traces/metrics/logs with **cost attribution on every LLM/tool call**, and we want to dogfood the same primitives that power Agent Monitoring (#4).

## Decision
Instrument everything with **OpenTelemetry**, exporting to Prometheus/Grafana (metrics), a trace backend, and Sentry (errors). AI spans carry model/tokens/cost/cache/retrieval-k attributes. Tail-based sampling keeps errors + slow + expensive traces.

## Alternatives
- **A single vendor (Datadog):** great UX, high cost, lock-in.
- **Roll-your-own logging:** cheap initially, no traces/correlation, dead end.

## Consequences
- Vendor-neutral; portable across backends; one standard for system + AI observability.
- Cost-per-task and quality signals are first-class, enabling margin defense and the #4 product.

## Risks
- OTel setup complexity + sampling tuning. *Mitigation:* wrap in `packages/observability`; sensible defaults; tail-sampling for cost control.
- Trace data volume cost at scale. *Mitigation:* sampling + retention policies; columnar store for high-volume telemetry at Tier 3+.
