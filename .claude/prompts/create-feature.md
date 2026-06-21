# Prompt: Create a feature

Feature: $ARGUMENTS

1. Read `.claude/project/architecture.md` + `api-contracts.md`. Confirm the change belongs in the **engine** (`engine/src`) vs a surface.
2. Implement in the engine first (typed, small modules). Then expose via an MCP tool and/or a web route + UI.
3. Add **unit + integration tests** (`engine/test`). Run `npm test`.
4. If the engine changed, re-run its sync script (generated copies) — keep the drift check green.
5. Update `API.md` / `.claude/project/*` if behavior changed. Conventional Commit.
