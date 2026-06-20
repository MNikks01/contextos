// GENERATED from engine/src/codebase/index.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// VENDORED from codebase-intelligence/engine/src/index.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Codebase Intelligence engine — index a repo, then search / ask with citations.
// Hybrid retrieval (vector + lexical), zero-network by default.

import { ingestDir } from "./ingest";
import { chunkAll } from "./chunk";
import { pickEmbedder, type EmbeddingProvider } from "./embed";
import { VectorIndex } from "./store";
import { LexicalIndex } from "./lexical";
import { rrfFuse } from "./retrieve";
import { rerank } from "./rerank";
import { buildImportGraph, type ImportGraph } from "./graph";
import { pickAnswerProvider } from "./answer";
import type { Chunk, FileDoc, QueryResult, ScoredChunk } from "./types";

export class CodebaseIndex {
  private vec = new VectorIndex();
  private lex = new LexicalIndex();
  private embedder: EmbeddingProvider;
  private graph?: ImportGraph;
  private chunksByPath = new Map<string, Chunk[]>();
  private ready = false;

  constructor(opts: { embedder?: EmbeddingProvider } = {}) {
    this.embedder = opts.embedder ?? pickEmbedder();
  }

  /** Index a directory on disk (CLI / MCP server). */
  async indexDir(root: string): Promise<{ files: number; chunks: number }> {
    return this.indexDocs(await ingestDir(root));
  }

  /** Index an in-memory set of files (e.g. from an uploaded zip in the web app). */
  async indexDocs(docs: FileDoc[]): Promise<{ files: number; chunks: number }> {
    const chunks = chunkAll(docs);
    const vectors = await this.embedder.embed(chunks.map((c) => c.content));
    chunks.forEach((c, i) => {
      this.vec.add(c, vectors[i]);
      this.lex.add(c);
      const arr = this.chunksByPath.get(c.path) ?? [];
      arr.push(c);
      this.chunksByPath.set(c.path, arr);
    });
    this.lex.finalize();
    this.graph = buildImportGraph(docs);
    this.ready = true;
    return { files: docs.length, chunks: chunks.length };
  }

  /** Files related to `path` via imports (graph-RAG building block). */
  related(path: string): string[] {
    return this.graph?.related(path) ?? [];
  }

  async search(question: string, k = 8): Promise<ScoredChunk[]> {
    if (!this.ready) throw new Error("Call indexDir() first.");
    const [qv] = await this.embedder.embed([question]);
    const vHits = this.vec.search(qv, k * 3);
    const lHits = this.lex.search(question, k * 3);
    const pool = rrfFuse([vHits, lHits]).slice(0, Math.max(k * 4, 20)); // candidate pool
    return rerank(question, pool).slice(0, k); // re-rank, then take top-k
  }

  // Retrieve without the re-ranker (for A/B in the eval).
  async searchRaw(question: string, k = 8): Promise<ScoredChunk[]> {
    if (!this.ready) throw new Error("Call indexDir() first.");
    const [qv] = await this.embedder.embed([question]);
    const vHits = this.vec.search(qv, k * 3);
    const lHits = this.lex.search(question, k * 3);
    return rrfFuse([vHits, lHits]).slice(0, k);
  }

  async ask(question: string, k = 8): Promise<QueryResult> {
    const chunks = await this.search(question, k);
    const provider = pickAnswerProvider();
    if (!provider || chunks.length === 0) {
      return { question, chunks, grounded: false };
    }
    // graph-RAG: add cross-file context from files related to the top hit.
    const included = new Set(chunks.map((c) => c.path));
    const extra: Chunk[] = [];
    for (const rel of this.related(chunks[0].path)) {
      if (included.has(rel)) continue;
      const first = this.chunksByPath.get(rel)?.[0];
      if (first) extra.push(first);
      if (extra.length >= 3) break;
    }
    const context = [...chunks, ...extra]
      .map((c) => `// ${c.path}:${c.startLine}-${c.endLine}\n${c.content}`)
      .join("\n\n");
    const answer = await provider.answer(question, context);
    return { question, chunks, answer, grounded: true };
  }
}

export type { QueryResult, ScoredChunk } from "./types";
