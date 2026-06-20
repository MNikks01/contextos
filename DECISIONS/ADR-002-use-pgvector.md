# ADR-002 — Use pgvector; defer a dedicated vector DB

**Status:** Accepted · **Maps to:** D-004 · **Date:** 2026-06-19

## Context
RAG over code needs nearest-neighbor search over millions of embeddings. Options range from "vectors inside Postgres" to a dedicated vector engine (Pinecone/Weaviate/Qdrant/Milvus).

## Decision
Use **pgvector with HNSW indexes inside the primary Postgres** until a measured threshold forces a dedicated store. **Migration threshold (quantified): >50M vectors per tenant OR sustained vector query p95 > the 4s answer SLO.**

## Alternatives
- **Pinecone/Qdrant/Weaviate from day one:** best-in-class recall/latency at extreme scale, but adds a second datastore, a sync problem (metadata↔vectors), and cost/ops we don't need pre-scale.
- **FAISS/in-process:** no persistence/multi-tenancy story for a SaaS.

## Consequences
- Transactional consistency between chunks and their vectors; one store; simple ops.
- Hybrid retrieval (vector + Postgres FTS) lives in one place.
- HNSW index is RAM-resident → instance sizing is driven by vector count at Tier 2+ (a real cost, [../SCALE_ANALYSIS.md](../SCALE_ANALYSIS.md)).

## Risks
- pgvector recall/latency trails specialized engines at very large scale. *Mitigation:* tune `m`/`ef_*`; partition by tenant; isolate the vector workload on its own Postgres instance before migrating; the threshold above triggers migration with a versioned-embeddings, dual-read cutover.
