// GENERATED from engine/src/store.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// Context store — versioned CRUD over context items. In-memory for the engine/MVP;
// production persists to Postgres (the lab DB strategy) with RLS per org.

import { randomUUID } from "node:crypto";
import type { ContextItem, ContextType } from "./types";

export class ContextStore {
  private items = new Map<string, ContextItem>();

  add(input: { type: ContextType; title: string; body: string; tags?: string[]; id?: string }): ContextItem {
    const now = new Date().toISOString();
    const item: ContextItem = {
      id: input.id ?? randomUUID(),
      type: input.type,
      title: input.title,
      body: input.body,
      tags: input.tags ?? [],
      status: "active",
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(item.id, item);
    return item;
  }

  // Editing bumps the version (history is conceptual here; production keeps prior versions).
  update(id: string, fields: Partial<Pick<ContextItem, "title" | "body" | "tags">>): ContextItem {
    const item = this.must(id);
    Object.assign(item, fields);
    item.version += 1;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  // Mark an item superseded by a newer decision (don't delete — preserve the trail).
  supersede(id: string, byId: string): void {
    const item = this.must(id);
    this.must(byId); // ensure the replacement exists
    item.status = "superseded";
    item.supersededBy = byId;
    item.updatedAt = new Date().toISOString();
  }

  get(id: string): ContextItem | undefined {
    return this.items.get(id);
  }

  list(filter?: { type?: ContextType; status?: "active" | "superseded" }): ContextItem[] {
    let all = [...this.items.values()];
    if (filter?.type) all = all.filter((i) => i.type === filter.type);
    if (filter?.status) all = all.filter((i) => i.status === filter.status);
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  active(): ContextItem[] {
    return this.list({ status: "active" });
  }

  get size(): number {
    return this.items.size;
  }

  private must(id: string): ContextItem {
    const item = this.items.get(id);
    if (!item) throw new Error(`Context item not found: ${id}`);
    return item;
  }

  static fromItems(items: ContextItem[]): ContextStore {
    const store = new ContextStore();
    for (const i of items) store.items.set(i.id, { ...i });
    return store;
  }
}
