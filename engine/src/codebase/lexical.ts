// VENDORED from codebase-intelligence/engine/src/lexical.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Lexical retrieval (BM25) — catches exact identifiers / error strings that pure
// vector search misses. Fused with vector results for hybrid retrieval.

import { tokenize } from "./tokenize.ts";
import type { Chunk, ScoredChunk } from "./types.ts";

const K1 = 1.5;
const B = 0.75;

export class LexicalIndex {
  private chunks: Chunk[] = [];
  private docTokens: string[][] = [];
  private df = new Map<string, number>();
  private avgLen = 0;

  add(chunk: Chunk): void {
    this.chunks.push(chunk);
    this.docTokens.push(tokenize(chunk.content));
  }

  finalize(): void {
    for (const toks of this.docTokens) {
      for (const t of new Set(toks)) this.df.set(t, (this.df.get(t) ?? 0) + 1);
    }
    const total = this.docTokens.reduce((s, t) => s + t.length, 0);
    this.avgLen = total / (this.docTokens.length || 1);
  }

  search(query: string, k: number): ScoredChunk[] {
    const q = tokenize(query);
    const N = this.chunks.length;
    const scored: ScoredChunk[] = this.docTokens.map((toks, i) => {
      const tf = new Map<string, number>();
      for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
      let score = 0;
      for (const term of q) {
        const f = tf.get(term) ?? 0;
        if (!f) continue;
        const df = this.df.get(term) ?? 0.5;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        score += idf * (f * (K1 + 1)) / (f + K1 * (1 - B + (B * toks.length) / this.avgLen));
      }
      return { ...this.chunks[i], score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.filter((s) => s.score > 0).slice(0, k);
  }
}
