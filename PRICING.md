# ContextOS — PRICING

> Pricing tiers, the logic behind them, and the **unit economics** (COGS, gross margin, LTV/CAC, payback) that make ContextOS a venture-grade business. Pairs with [GTM.md](./GTM.md) (acquisition/retention/expansion) and [SALES.md](./SALES.md) (TAM/funnel/fundraising).

## 1. Executive Summary

ContextOS uses a **seat + usage hybrid** model (decision DECISION_LOG.md D-008) across four tiers — **Free, Pro, Team, Enterprise** — chosen because AI products have usage-driven COGS that pure seat pricing under-recovers, while pure usage pricing creates adoption anxiety. The free tier is a genuine product (the Context Handoff) that drives bottom-up adoption; Pro removes individual limits; **Team is the revenue core** (sold on collaboration + governance + visibility); Enterprise monetizes security, compliance, and deployment control. The economic mandate is a **70%+ gross margin**, protected architecturally via model routing, prompt/answer caching, lean retrieval, and per-tenant spend caps ([AI_ARCHITECTURE.md §9](./AI_ARCHITECTURE.md)). With predominantly content/community-driven acquisition (low CAC) and compounding switching costs (high retention), the target unit economics are an **LTV/CAC well above 3:1** and **CAC payback under 12 months** — the profile investors underwrite. All figures here are launch hypotheses to be validated with design partners, not committed prices.

---

## 2. Tiers

| | **Free** | **Pro** | **Team** | **Enterprise** |
|---|---|---|---|---|
| Price | $0 | **$19/user/mo** | **$39/user/mo** (min 3 seats) | Custom (annual) |
| For | Solo eval, OSS | Power individual | Startups / teams | Mid-market+ |
| Projects | 1 | Unlimited | Unlimited | Unlimited |
| Context store + Handoff | ✅ (capped) | ✅ | ✅ shared | ✅ |
| Codebase Q&A | limited queries/mo | higher | team pool | unlimited |
| Included AI usage | small monthly credit | larger credit | pooled credit | committed + overage |
| Usage overage | hard cap (no overage) | metered | metered | committed contract |
| Teams / RBAC | — | — | ✅ | ✅ + custom roles |
| Observability / reporting | basic | basic | ✅ team dashboards | ✅ + exports |
| Integrations (MCP Hub) | 1 | 3 | unlimited | unlimited + custom |
| Agents / automation | — | limited | ✅ | ✅ |
| Guardrails / policy | defaults | defaults | configurable | full policy engine |
| SSO / SAML / SCIM | — | — | — | ✅ |
| On-prem / VPC | — | — | — | ✅ |
| Audit logs | 7-day | 30-day | 1-year | configurable + export |
| Support | community | email | priority | dedicated + SLA |

---

## 3. Pricing Logic

- **Free must "wow."** The free Context Handoff has to deliver a real, daily benefit so individuals evangelize. We cap *volume* (queries/mo, 1 project, 1 integration), not *value*. A hard usage cap (no overage on Free) protects COGS.
- **Pro removes individual limits.** Predictable monthly price for the power user/freelancer, with metered overage above a generous included credit and transparent spend tracking.
- **Team is the money tier.** The upgrade trigger is **collaboration + governance + visibility** — shared context, RBAC, spend/quality dashboards — *not* crippling individuals. This is the right wedge because the buyer (eng lead) values exactly these.
- **Enterprise sells control.** SSO, audit, on-prem/VPC, security review, SLAs — priced custom and annual, sold on risk reduction and compliance.
- **Usage metering passes COGS through above the free credit**, with spend caps + alerts to prevent bill shock. **Annual discount** (~2 months free) improves retention and cash. We never compete on being cheapest — we compete on reliability and context depth.

---

## 4. Unit Economics

> Figures are illustrative model inputs to validate, not guarantees. The point is the *structure* and the levers.

### 4.1 COGS & gross margin
The dominant variable cost is LLM/inference + embeddings + vector/infra. With the §9 cost levers in [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md):
- **Caching** (prompt + answer) can cut repeated-call cost dramatically (high cache-hit on stable system prompts + recurring questions).
- **Model routing** keeps cheap tasks on cheap models (Haiku/Sonnet), reserving Opus for reasoning/agents.
- **Lean retrieval** sends few high-quality chunks, reducing tokens.

