# ADR-006 — TypeScript everywhere; Python only as an isolated sidecar

**Status:** Accepted · **Maps to:** D-005 · **Date:** 2026-06-19

## Context
The founder is strongest in TypeScript (MERN). The product spans frontend, backend, CLI, and SDKs. Some best-in-class AI/parsing tooling is Python-first.

## Decision
Use **TypeScript across frontend, backend, CLI, and SDKs**, with shared types via the monorepo. Use **Python only as an isolated microservice/sidecar** where the ecosystem demands it (certain parsers, eval tooling).

## Alternatives
- **Python-first backend:** richer AI ecosystem, but off the founder's stack, splits the type system, and slows velocity.
- **Polyglot from day one:** maximizes per-task fit, maximizes cognitive + hiring cost.

## Consequences
- One language, one mental model; shared Zod/types front-to-back; fast hiring from the JS pool.
- The Python boundary is explicit and small (a service with a typed contract), not pervasive.

## Risks
- Some AI libraries lag in TS (LangGraph/eval tooling). *Mitigation:* the provider abstraction + our own thin orchestration reduce framework dependence; sidecar Python where a library is clearly superior.
- Sidecar sprawl. *Mitigation:* a sidecar requires an ADR; default is "do it in TS."
