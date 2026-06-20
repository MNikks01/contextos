# ContextOS — MCP server

Exposes [`../engine`](../engine) (team context + the Context Handoff) as an **MCP server**, so any
MCP host — Claude Desktop, Cursor, a custom agent — loads the team's context and **starts warm**.

## Status: works end-to-end (verified over MCP, 2026-06-21)
- ✅ Loads a Context Handoff bundle (`CONTEXTOS_BUNDLE`) on startup, or seeds a small demo.
- ✅ Optionally indexes a codebase (`CODEBASE_PATH`) so `ask` can ground in code.
- ✅ Tools: `load_context`, `list_context`, `propose_context`, `add_context`, `ask`.
- ✅ Driven over real stdio JSON-RPC (`scripts/smoke.ts`): initialize → tools/list → calls, with `ask` citing `lexical.ts`.

## Tools
| Tool | Input | Returns |
|------|-------|---------|
| `load_context` | — | the team's `CLAUDE.md`-style brief (decisions/conventions/glossary) |
| `list_context` | `{ type? }` | active context items, optionally by type |
| `propose_context` | `{ text, source? }` | candidate decisions/conventions extracted from text (review before saving) |
| `add_context` | `{ type, title, body }` | adds an item to the shared context |
| `ask` | `{ question }` | answer grounded in team context + code (citations); written answer with an LLM key |

## Run it
```bash
npm install
CONTEXTOS_BUNDLE=/path/to/handoff.json \
CODEBASE_PATH=/path/to/repo \
  node src/server.ts        # speaks MCP over stdio; CODEBASE_PATH enables grounded `ask`
npm run smoke               # drive it over the protocol
```
The bundle is what `../engine` produces via `ContextOS.export()`. Without it, the server seeds a demo so it's never empty.

## Add to Claude Desktop
Merge [`mcp.json`](./mcp.json) into your Claude Desktop config (absolute paths):
```json
{ "mcpServers": { "contextos": {
  "command": "node",
  "args": ["/abs/path/to/contextos/mcp-server/src/server.ts"],
  "env": { "CONTEXTOS_BUNDLE": "/abs/path/to/handoff.json" }
}}}
```

## Notes
- Imports the engine source directly (`../../engine/src`) — keep them together.
- stdout is the MCP channel; status goes to stderr.
- Production: back the store with Postgres + RLS; sync bundles from the ContextOS app.
