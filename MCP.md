# ContextOS — MCP

ContextOS is both an **MCP host/hub** (connecting external tools) and an **MCP server** (exposing the org's context to any agent). See MCP_GUIDE.md for protocol fundamentals.

## 1. MCP strategy
ContextOS is the **central, governed integration layer** for a team's AI tooling. Instead of every developer wiring MCP servers individually (with their own tokens, no audit, no permissions), ContextOS connects them once, centrally, with auth/permissions/observability — and exposes the team's accumulated context back out via MCP.

## 2. ContextOS as MCP Hub (inbound integrations)
Connect, manage, and govern MCP servers for the whole org. Reuses the **MCP Server Generator (#3)** to create servers for custom internal tools.

| Integration | Tools/resources exposed (examples) |
|-------------|-----------------------------------|
| GitHub | read repo/PR/issues, create issue/PR comment, search code |
| Notion/Confluence | read/search docs, create page |
| Jira/Linear | read/create/update issues, link work |
| Slack | read channel context, post message |
| Databases (Postgres/MySQL) | safe parameterized read queries |
| Sentry/PagerDuty | read incidents/errors |
| Custom internal tools | generated via #3 |

Hub responsibilities: credential storage (vault), per-tool permission scopes, rate limiting, audit of every tool call, prompt-injection-aware handling of tool outputs, HITL gates on destructive tools. (See [GUARDRAILS.md](./GUARDRAILS.md).)

## 3. ContextOS as MCP Server (outbound: expose context)
ContextOS exposes the org's context so *any* MCP client (Claude Desktop, Cursor, Claude Code, agents) can use it:

**Tools**
- `get_project_context(project_id, scope?)` → curated decisions/conventions/glossary.
- `ask_codebase(project_id, question)` → grounded answer + citations (RAG).
- `search_code(project_id, query)` → ranked chunks.
- `record_decision(project_id, title, body)` → write back memory.
- `get_conventions(project_id, path?)` → coding standards for a path.

**Resources**
- `context://{project}/decisions`, `context://{project}/conventions`, `context://{project}/architecture`.

**Prompts**
- `/load-context {project}` — restores a full context bundle into a session (the **handoff**).
- `/onboard {project}` — new-hire orientation prompt.

## 4. Transports
- Hub→external servers: stdio (local) or HTTP/SSE (remote).
- ContextOS server→clients: **streamable HTTP** (multi-user, hosted) at `/mcp`, authenticated by API key, org-scoped.

## 5. Example client config (see also `mcp.json`)
```json
{ "mcpServers": {
  "contextos": {
    "url": "https://api.contextos.dev/mcp",
    "headers": { "Authorization": "Bearer ${CONTEXTOS_KEY}" }
  }
}}
```

## 6. Governance
Every connected tool and every exposed tool is subject to RBAC, scopes, rate limits, and audit. Admins control which integrations are enabled org-wide and with what permissions. This central governance is a core ContextOS differentiator over per-developer MCP setup.
