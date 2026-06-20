# ContextOS — API reference

_Generated from the source; see each subproject's README for usage._

## MCP server tools

Served over stdio JSON-RPC (`mcp-server/src/server.ts`).

| Tool | Description |
|------|-------------|
| `load_context` | Load the team's durable context (decisions, conventions, glossary) as a CLAUDE.md-style brief.… |
| `list_context` | List the team's active context items, optionally filtered by type.… |
| `propose_context` | Extract candidate decisions/conventions from text (a PR description, chat, or notes). Returns proposals… |
| `add_context` | Add a context item (decision / convention / glossary / note) to the team's shared context.… |
| `ask` | Answer a question grounded in BOTH the team's context (decisions/conventions) AND the codebase… |

## Web HTTP API

Next.js route handlers under `web/app/api`.

| Endpoint | Methods |
|----------|---------|
| `/api/ask` | POST |
| `/api/context` | POST |
| `/api/export` | GET |
| `/api/extract` | POST |
| `/api/index-code` | POST |
| `/api/workspace` | POST |

> All inputs are validated; errors return a JSON `{ error: { message } }` with an appropriate status. No secrets are logged. See `.github/SECURITY.md`.