# ADR-003 — Use NestJS for backend services

**Status:** Accepted · **Maps to:** D-005 · **Date:** 2026-06-19

## Context
We need a structured, testable backend that starts as a modular monolith and cleanly extracts into services later, written in the founder's strongest language (TypeScript).

## Decision
Use **NestJS** (TypeScript) for backend services, exploiting its module system to enforce the plane boundaries (auth/context/retrieval/integration/orchestration/governance/billing) that later become service boundaries.

## Alternatives
- **Express/Fastify:** lighter, but less structure/DI/testing scaffolding; module boundaries would be ad hoc.
- **Go/Python:** off the founder's core stack; Python reserved for AI/parsing sidecars only.
- **tRPC-only:** great DX but we need a public REST/OpenAPI surface for agents/SDKs.

## Consequences
- Clear module seams → cheap monolith→service extraction (ADR-005).
- DI + testing + interceptors make cross-cutting concerns (tenant context, tracing, cost attribution) clean.
- Shared TypeScript types across front/back via the monorepo (ADR-007).

## Risks
- NestJS has a learning curve and some ceremony. *Mitigation:* it pays off at the extraction boundary; keep modules thin and domain-focused.
- TS performance ceiling vs. Go for hot paths. *Mitigation:* the hot, CPU-bound work (parsing/embedding) is in workers and can use native/Python sidecars where justified.
