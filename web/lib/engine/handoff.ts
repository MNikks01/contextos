// GENERATED from engine/src/handoff.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// The Context Handoff — export the team's context as a portable bundle (the open format),
// restore it into a fresh session, and diff two bundles. This is the ContextOS wedge.

import type { BundleDiff, ContextBundle, ContextItem } from "./types";
import { ContextStore } from "./store";
import { renderAll } from "./generate-files";

export const HANDOFF_FORMAT_VERSION = "1.0";

export function exportBundle(project: string, store: ContextStore): ContextBundle {
  return {
    project,
    formatVersion: HANDOFF_FORMAT_VERSION,
    generatedAt: new Date().toISOString(),
    items: store.list(), // include superseded items for full fidelity
    files: renderAll(project, store.active()),
  };
}

export function importBundle(bundle: ContextBundle): ContextStore {
  if (!bundle.formatVersion?.startsWith("1.")) {
    throw new Error(`Unsupported Handoff format version: ${bundle.formatVersion}`);
  }
  return ContextStore.fromItems(bundle.items);
}

// Meaningful content of an item (ignore version + timestamps when diffing).
function content(i: ContextItem) {
  return { type: i.type, title: i.title, body: i.body, tags: [...i.tags].sort(), status: i.status, supersededBy: i.supersededBy };
}

export function diffBundles(a: ContextBundle, b: ContextBundle): BundleDiff {
  const am = new Map(a.items.map((i) => [i.id, i]));
  const bm = new Map(b.items.map((i) => [i.id, i]));
  const added = [...bm.keys()].filter((id) => !am.has(id));
  const removed = [...am.keys()].filter((id) => !bm.has(id));
  const changed = [...bm.keys()].filter(
    (id) => am.has(id) && JSON.stringify(content(am.get(id)!)) !== JSON.stringify(content(bm.get(id)!)),
  );
  return { added, removed, changed };
}
