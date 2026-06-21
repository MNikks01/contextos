# .claude — ContextOS workspace

Project #1 of the AI Startup Lab. Context & governance OS for AI-assisted engineering teams.

**What it does:** Capture durable team context (decisions/conventions/glossary) and serve the Context Handoff so every AI tool starts warm; answer questions grounded in BOTH team context and code (reuses #2).

**Surfaces:** engine/ (engine), mcp-server/ (MCP server), web/ (Next.js app)

This `.claude/` folder helps humans and AI agents work in this repo consistently:
- `agents/` — role-based subagents (architect, backend, frontend, tester, reviewer, devops, docs, ui).
- `skills/` — stack reference notes (what we use, and what we deliberately don't).
- `project/` — the living source of truth: architecture, standards, structure, API contracts, schema, stack, roadmap.
- `prompts/` — reusable task prompts (feature, bugfix, refactor, review, tests, docs).
- `memory/` — decisions, changelog, known issues, lessons learned.
- `commands/` — operational runbooks (build, deploy, release, publish). Also usable as slash commands.
- `templates/` — code scaffolds (component, api-route, hook, test, PR).

> Ground truth lives in code + the root spec docs. **Engines run on Node 24 native TypeScript (zero build step); never add a build for them.** The engine is the single source of truth — generated copies (`web/lib/engine`) are synced, never hand-edited.
