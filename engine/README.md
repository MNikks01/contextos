# ContextOS — engine (Phase A: the Context Handoff) ✅

The core engine for project #1, the flagship. ContextOS gives AI-assisted teams **durable, shared context** — decisions, conventions, glossary — and the **Context Handoff**: export that context as a portable bundle (+ generated `CLAUDE.md` / `AGENTS.md` / `llms.txt`) so any AI tool or fresh session **starts warm** instead of re-deriving everything. Pure TypeScript, **Node 24 native TS, zero-network**.

> The wedge: today every AI session starts cold and re-learns (or forgets) the team's decisions. ContextOS makes context a durable, portable, governed asset. The open Handoff format is the strategic moat.

## Status: Phase A built + tested (2026-06-20)
- ✅ **Context store** — versioned items (`decision` / `adr` / `convention` / `glossary` / `note`); `supersede` preserves the audit trail.
- ✅ **File generation** — renders `CLAUDE.md` / `AGENTS.md` / `llms.txt` that a fresh AI session loads to start warm.
- ✅ **Context Handoff** — `export` a portable bundle (open format, v1.0) → `import`/restore into a fresh session → `diff` two bundles.
- ✅ **Memory extraction** — propose decisions/conventions from free text (PR/chat/commit); heuristic + zero-network (LLM-refinable later).
- ✅ **15/15 tests pass** (`scripts/test.ts`): round-trip fidelity, generated-file content, extraction precision, supersede, diff.

## Run it
```bash
node scripts/demo.ts   # capture context -> extract from a PR -> export Handoff -> restore -> diff
node scripts/test.ts   # 15 assertions
```

## What the demo shows
Curate a few decisions/conventions → extract more from a PR description → **export** the Handoff bundle (with a generated `CLAUDE.md`) → **restore** it into a "fresh session" that inherits all of it → supersede a decision and **diff**.

## Structure
```
src/
  types.ts          # ContextItem, ContextBundle, BundleDiff, ContextProposal
  store.ts          # versioned context store (-> Postgres + RLS in production)
  generate-files.ts # render CLAUDE.md / AGENTS.md / llms.txt
  handoff.ts        # export / import / diff the portable bundle (the open format)
  extract.ts        # memory extraction from text (heuristic; LLM-refinable)
  index.ts          # ContextOS: addDecision/Convention/Glossary, export/import, propose/accept
scripts/
  demo.ts           # the Context Handoff, end to end
  test.ts           # 15 assertions
```

## How it composes the rest of the wedge
- **Reuses #2 (Codebase Intelligence)** for codebase-grounded answers ("how does X work, given our decisions + the code").
- **Reuses #3 (MCP Server Generator)** to expose ContextOS over MCP and to wire external tools.
- Next: an MCP server (`load_context`, `propose_context`, `ask`) + a web surface + the #2 retrieval integration.

## Production swaps (when keys/infra are added)
| Engine (now) | Production |
|---|---|
| in-memory `ContextStore` | Postgres + pgvector, RLS per org |
| heuristic extraction | LLM-assisted extraction + dedup |
| local files only | GitHub/Slack/Linear ingestion + sync of generated files |
