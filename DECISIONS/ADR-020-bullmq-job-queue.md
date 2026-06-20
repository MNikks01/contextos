# ADR-020 — BullMQ on Redis for the job queue

**Status:** Accepted · **Date:** 2026-06-19

## Context
Indexing, embedding, memory extraction, agent runs, and report generation are slow, bursty, and async. We need retries, idempotency, DLQs, per-queue concurrency, and backpressure — without standing up Kafka pre-scale.

## Decision
Use **BullMQ on Redis** (ADR-004) with **queues split by workload class** (`indexing`/`embedding`/`agents`/`reports`/`webhooks`), idempotency keys, per-`repo_id` serialization for reindex, and DLQs with alerting. Introduce a durable/replayable broker (managed or Kafka-class) at Tier 2–4 for cross-service fan-out.

## Alternatives
- **Postgres-as-queue:** couples queue load to the primary DB (bad under indexing storms).
- **Cloud queue (SQS/PubSub) day one:** fine, but worse local-dev DX and unnecessary before multi-service fan-out.
- **Kafka from the start:** durable/replayable but heavy ops for a small team pre-scale.

## Consequences
- Robust async processing with minimal new infra; great local-dev story.
- Queue depth becomes an autoscaling + health signal.

## Risks
- Not a durable event log for Tier 4 replay/analytics. *Mitigation:* add a broker alongside Redis at scale ([../SCALE_ANALYSIS.md](../SCALE_ANALYSIS.md)); keep job handlers idempotent so reprocessing is safe.
