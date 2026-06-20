// In-memory workspaces, keyed by id, with LRU eviction. Each workspace = a ContextOS
// (team context) + a GroundedContext (shares the same store; optionally indexes a codebase).
// Dev/MVP only — production persists to Postgres + pgvector with RLS per org.

import { randomUUID } from "node:crypto";
import { ContextOS } from "@/lib/engine/index";
import type { GroundedContext } from "@/lib/engine/grounded";

export type Workspace = { os: ContextOS; grounded: GroundedContext; codeIndexed: boolean; at: number };

const MAX_WORKSPACES = 50;
const g = globalThis as unknown as { __ctxWorkspaces?: Map<string, Workspace> };

function store() {
  if (!g.__ctxWorkspaces) g.__ctxWorkspaces = new Map();
  return g.__ctxWorkspaces;
}

export function createWorkspace(project: string): { id: string; ws: Workspace } {
  const os = new ContextOS(project);
  const ws: Workspace = { os, grounded: os.grounded(), codeIndexed: false, at: Date.now() };
  const id = randomUUID();
  const m = store();
  m.set(id, ws);
  if (m.size > MAX_WORKSPACES) {
    const oldest = [...m.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) m.delete(oldest[0]);
  }
  return { id, ws };
}

export function getWorkspace(id: string): Workspace | null {
  const ws = store().get(id);
  if (ws) ws.at = Date.now();
  return ws ?? null;
}
