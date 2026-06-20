# ADR-004 — Use Redis for cache, rate-limiting, and queues

**Status:** Accepted · **Date:** 2026-06-19

## Context
We need: a low-latency cache (prompt/answer/session), distributed rate limiting + spend-cap counters, and a job queue (indexing, embedding, agents, reports). Adding multiple specialized systems early is operationally expensive.

## Decision
Use **Redis** for caching, rate limiting, and (via BullMQ, ADR-020) the job queue and event streams, until scale forces a dedicated broker.

## Alternatives
- **Separate systems** (Memcached + a managed queue + Kafka) day one: more "correct" per concern, too much surface for a small team.
- **Postgres-as-queue:** simple but couples queue load to the primary DB (bad under indexing storms).
- **Cloud-native (SQS/PubSub) from the start:** viable, but Redis Streams suffice to mid-scale and keep local-dev simple.

## Consequences
- One system for three concerns → minimal ops; great local-dev story (Docker Compose).
- BullMQ gives retries, DLQs, idempotency, and per-queue concurrency.

## Risks
- Redis is not a durable, replayable event log for Tier 4 fan-out. *Mitigation:* introduce a managed/Kafka-class broker at Tier 2–4 alongside Redis (ADR-020, [../SCALE_ANALYSIS.md](../SCALE_ANALYSIS.md)).
- Single-point cache failure degrades latency. *Mitigation:* caches are advisory (miss → recompute); HA Redis at Tier 2+.
