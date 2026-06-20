# ADR-024 — Managed cloud first; Kubernetes later

**Status:** Accepted · **Maps to:** D-009 · **Date:** 2026-06-19

## Context
K8s is powerful but carries a heavy ops tax. Pre-PMF, that tax buys nothing; it burns the runway that buys product.

## Decision
Start on **managed PaaS** (Vercel for web; managed Postgres like Neon/Supabase/RDS; a container host like Railway/Render/Fly; managed Redis). **Introduce Kubernetes only at the explicit trigger:** multi-service orchestration needs (Tier 3), **OR** an enterprise on-prem/VPC deal, **OR** a measured cost/control advantage — whichever comes first.

## Alternatives
- **K8s from day one:** premature ops burden; slows shipping; the classic over-engineering trap.
- **Bare metal/VMs:** more control, more ops, no benefit pre-scale.

## Consequences
- Ship faster, operate simply, defer ops complexity until it pays.
- The K8s/on-prem path (Helm chart) is documented so an enterprise deal doesn't catch us flat.

## Risks
- A large enterprise demands on-prem before Tier 3, forcing K8s early. *Mitigation:* keep containerization clean + a Helm chart ready; treat this as a known, costed contingency, not a surprise.
- Managed-service cost premium. *Mitigation:* acceptable pre-scale; re-evaluate at Tier 3 FinOps review.
