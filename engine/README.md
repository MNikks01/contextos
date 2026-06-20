# ContextOS — engine (Phase A: the Context Handoff) ✅

The core engine for project #1, the flagship. ContextOS gives AI-assisted teams **durable, shared context** — decisions, conventions, glossary — and the **Context Handoff**: export that context as a portable bundle (+ generated `CLAUDE.md` / `AGENTS.md` / `llms.txt`) so any AI tool or fresh session **starts warm** instead of re-deriving everything. Pure TypeScript, **Node 24 native TS, zero-network**.

> The wedge: today every AI session starts cold and re-learns (or forgets) the team's decisions. ContextOS makes context a durable, portable, governed asset. The open Handoff format is the strategic moat.

## Status: Phase A built + tested (2026-06-20)
- ✅ **Context store** — versioned items (`decision` / `adr` / `convention` / `glossary` / `note`); `supersede` preserves the audit trail.
- ✅ **File generation** — renders `CLAUDE.md` / `AGENTS.md` / `llms.txt` that a fresh AI session loads to start warm.
- ✅ **Context Handoff** — `export` a portable bundle (open format, v1.0) → `import`/restore into a fresh session → `diff` two bundles.
- ✅ **Memory extraction** — propose decisions/conventions from free text (PR/chat/commit); heuristic + zero-network (LLM-refinable later).
- ✅ **Grounded answers (the wedge composition)** — `GroundedContext` reuses the vendored #2 retrieval engine to answer a question grounded in BOTH the team's context AND the code, citing context items + code `file:line`. This is what no single AI tool does.
- ✅ **22/22 tests pass** (`scripts/test.ts` + `scripts/test-grounded.ts`): round-trip fidelity, generated-file content, extraction precision, supersede, diff, and grounded retrieval (money question → cents convention + order code; card question → no-log convention + payments code; irrelevant context stays out).

## Run it
```bash
node scripts/demo.ts            # capture context -> extract from a PR -> export Handoff -> restore -> diff
node scripts/demo-grounded.ts   # answer questions grounded in team context + code (reuses #2)
node scripts/test.ts && node scripts/test-grounded.ts   # 22 assertions
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
  grounded.ts       # GroundedContext: answer over team context + code (the wedge composition)
  codebase/         # VENDORED #2 retrieval engine (re-vendor: scripts/vendor-codebase-engine.mjs)
  index.ts          # ContextOS: addDecision/Convention/Glossary, export/import, propose/accept, grounded()
scripts/
  demo.ts           # the Context Handoff, end to end
  demo-grounded.ts  # grounded answers over context + a sample repo
  test.ts / test-grounded.ts   # 22 assertions
```

## How it composes the rest of the wedge
- ✅ **Reuses #2 (Codebase Intelligence)** — vendored into `src/codebase/`; `GroundedContext` answers grounded in code + team context.
- ✅ **MCP server** ([`../mcp-server`](../mcp-server)) — `load_context` / `propose_context` / `add_context` / **`ask`** (grounded). Verified over the protocol.
- Next: a web surface; and the production swaps below (real LLM extraction + answers, Postgres/RLS, pgvector).

## Production swaps (when keys/infra are added)
| Engine (now) | Production |
|---|---|
| in-memory `ContextStore` | Postgres + pgvector, RLS per org |
| heuristic extraction | LLM-assisted extraction + dedup |
| local files only | GitHub/Slack/Linear ingestion + sync of generated files |
