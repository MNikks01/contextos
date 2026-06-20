// GENERATED from engine/src/codebase/graph.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// VENDORED from codebase-intelligence/engine/src/graph.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// File-level import graph (the building block for graph-RAG). Connects files by their
// relative imports so retrieval/answering can pull in related cross-file context
// ("what calls this", "what does this depend on").

import { posix } from "node:path";
import type { FileDoc } from "./types";

export interface ImportGraph {
  imports: Map<string, Set<string>>; // file -> files it imports
  importedBy: Map<string, Set<string>>; // file -> files that import it
  related(path: string): string[]; // imports + importers
}

const IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;

function resolveSpec(dir: string, spec: string, paths: Set<string>): string | undefined {
  const base = posix.normalize(posix.join(dir, spec)).replace(/^\.\//, "");
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}/index.ts`];
  return candidates.find((c) => paths.has(c));
}

export function buildImportGraph(docs: FileDoc[]): ImportGraph {
  const paths = new Set(docs.map((d) => d.path));
  const imports = new Map<string, Set<string>>();
  const importedBy = new Map<string, Set<string>>();

  for (const doc of docs) {
    const dir = posix.dirname(doc.path);
    let m: RegExpExecArray | null;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(doc.content))) {
      const spec = m[1] ?? m[2];
      if (!spec || !spec.startsWith(".")) continue; // local imports only
      const resolved = resolveSpec(dir, spec, paths);
      if (!resolved || resolved === doc.path) continue;
      (imports.get(doc.path) ?? imports.set(doc.path, new Set()).get(doc.path)!).add(resolved);
      (importedBy.get(resolved) ?? importedBy.set(resolved, new Set()).get(resolved)!).add(doc.path);
    }
  }

  return {
    imports,
    importedBy,
    related(path: string): string[] {
      return [...new Set([...(imports.get(path) ?? []), ...(importedBy.get(path) ?? [])])];
    },
  };
}
