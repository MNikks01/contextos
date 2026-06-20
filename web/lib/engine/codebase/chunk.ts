// GENERATED from engine/src/codebase/chunk.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// VENDORED from codebase-intelligence/engine/src/chunk.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Declaration-aware chunking. Splits code at top-level declaration boundaries so
// functions/classes stay whole; oversized blocks fall back to overlapping line windows;
// markdown splits by heading. (MVP heuristic — the documented upgrade is tree-sitter AST.)

import type { Chunk, FileDoc } from "./types";

const MAX_CHUNK_LINES = 120;
const WINDOW_OVERLAP = 15;

const DECL_RE =
  /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:public\s+|private\s+|protected\s+|static\s+)*(function|class|interface|type|enum|const|let|var|def|func)\b\s*([A-Za-z0-9_]+)?/;

function symbolFromLine(line: string): string | undefined {
  const m = DECL_RE.exec(line.trimEnd());
  return m?.[2];
}

function isTopLevelDecl(line: string): boolean {
  if (/^\s/.test(line)) return false; // must be at indentation 0
  return DECL_RE.test(line.trimEnd());
}

export function chunkFile(doc: FileDoc): Chunk[] {
  if (doc.language === "markdown") return chunkMarkdown(doc);
  return chunkCode(doc);
}

function chunkCode(doc: FileDoc): Chunk[] {
  const lines = doc.content.split("\n");
  const boundaries: number[] = [];
  for (let i = 0; i < lines.length; i++) if (isTopLevelDecl(lines[i])) boundaries.push(i);

  // If no declarations found, window the whole file.
  if (boundaries.length === 0) return windowChunks(doc, lines, 0, lines.length, undefined);

  const chunks: Chunk[] = [];
  // Leading section (imports, top comments) before the first declaration.
  if (boundaries[0] > 0) {
    chunks.push(...windowChunks(doc, lines, 0, boundaries[0], undefined));
  }
  for (let b = 0; b < boundaries.length; b++) {
    const start = boundaries[b];
    const end = b + 1 < boundaries.length ? boundaries[b + 1] : lines.length;
    const symbol = symbolFromLine(lines[start]);
    chunks.push(...windowChunks(doc, lines, start, end, symbol));
  }
  return chunks.filter((c) => c.content.trim().length > 0);
}

function windowChunks(
  doc: FileDoc,
  lines: string[],
  start: number,
  end: number,
  symbol: string | undefined,
): Chunk[] {
  const out: Chunk[] = [];
  if (end - start <= MAX_CHUNK_LINES) {
    out.push(makeChunk(doc, lines, start, end, symbol));
    return out;
  }
  for (let s = start; s < end; s += MAX_CHUNK_LINES - WINDOW_OVERLAP) {
    const e = Math.min(s + MAX_CHUNK_LINES, end);
    out.push(makeChunk(doc, lines, s, e, symbol));
    if (e >= end) break;
  }
  return out;
}

function chunkMarkdown(doc: FileDoc): Chunk[] {
  const lines = doc.content.split("\n");
  const boundaries: number[] = [];
  for (let i = 0; i < lines.length; i++) if (/^#{1,6}\s/.test(lines[i])) boundaries.push(i);
  if (boundaries.length === 0) return windowChunks(doc, lines, 0, lines.length, undefined);
  const chunks: Chunk[] = [];
  if (boundaries[0] > 0) chunks.push(makeChunk(doc, lines, 0, boundaries[0], undefined));
  for (let b = 0; b < boundaries.length; b++) {
    const start = boundaries[b];
    const end = b + 1 < boundaries.length ? boundaries[b + 1] : lines.length;
    const heading = lines[start].replace(/^#+\s/, "").trim();
    chunks.push(...windowChunks(doc, lines, start, end, heading));
  }
  return chunks.filter((c) => c.content.trim().length > 0);
}

function makeChunk(doc: FileDoc, lines: string[], start: number, end: number, symbol?: string): Chunk {
  const content = lines.slice(start, end).join("\n");
  return {
    id: `${doc.path}:${start + 1}-${end}`,
    path: doc.path,
    language: doc.language,
    symbol,
    startLine: start + 1,
    endLine: end,
    content,
  };
}

export function chunkAll(docs: FileDoc[]): Chunk[] {
  return docs.flatMap(chunkFile);
}
