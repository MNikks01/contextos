---
description: Build & verify ContextOS
---

Build and verify everything locally.

```bash
npm install          # root dev tooling + Husky
npm test             # typecheck + unit + integration
( cd mcp-server && npm install && npm run smoke )
( cd web && npm install && npm run build )
```
All must pass before pushing (CI runs the same).
