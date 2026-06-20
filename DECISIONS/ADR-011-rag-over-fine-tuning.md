# ADR-011 — RAG over fine-tuning for knowledge

**Status:** Accepted · **Maps to:** D-001 · **Date:** 2026-06-19

## Context
To make the LLM answer accurately about a specific, *constantly changing* private codebase, we can fine-tune on it, stuff it all into context, or retrieve relevant pieces (RAG).

## Decision
Use **RAG** as the primary mechanism for grounding answers in code and curated context. Defer fine-tuning (D-001); use long-context "stuffing" only for small/whole-file tasks.

## Alternatives
- **Fine-tune per customer:** expensive, stale immediately (code changes hourly), no attribution, brittle across model upgrades.
- **Long-context everything:** simple but costly per call, weak attribution, and doesn't scale to large repos.

## Consequences
- Cheaper than fine-tuning, updatable in real time (reindex on push), attributable (citations), avoids hallucination via grounding.
- Correctness becomes a *retrieval-quality* problem we can measure and improve (ADR-012/013/014, ADR-027).

## Risks
- RAG quality is hard; mediocre retrieval = mediocre answers = lost trust. *Mitigation:* over-invest in chunking/hybrid/graph/rerank + CI evals; "I don't know" on low confidence. This is the product's core technical bet.
