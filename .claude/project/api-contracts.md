# API contracts — ContextOS

_Derived from source. See root `API.md` and each subproject README._

## MCP tools
- `load_context`
- `list_context`
- `propose_context`
- `add_context`
- `ask`

## Web HTTP API
- `GET /api/export`
- `POST /api/ask`
- `POST /api/context`
- `POST /api/extract`
- `POST /api/index-code`
- `POST /api/workspace`

> Inputs are validated; errors return `{ error: { message } }` with an appropriate status.
