# ADR-023 — Next.js (App Router) for the frontend

**Status:** Accepted · **Maps to:** D-005 · **Date:** 2026-06-19

## Context
We need a fast-to-build, SSR-capable web app (dashboards, chat with streaming, context editor, guardrails console) in the founder's strongest ecosystem, sharing types with the backend.

## Decision
Use **Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui**, with SSE for streaming AI responses, deployed on a managed edge platform (Vercel) initially.

## Alternatives
- **Remix:** excellent, but less founder familiarity and smaller component ecosystem.
- **SvelteKit/Vue:** off the founder's core stack.
- **SPA (Vite/React) only:** loses SSR/edge benefits and some DX.

## Consequences
- Maximum velocity; shared TS types with the NestJS backend via the monorepo; shadcn gives ownable, fast UI; streaming UX for AI is first-class.
- Managed hosting (Vercel) keeps ops minimal pre-scale (ADR-024).

## Risks
- Next.js coupling / vendor (Vercel) lock-in. *Mitigation:* the app is portable (containerizable) if we must self-host; the backend (the hard part) is provider-neutral.
- App Router churn. *Mitigation:* stick to stable patterns; the frontend is not where the moat is.
