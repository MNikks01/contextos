# ADR-019 — Stripe with seat + usage hybrid billing

**Status:** Accepted · **Maps to:** D-008 · **Date:** 2026-06-19

## Context
AI products have usage-driven COGS (tokens). Pure seat pricing under-recovers cost from heavy users; pure usage pricing creates buyer anxiety and suppresses engagement.

## Decision
Use **Stripe Billing** with a **seat + usage hybrid**: predictable per-seat tiers (Pro/Team) plus metered usage above included credits, with per-tenant spend caps + alerts. Enterprise is custom/annual.

## Alternatives
- **Pure seats:** simple, but margin-negative on heavy users.
- **Pure usage:** recovers COGS but unpredictable, scares buyers, taxes the engagement we want.
- **Paddle/Lemon Squeezy (Merchant of Record):** simpler global tax; reconsider for international, but Stripe is fastest to integrate with the metering we need.

## Consequences
- Margin protected (usage passes COGS through); adoption protected (predictable base; don't price-punish engagement).
- Spend caps prevent bill shock and margin-negative free users.

## Risks
- Usage billing adds complexity + customer confusion. *Mitigation:* transparency, caps, alerts, a predictable Pro tier.
- Metering accuracy is billing-critical. *Mitigation:* every LLM/tool call writes a `usage_record`; reconcile against provider invoices.
