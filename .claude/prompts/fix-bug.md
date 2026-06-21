# Prompt: Fix a bug

Bug: $ARGUMENTS

1. Write a **failing test** that reproduces it (`engine/test`).
2. Find the root cause in `engine/src`; fix minimally.
3. `npm test` green (typecheck + unit + integration). Re-sync generated copies if engine changed.
4. Note the cause + fix in `.claude/memory/known-issues.md` (or remove it if resolved) and `lessons-learned.md` if non-obvious.
