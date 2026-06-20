# ADR-012 — Hybrid retrieval (vector + lexical + graph)

**Status:** Accepted · **Date:** 2026-06-19

## Context
Code retrieval has two failure modes: pure semantic (vector) search misses exact identifiers (`getUserById`, error strings); pure lexical misses meaning ("where do we handle auth?"). Cross-file logic needs structural awareness.

## Decision
Use **hybrid retrieval**: vector (pgvector HNSW cosine) + lexical (Postgres full-text + trigram) fused via **reciprocal rank fusion**, then **symbol-graph expansion** (pull callers/callees of matched symbols), then re-ranking (ADR using a cross-encoder/LLM scorer).

## Alternatives
- **Vector-only:** misses identifiers; the most common naive mistake.
- **Lexical-only:** misses semantic intent.
- **Vector + lexical without graph:** misses cross-file reasoning ("how does a request flow A→DB?").

## Consequences
- Materially higher recall + precision on real code questions; cross-file answers possible.
- More moving parts (fusion weights, graph depth) to tune and evaluate.

## Risks
- Fusion/graph tuning is fiddly and corpus-dependent. *Mitigation:* eval-driven tuning (recall@k/MRR) in CI; bounded graph-expansion depth to control cost/latency.
- Graph build adds indexing cost. *Mitigation:* incremental, content-hash-cached (ADR-013/014).
