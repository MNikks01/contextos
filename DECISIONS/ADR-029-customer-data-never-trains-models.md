# ADR-029 — Customer code/data never trains any model

**Status:** Accepted · **Maps to:** D-010 · **Date:** 2026-06-19

## Context
We ask engineering teams to connect their crown-jewel code. The #1 enterprise objection is "what happens to our code — does it train someone's model?"

## Decision
**Customer code and data never train any model — ours or a provider's.** Use provider **zero-retention / no-train API tiers**; provide a contractual + technical guarantee; per-tenant data isolation; data deletion on request. Any future use of customer data for model improvement is **opt-in only** (D-001 revisit conditions).

## Alternatives
- **Use customer data to fine-tune our models:** could improve quality, but destroys trust and contradicts D-001/D-010 — rejected.
- **Stay silent on the policy:** the objection kills enterprise deals; an explicit guarantee is a sales asset.

## Consequences
- Removes the top enterprise objection; becomes a differentiator + a sales one-pager.
- Constrains us from building a proprietary fine-tune on customer data (intended; only via explicit opt-in later).

## Risks
- A provider changes its data policy. *Mitigation:* contractually pin no-train tiers; the abstraction lets us route away from a non-compliant provider; on-prem option for the strictest customers.
- Proving the negative to auditors. *Mitigation:* document data flows, sub-processors, retention; SOC 2 evidence; egress controls.
