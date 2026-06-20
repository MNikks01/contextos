# ADR-001 — Use PostgreSQL as the single primary datastore

**Status:** Accepted · **Maps to:** D-004 · **Date:** 2026-06-19

## Context
ContextOS stores relational/operational data (orgs, users, billing, audit), curated knowledge (decisions/conventions), and derived knowledge (chunks, embeddings, symbol graph). We need transactional consistency, strong multi-tenancy, and — via extensions — vector search, full-text, and graph-ish queries, operated by a tiny team pre-scale.

## Decision
Use **PostgreSQL** as the single primary datastore for all of the above, leaning on extensions (pgvector, full-text, pg_trgm) rather than introducing separate specialized stores early.

## Alternatives
- **Polyglot persistence day one** (Postgres + Pinecone + ClickHouse + a graph DB): more "right" per workload but enormous operational surface for a small team; premature.
- **MySQL:** weaker extension ecosystem (no first-class pgvector equivalent), weaker RLS story.
- **A document DB (Mongo) as primary:** loses relational integrity, RLS, and transactional consistency that this domain needs.

## Consequences
- One system to operate, back up, secure, and reason about; transactional consistency between metadata and vectors.
- RLS gives database-enforced tenant isolation.
- Future split (OLTP vs. vector vs. analytics) is deferred to measured scale triggers ([../SCALE_ANALYSIS.md](../SCALE_ANALYSIS.md)).

## Risks
- Postgres becomes a contention point at Tier 2–3 (OLTP vs. vector vs. time-series). *Mitigation:* read replicas, partitioning, domain split, and (later) sharding — all gated on measured IO/p95 breaches, not anticipation.
