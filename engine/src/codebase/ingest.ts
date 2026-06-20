// VENDORED from codebase-intelligence/engine/src/ingest.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Repo ingestion: walk a directory, read code/doc files, skip junk. No network.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import type { FileDoc } from "./types.ts";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "out",
  "coverage",
  "generated",
  ".turbo",
]);

const LANG_BY_EXT: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".py": "python",
  ".go": "go",
  ".java": "java",
  ".rb": "ruby",
  ".rs": "rust",
  ".md": "markdown",
  ".json": "json",
  ".yaml": "yaml",
  ".yml": "yaml",
};

const MAX_FILE_BYTES = 400_000; // skip very large files

/** Map a filename to a supported language, or null if we don't index it. */
export function languageFor(filename: string): string | null {
  return LANG_BY_EXT[extname(filename).toLowerCase()] ?? null;
}

export const SKIP_PATH_SEGMENTS = SKIP_DIRS;

export async function ingestDir(root: string): Promise<FileDoc[]> {
  const docs: FileDoc[] = [];
  await walk(root, root, docs);
  return docs;
}

async function walk(root: string, dir: string, out: FileDoc[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") {
      if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
        // allow dotted dirs that aren't in skip list? keep it simple: skip hidden dirs
        continue;
      }
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(root, full, out);
    } else {
      const language = LANG_BY_EXT[extname(entry.name).toLowerCase()];
      if (!language) continue;
      const info = await stat(full);
      if (info.size > MAX_FILE_BYTES || info.size === 0) continue;
      const content = await readFile(full, "utf8");
      out.push({ path: relative(root, full), language, content, sizeBytes: info.size });
    }
  }
}
