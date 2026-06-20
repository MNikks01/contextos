# ADR-035 — Designate Codebase Intelligence (#2) as the authoritative RAG engine spec

**Status:** Accepted (resolves an audit contradiction) · **Date:** 2026-06-19

## Context
The audit ([../DOCUMENT_AUDIT.md](../DOCUMENT_AUDIT.md)) found RAG-over-code described in three places — `contextos/RAG.md`, `contextos/AI_ARCHITECTURE.md`, and `codebase-intelligence/RAG.md` — with no clear authority, risking drift and duplicated/contradictory specs.

## Decision
**`codebase-intelligence/RAG.md` (the #2 engine) is the single authoritative specification** for the RAG-over-code engine (chunking, embedding, hybrid+graph retrieval, rerank, evals). **`contextos/RAG.md` becomes the *integration* spec** — how ContextOS consumes the engine and adds its *curated-context* retrieval source on top. `AI_ARCHITECTURE.md` references both and does not redefine the engine.

## Alternatives
- **Duplicate the full RAG spec in ContextOS:** guarantees drift; rejected.
- **Make ContextOS authoritative:** wrong — #2 is the engine that ships first and is reused by #1 and #6.

## Consequences
- One source of truth for the retrieval engine; ContextOS docs shrink to the integration + curated-context concerns.
- Reinforces the reuse architecture (ADR-007/033): the engine is a shared package, specified once.

## Risks
- The reuse dependency is reaffirmed as load-bearing (timeline depends on #2). *Mitigation:* pin the #2 engine's package API; ContextOS RAG.md documents exactly which #2 capabilities it depends on, so a contract exists.
