// VENDORED from codebase-intelligence/engine/src/rerank.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Heuristic re-ranker (no model/key needed). Re-scores fused candidates with signals
// that hybrid retrieval under-weights: filename match, symbol-name match, and query-term
// coverage. This is the cheap analogue of a cross-encoder; the documented production
// upgrade is an LLM/cross-encoder re-ranker.

import { tokenize } from "./tokenize.ts";
import type { ScoredChunk } from "./types.ts";

export function rerank(question: string, candidates: ScoredChunk[]): ScoredChunk[] {
  const q = new Set(tokenize(question));
  const qSize = Math.max(q.size, 1);

  const rescored = candidates.map((c, fusionRank) => {
    let s = 1 / (fusionRank + 1); // retain some of the fusion ordering

    // filename/path tokens that match the query (e.g. "descriptions" -> descriptions.ts)
    const pathMatches = tokenize(c.path).filter((t) => q.has(t)).length;
    s += pathMatches * 0.6;

    // symbol-name match (e.g. "build" -> build())
    if (c.symbol) {
      const symMatches = tokenize(c.symbol).filter((t) => q.has(t)).length;
      s += symMatches * 0.8;
    }

    // query-term coverage in the chunk body
    const body = new Set(tokenize(c.content));
    const covered = [...q].filter((t) => body.has(t)).length;
    s += (covered / qSize) * 0.9;

    return { ...c, score: s };
  });

  rescored.sort((a, b) => b.score - a.score);
  return rescored;
}
