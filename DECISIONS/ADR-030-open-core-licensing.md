# ADR-030 — Open-core licensing

**Status:** Accepted · **Maps to:** D-007 · **Date:** 2026-06-19

## Context
Developer tools win on trust and distribution. Fully proprietary loses the OSS adoption/recruiting flywheel; fully open gives away the defensible platform.

## Decision
**Open-core**: open-source the developer-loved primitives (the **Context Handoff format + spec**, the **CLI**, the **AST chunker**, **eval-harness primitives**, **SDKs**) under Apache-2.0; keep the **multi-tenant platform, governance, integration-hub orchestration, hosted retrieval at scale, dashboards, and billing** proprietary.

## Alternatives
- **Fully proprietary:** loses distribution, trust, contributors, recruiting.
- **Fully open / OSS-with-hosting only:** competitors fork the whole product; the hard multi-tenant/governance parts are given away.

## Consequences
- OSS drives top-of-funnel, trust, and contributions; the open Handoff format can become a standard (ADR-016).
- Revenue + moat live in the proprietary platform (the part that's hard to operate).

## Risks
- A competitor forks the OSS primitives. *Mitigation:* the moat is the proprietary multi-tenant/governance/hosting + accumulated context, not the chunker; we give away the commodity, keep the compound.
- Support burden / OSS expectations. *Mitigation:* clear scope of what's supported; community-driven for OSS parts.
