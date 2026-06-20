# ContextOS — web app

The browser surface for [`../engine`](../engine): **capture team context → export the Context Handoff → ask questions grounded in your context + code.** Next.js 16 + Tailwind. **No keys needed** for capture/export/retrieval; set an LLM key for written answers.

## Status: built + API-verified (2026-06-21)
- ✅ `next build` compiles + typechecks (engine synced into `lib/engine/`, incl. the vendored `codebase/`).
- ✅ Manage context (`/api/workspace`, `/api/context`), extract from text (`/api/extract`), export the Handoff bundle (`/api/export`), index a repo zip (`/api/index-code`), grounded ask (`/api/ask`).
- ✅ End-to-end via `scripts/smoke-api.mjs`: seed workspace → add → extract → index a real codebase (19 files/89 chunks) → ask "BM25" cites `lexical.ts`, ask "money in cents" surfaces the convention → export bundle v1.0.
- 🔲 Visual UI renders + wired — **verify locally** (`npm run dev`); not click-tested headlessly.

## Run it
```bash
npm install
npm run dev          # http://localhost:3000
# headless API proof:
npm run build
PORT=3960 npx next start &
( cd ../engine/src && zip -rq /tmp/ctx-code.zip . )   # a repo for the grounded-ask path
BASE=http://localhost:3960 node scripts/smoke-api.mjs
```

## What you can do
- **Team context** — add decisions / conventions / glossary; see them flow into a generated `CLAUDE.md`.
- **Capture from text** — paste a PR/chat → extract candidate decisions/conventions → accept into the store.
- **Context Handoff** — download the portable bundle (open format v1.0) that any AI tool / fresh session loads to start warm.
- **Grounded ask** — optionally upload a `.zip` of your repo, then ask questions answered from your context **and** the code (with citations).

## Structure
```
app/
  page.tsx                    # context · extract · Handoff · grounded ask
  api/workspace               # create/seed a workspace
  api/context                 # add a context item
  api/extract                 # propose decisions/conventions from text
  api/export                  # download the Handoff bundle
  api/index-code              # upload a repo zip -> index for grounded ask
  api/ask                     # grounded answer (context + code)
lib/
  engine/                     # GENERATED from ../engine/src (sync-to-web.mjs); incl. vendored codebase/
  workspace-store.ts          # in-memory workspaceId -> ContextOS + GroundedContext (LRU)
  zip.ts                      # uploaded zip -> FileDoc[]
scripts/smoke-api.mjs         # end-to-end API proof
```

## To go live (production swaps)
- `ANTHROPIC_API_KEY` → written grounded answers (otherwise retrieval-only evidence).
- Real embeddings + **Postgres + pgvector + RLS** → persistent, multi-tenant context (vs. the in-memory workspace store).
- `lib/engine/` is generated — edit `../engine/src` and run `node ../engine/scripts/sync-to-web.mjs`.
