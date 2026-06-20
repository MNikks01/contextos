# ADR-007 — Turborepo monorepo with shared packages

**Status:** Accepted · **Maps to:** D-006 · **Date:** 2026-06-19

## Context
ContextOS reuses the Codebase Intelligence (#2) and MCP Generator (#3) engines and shares large surface area (LLM abstraction, RAG, MCP, DB schema, auth, observability, evals) across the 7-product lab.

## Decision
Use a single **Turborepo + pnpm monorepo** with shared packages: `packages/{ui,llm,rag,mcp,db,auth,observability,evals}` and `apps/{web,api,cli}` plus workers.

## Alternatives
- **Polyrepo:** clean per-product isolation but heavy duplication of the shared engines and painful cross-repo changes.
- **Nx:** powerful but heavier; Turborepo is lighter and sufficient.

## Consequences
- The #2/#3 engines become importable packages → the reuse dividend is real, not aspirational.
- Atomic cross-cutting changes; shared CI caching; one dependency graph.

## Risks
- Tight coupling / a change in a shared package breaking many consumers. *Mitigation:* package versioning, clear interfaces, CI that builds/tests affected packages.
- A product may need to be spun out/sold. *Mitigation:* clean package boundaries make extraction feasible if ever needed.
