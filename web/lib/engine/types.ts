// GENERATED from engine/src/types.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// Core types for the ContextOS engine. The unit of value is durable, shared CONTEXT:
// decisions, conventions, glossary, ADRs — versioned, exportable, AI-loadable.

export type ContextType = "decision" | "adr" | "convention" | "glossary" | "note";

export interface ContextItem {
  id: string;
  type: ContextType;
  title: string;
  body: string;
  tags: string[];
  status: "active" | "superseded";
  supersededBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// The portable Context Handoff bundle — the open format any AI tool can load to
// "start warm". Includes the raw items AND generated CLAUDE.md / AGENTS.md / llms.txt.
export interface ContextBundle {
  project: string;
  formatVersion: string; // the open Handoff format version (semver)
  generatedAt: string;
  items: ContextItem[];
  files: Record<string, string>; // CLAUDE.md, AGENTS.md, llms.txt
}

export interface BundleDiff {
  added: string[]; // item ids
  removed: string[];
  changed: string[];
}

// A candidate context item proposed by memory extraction (human/agent reviews before saving).
export interface ContextProposal {
  type: ContextType;
  title: string;
  body: string;
  source: string; // where it came from (e.g. "PR #123")
  confidence: number; // 0..1
}
