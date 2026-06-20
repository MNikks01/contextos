// VENDORED from codebase-intelligence/engine/src/retrieve.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Reciprocal Rank Fusion — combine vector + lexical rankings into one.

import type { ScoredChunk } from "./types.ts";

export function rrfFuse(lists: ScoredChunk[][], k = 60): ScoredChunk[] {
  const acc = new Map<string, { chunk: ScoredChunk; score: number }>();
  for (const list of lists) {
    list.forEach((chunk, rank) => {
      const add = 1 / (k + rank + 1);
      const prev = acc.get(chunk.id);
      if (prev) prev.score += add;
      else acc.set(chunk.id, { chunk, score: add });
    });
  }
  return [...acc.values()]
    .sort((a, b) => b.score - a.score)
    .map((x) => ({ ...x.chunk, score: x.score }));
}
