# Architecture — ContextOS

Capture durable team context (decisions/conventions/glossary) and serve the Context Handoff so every AI tool starts warm; answer questions grounded in BOTH team context and code (reuses #2).

**Shape:** a pure-TypeScript **engine** (`engine/src`, zero-network, zero-dep) wrapped by thin adapters: engine/ (engine), mcp-server/ (MCP server), web/ (Next.js app).

- **Engine = single source of truth.** Surfaces never duplicate logic; they call the engine.
- Generated copies (e.g. `web/lib/engine`) are produced by a sync script and kept in lock-step (drift-checked in CI).
- Real external services (LLM, embeddings, Stripe, Postgres/pgvector, OTel) are swapped in behind interfaces/env; nothing is required to run the dev/test path.

Key modules: `store`, `generate-files`, `handoff`, `extract`, `grounded`, `codebase/ (vendored #2 engine)`, `index`.

See the root `ARCHITECTURE.md` for the full product/scale design.
