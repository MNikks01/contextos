# ContextOS — TECH STACK

Stack with the **why** for each choice. Aligns with portfolio decisions D-003–D-009. Plays to a MERN founder's strengths while meeting AI-product needs.

| Layer | Choice | Why this | Alternatives considered |
|-------|--------|----------|-------------------------|
| **Frontend** | Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui | Founder's strength; SSR/edge; one of the best DX; shadcn for fast, ownable components | Remix, SvelteKit (less familiar), Vue |
| **Backend** | Node.js + NestJS (TypeScript) | Structured, modular, DI, testable; scales from monolith→services; shared types with FE | Express (less structure), Fastify, Go/Python (off-stack) |
| **Database** | PostgreSQL + **pgvector** | One DB for relational + vectors; transactional consistency; RLS for multi-tenancy (D-004) | Dedicated vector DB (Pinecone/Qdrant) — deferred to scale |
| **Cache / Queue** | Redis (+ BullMQ) | Caching, rate limiting, job queue in one; ubiquitous | Kafka/RabbitMQ (overkill early), SQS |
| **Search (lexical)** | Postgres full-text (then OpenSearch at scale) | Hybrid search without new infra | Elasticsearch/OpenSearch from day one (premature) |
| **AI / LLM** | Claude (default) + GPT + Gemini via provider abstraction; embeddings provider-abstracted (D-003) | Claude leads on code/agents; abstraction avoids lock-in + enables cost routing | Single-provider (lock-in), self-host (ops burden) |
| **Code parsing** | tree-sitter (multi-language) | AST-aware chunking = better code RAG | Regex/naive chunking (worse quality) |
| **Orchestration** | Own thin layer; LangGraph/CrewAI as Python sidecar when needed | Control + minimal deps; reach for frameworks only when graphs/multi-agent justify | All-in on one framework (lock-in) |
| **MCP** | `@modelcontextprotocol/sdk` (TS) | Native, standard, TS-first | Hand-rolled protocol (reinvention) |
| **Auth** | Auth.js/Clerk/WorkOS (eval); JWT sessions; WorkOS for SSO later | Fast secure auth now; WorkOS for enterprise SSO/SAML/SCIM | Roll-your-own auth (risky) |
| **Payments** | Stripe (Billing + metered usage) | Best DX, usage metering, invoicing (D-008) | Paddle, Lemon Squeezy (MoR — reconsider for global tax) |
| **Observability** | OpenTelemetry → Prometheus + Grafana; Sentry; structured logs | Standard traces/metrics/logs/errors; vendor-neutral | Datadog (cost), single-vendor |
| **Secrets** | Cloud secret manager / Vault; never in DB/context | Security baseline (D-010) | Env files in repo (no) |
| **Cloud** | Managed-first: Vercel (web) + managed Postgres (Neon/Supabase/RDS) + container host (Railway/Render/Fly); K8s later | Ship fast pre-PMF; avoid ops tax (D-009) | K8s day one (premature), bare metal |
| **Infra-as-code** | Docker; later Terraform + Kubernetes/Helm | Reproducible; portable to enterprise/VPC | ClickOps (unreproducible) |
| **CI/CD** | GitHub Actions | Native to GitHub-centric workflow; free-tier generous | CircleCI, GitLab CI |
| **Monorepo** | Turborepo + pnpm | Shared packages across the 7 products (D-006) | Nx (heavier), polyrepo (duplication) |
| **Testing** | Vitest/Jest (unit), Playwright (e2e), **eval harness** (AI quality) | Standard + AI-specific evals in CI | No evals (quality regressions slip) |
| **Email/notify** | Resend/Postmark | Transactional + product emails | SES (more setup) |

## Shared monorepo packages
`packages/ui` (shadcn components) · `packages/llm` (provider abstraction) · `packages/rag` (chunk/embed/retrieve/rerank) · `packages/mcp` (server/client helpers) · `packages/db` (Prisma/Drizzle schema + RLS) · `packages/auth` · `packages/observability` (OTel wrappers) · `packages/evals`.

## ORM
**Drizzle** (or Prisma) for type-safe Postgres + easy pgvector/RLS. Drizzle preferred for raw-SQL control on vector queries.

## Why this stack wins for *this* founder
A MERN dev is ~70% productive on day one (Next/Node/Postgres). The AI-specific additions (pgvector, MCP SDK, LLM abstraction, evals) are learnable in weeks and reused across all 7 products. No language-context-switching tax; one mental model, seven products.
