# ADR-013 — AST-aware chunking via tree-sitter

**Status:** Accepted · **Date:** 2026-06-19

## Context
Chunk quality dominates RAG quality. Naive fixed-size character chunks split functions mid-body and destroy semantic units, wrecking retrieval and citations.

## Decision
Chunk **code by AST** using **tree-sitter** — split on function/class/module boundaries, attach metadata (path, symbol, language, start/end line, imports), and overlap-split oversized functions while preserving signature/docstring. Non-code (README/ADR/docs) uses recursive/heading chunking.

## Alternatives
- **Fixed-size + overlap:** trivial but semantically blind; the common low-quality default.
- **LLM-based chunking:** higher quality, far too expensive at index scale.
- **One language's parser only:** doesn't cover polyglot repos.

## Consequences
- Chunks are semantically whole → better embeddings, better retrieval, clean file:line citations.
- tree-sitter's many grammars make adding languages incremental (TS/JS, Python first; Go/Java/etc. by demand).

## Risks
- Per-language grammar maintenance + edge cases (generated code, huge files). *Mitigation:* a fallback chunker for unknown formats; cap chunk sizes; eval coverage per language.
- Parser CPU cost at scale. *Mitigation:* async workers, incremental (changed files only), content-hash cache.
