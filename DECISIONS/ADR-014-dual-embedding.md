# ADR-014 — Dual embedding (code + NL summary)

**Status:** Accepted · **Date:** 2026-06-19

## Context
Developers ask questions in English ("how do we validate webhooks?") but the corpus is code. Embedding raw code alone creates a semantic gap between query and content.

## Decision
For each code chunk, store **two embeddings**: the raw code, and an **LLM-generated natural-language summary** ("what this function does"). Retrieval matches against both; lexical search covers exact identifiers. Summaries are generated with a cheap model and content-hash cached.

## Alternatives
- **Code-only embedding:** cheaper but weaker English-query recall.
- **Summary-only:** loses exact-code matching.
- **Query-side only (HyDE):** helps but doesn't fix the corpus-side gap; can be added on top.

## Consequences
- The single biggest retrieval-quality lever after AST chunking; English queries reliably find the right code.
- Extra embedding + summarization cost at index time.

## Risks
- Summary cost/latency at scale. *Mitigation:* cheap model (Haiku-class), batched, content-hash cached (re-summarize only changed chunks).
- Summary inaccuracy could mislead retrieval. *Mitigation:* eval the retrieval impact; summaries augment, never replace, code + lexical signals.