Target: **gross margin ≥ 70%** at the Team tier. A Team seat at $39/mo with disciplined COGS should cost well under $12/mo to serve, including infra amortization. Spend caps ensure a heavy user cannot drive a seat margin-negative.

### 4.2 LTV (lifetime value)
LTV = ARPA × gross margin × average lifetime. Drivers: ContextOS retention is structurally high because **switching cost compounds with accumulated context** — a team six months in loses its institutional memory if it churns. We model:
- **Team ARPA** scales with seats (land 3–5, expand to 10–20) and usage.
- **Net revenue retention (NRR)** target **> 110%** via seat + usage expansion (negative churn for healthy accounts).
- **Logo churn** target < 2%/mo for Team (lower for Enterprise).
With NRR > 110% and high gross margin, LTV is large relative to CAC.

### 4.3 CAC (customer acquisition cost)
Acquisition is **predominantly content/community/OSS/build-in-public + product-led virality** (team invites), which is low-cash CAC (mostly founder time early). Paid acquisition is minimal pre-scale. The funnel from #2/#3 (every generated server / indexed repo is a lead) further lowers CAC. Target **blended CAC payback < 12 months**, and far faster for self-serve Team.

### 4.4 The target ratios
| Metric | Target | Why it matters |
|--------|--------|----------------|
| Gross margin | ≥ 70% | SaaS-grade; protects the model from COGS |
| LTV / CAC | > 3:1 (aim 5:1+) | The core efficiency ratio investors underwrite |
| CAC payback | < 12 mo | Capital efficiency |
| NRR | > 110% | Expansion > churn = compounding revenue |
| Free → paid conversion | 3–8% (segment-dependent) | PLG funnel health |
| Logo churn (Team) | < 2%/mo | Retention from compounding switching cost |

### 4.5 The economic flywheel
More usage → more accumulated context → more value + higher switching cost → higher retention + expansion (NRR) → more revenue to invest in product → better product → more usage. Pricing is designed to *not* tax the behavior (engagement) that drives this flywheel — which is why we don't price-punish queries on paid tiers and why we keep Free genuinely useful.

---

## 5. Expansion Revenue Strategy
- **Seats:** land 3–5 developers, expand to the whole team (10–30) as adoption spreads bottom-up.
- **Usage:** more AI usage → metered overage above credits.
- **Tier upgrades:** Pro → Team (collaboration/governance), Team → Enterprise (security/compliance/on-prem).
- **Modules:** agents, integrations, advanced observability as the platform matures.
Expansion (cheaper than new-logo acquisition) is the primary growth lever once a base exists — hence the NRR > 110% target.

## 6. Tradeoffs, Risks, Alternatives
- **Tradeoff — usage pricing complexity vs. margin recovery:** usage metering recovers COGS but adds billing complexity and buyer anxiety; mitigated by spend caps, alerts, transparency, and a predictable Pro tier.
- **Risk — free tier cannibalization:** if Free is too generous, teams never upgrade; mitigated by capping volume + locking team/governance behind paid.
- **Risk — bill shock:** mitigated by hard caps (Free) and caps+alerts (paid).
- **Alternative rejected — pure seat pricing:** under-recovers AI COGS for heavy users (margin risk). **Alternative rejected — pure usage pricing:** unpredictable, suppresses engagement, scares buyers. The hybrid balances both.

## 7. Pricing Experiments To Run
- Per-seat vs. flat Team price ($49–199/mo) — which converts startups better?
- Free-tier query cap level (activation vs. COGS).
- Usage-credit sizing per tier; annual discount depth.
- Enterprise floor price and seat minimums.

## 8. Future Considerations
A usage-based "context API" product (third parties pay per call); marketplace take-rate revenue (#7); regional/residency premiums for Enterprise; outcome-based pricing experiments (e.g., per-onboarding-saved) once ROI is provable.

## 9. Related Documents
[GTM.md](./GTM.md) · [SALES.md](./SALES.md) · [CUSTOMERS.md](./CUSTOMERS.md) · [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md) · BUSINESS_STRATEGY.md

*Last reviewed 2026-06-19. All prices are validation hypotheses.*
