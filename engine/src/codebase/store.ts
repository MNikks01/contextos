// VENDORED from codebase-intelligence/engine/src/store.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// In-memory vector index (cosine over normalized vectors).
// PRODUCTION: swap for pgvector (HNSW) — same add()/search() contract.

import type { Chunk, ScoredChunk } from "./types.ts";

export class VectorIndex {
  private chunks: Chunk[] = [];
  private vectors: number[][] = [];

  add(chunk: Chunk, vector: number[]): void {
    this.chunks.push(chunk);
    this.vectors.push(vector);
  }

  get size(): number {
    return this.chunks.length;
  }

  search(query: number[], k: number): ScoredChunk[] {
    const scored: ScoredChunk[] = this.vectors.map((v, i) => ({
      ...this.chunks[i],
      score: dot(query, v), // vectors are L2-normalized -> dot == cosine
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
