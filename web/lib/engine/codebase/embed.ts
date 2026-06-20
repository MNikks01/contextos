// GENERATED from engine/src/codebase/embed.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// VENDORED from codebase-intelligence/engine/src/embed.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Embeddings. Pluggable provider with a zero-network LOCAL fallback (hashed
// token-frequency vectors) so the pipeline runs + is testable without keys.
//
// PRODUCTION: implement EmbeddingProvider with a real model (OpenAI / Voyage / Gemini)
// for true semantic retrieval; everything downstream (store, retrieve) is unchanged.

import { tokenize } from "./tokenize";

export interface EmbeddingProvider {
  readonly dim: number;
  embed(texts: string[]): Promise<number[][]>;
}

function hash(s: string, salt = ""): number {
  let h = 2166136261;
  const str = s + salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic, dependency-free "embedding": a hashed bag-of-tokens vector,
// L2-normalized. Approximates lexical similarity (good enough to build + eval the
// pipeline); swap for a real model to get true semantics.
export class LocalHashEmbedding implements EmbeddingProvider {
  readonly dim: number;
  constructor(dim = 512) {
    this.dim = dim;
  }
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.vec(t));
  }
  private vec(text: string): number[] {
    const v = new Array(this.dim).fill(0);
    for (const tok of tokenize(text)) {
      v[hash(tok) % this.dim] += 1;
      v[hash(tok, "#2") % this.dim] += 0.5; // second hash reduces collisions
    }
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map((x) => x / norm);
  }
}

export function pickEmbedder(): EmbeddingProvider {
  // if (process.env.OPENAI_API_KEY) return new OpenAIEmbedding(...);  // production
  return new LocalHashEmbedding();
}
