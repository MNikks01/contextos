# ADR-032 — REST primary; GraphQL for reads only

**Status:** Accepted · **Date:** 2026-06-19

## Context
ContextOS is consumed by the web app, the CLI, SDKs, and autonomous agents. Mutations have cost (LLM), require idempotency + metering + audit; dashboards over-fetch nested data with REST.

## Decision
**REST is the primary public surface** for all mutations and most reads (predictable, cacheable, easy to secure/meter/audit; idempotency on cost-incurring writes). Add **GraphQL only as a read-only layer** for analytics/observability dashboards where REST over-fetches. AI endpoints stream via SSE. OpenAPI is the source of truth (generates SDKs).

## Alternatives
- **GraphQL everywhere:** flexible reads, but mutation idempotency/metering/auditing and caching get awkward; over-powerful for agent consumers.
- **gRPC public API:** great internally (Tier 3), poor fit for broad public/agent consumption.

## Consequences
- Clean idempotency/metering/audit on costly mutations; predictable caching; agent-friendly typed contracts; GraphQL confined to where it adds value.

## Risks
- Two API styles to maintain. *Mitigation:* GraphQL is read-only + optional (ship only when a dashboard needs it); both generated/validated from shared Zod types.
- Over-fetching on REST dashboards before GraphQL exists. *Mitigation:* purpose-built REST read endpoints until GraphQL is justified.
