// ContextOS engine — durable team context + the Context Handoff. A fresh AI session
// loads the exported bundle and starts *warm* (inherits decisions/conventions/glossary).
// Self-contained + zero-network; codebase-grounded answers reuse the #2 engine (later).

import { ContextStore } from "./store.ts";
import { exportBundle, importBundle } from "./handoff.ts";
import { renderAll } from "./generate-files.ts";
import { extractProposals } from "./extract.ts";
import { GroundedContext } from "./grounded.ts";
import type { ContextBundle, ContextItem, ContextProposal } from "./types.ts";

export class ContextOS {
  readonly project: string;
  readonly store: ContextStore;

  constructor(project: string, store = new ContextStore()) {
    this.project = project;
    this.store = store;
  }

  addDecision(title: string, body: string, tags?: string[]): ContextItem {
    return this.store.add({ type: "decision", title, body, tags });
  }
  addConvention(title: string, body: string, tags?: string[]): ContextItem {
    return this.store.add({ type: "convention", title, body, tags });
  }
  addGlossary(term: string, definition: string, tags?: string[]): ContextItem {
    return this.store.add({ type: "glossary", title: term, body: definition, tags });
  }

  /** Files a fresh AI session loads to start warm. */
  files(): Record<string, string> {
    return renderAll(this.project, this.store.active());
  }

  /** Export the portable Context Handoff bundle. */
  export(): ContextBundle {
    return exportBundle(this.project, this.store);
  }

  /** Restore a session from a bundle. */
  static import(bundle: ContextBundle): ContextOS {
    return new ContextOS(bundle.project, importBundle(bundle));
  }

  /** Propose context items from free text (PR/chat/commit) — reviewed before saving. */
  propose(text: string, source = "input"): ContextProposal[] {
    return extractProposals(text, source);
  }

  /** Accept a proposal into the store. */
  accept(p: ContextProposal): ContextItem {
    return this.store.add({ type: p.type, title: p.title, body: p.body, tags: [p.source] });
  }

  /** A grounded-context view: answer questions over this team's context + a codebase. */
  grounded(): GroundedContext {
    return new GroundedContext(this.store);
  }
}

export { diffBundles, exportBundle, importBundle } from "./handoff.ts";
export { HANDOFF_FORMAT_VERSION } from "./handoff.ts";
export { ContextStore } from "./store.ts";
export { extractProposals } from "./extract.ts";
export { GroundedContext } from "./grounded.ts";
export type { GroundedResult } from "./grounded.ts";
export type { BundleDiff, ContextBundle, ContextItem, ContextProposal } from "./types.ts";
