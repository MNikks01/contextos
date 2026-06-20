# ADR-022 — Drizzle as the ORM (resolves open question OQ-4)

**Status:** Accepted (resolves the prior TECH_STACK/DATABASE/DECISIONS inconsistency) · **Date:** 2026-06-19

## Context
The audit ([../DOCUMENT_AUDIT.md](../DOCUMENT_AUDIT.md)) flagged ORM confidence drift: TECH_STACK said "Drizzle or Prisma," DATABASE committed to Drizzle, DECISIONS listed it open. We need control over raw SQL for pgvector/RLS, type safety, and good migrations.

## Decision
Adopt **Drizzle** as the ORM. It gives type-safe schema + queries with first-class raw-SQL escape hatches needed for pgvector similarity queries, `set_config('app.org_id', …)` RLS setup, recursive CTEs (symbol graph), and partitioning DDL.

## Alternatives
- **Prisma:** excellent DX + migrations, but historically more friction with raw SQL, pgvector, RLS GUCs, and partitioning; heavier runtime.
- **Kysely / raw SQL:** maximum control, less schema ergonomics.
- **TypeORM:** mature but heavier and less aligned with our raw-SQL needs.

## Consequences
- Raw-SQL control where it matters (vectors, RLS, CTEs, partitions) without fighting the ORM; type-safe everywhere else.
- TECH_STACK, DATABASE, and DECISIONS now align on Drizzle (contradiction resolved).

## Risks
- Drizzle is younger than Prisma; smaller ecosystem. *Mitigation:* its raw-SQL alignment fits our needs; migrations are forward-only + tested in CI.
