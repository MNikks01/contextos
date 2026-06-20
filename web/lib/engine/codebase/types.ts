// GENERATED from engine/src/codebase/types.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// VENDORED from codebase-intelligence/engine/src/types.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Core types for the Codebase Intelligence engine (RAG over code).

export interface FileDoc {
  path: string; // repo-relative
  language: string;
  content: string;
  sizeBytes: number;
}

export interface Chunk {
  id: string;
  path: string;
  language: string;
  symbol?: string; // function/class name when known
  startLine: number;
  endLine: number;
  content: string;
}

export interface ScoredChunk extends Chunk {
  score: number;
}

export interface QueryResult {
  question: string;
  chunks: ScoredChunk[]; // cited evidence (file:line)
  answer?: string; // present only when an LLM provider is configured
  grounded: boolean; // false = retrieval-only (no LLM key)
}
