# ContextOS — CUSTOMERS

> Ideal customer profiles, jobs-to-be-done, buyer vs. user dynamics, segmentation, and the validation questions that de-risk each segment. This document feeds [GTM.md](./GTM.md), [SALES.md](./SALES.md), and [PRICING.md](./PRICING.md).

## 1. Executive Summary

ContextOS sells to **engineering teams that have already adopted AI coding tools and are now feeling the pain of context loss, slow onboarding, and ungoverned AI spend.** The motion is **bottom-up product-led growth**: individual developers adopt the free Context Handoff, evangelize it to their team, the team upgrades for collaboration + governance, and eventually the enterprise buys for security + compliance + deployment control. The beachhead is the **Series-A-to-mid-stage SaaS engineering team (3–30 engineers)** — fast-moving, GitHub-centric, heavy AI-tool adopters with budget and acute onboarding/context pain. Agencies are a high-willingness-to-pay second segment; enterprises are the Year-2 expansion that unlocks large contracts. The free-tier user (solo dev/freelancer) is the adoption and evangelism engine, not the revenue core. Understanding *who buys, who uses, and what job they hire ContextOS for* is the foundation of every go-to-market and pricing decision.

---

## 2. Ideal Customer Profiles

### ICP-1 — SaaS startup engineering team (PRIMARY beachhead)
- **Profile:** 3–30 engineers, post-seed to Series B, fast-moving, GitHub + Cursor/Claude Code + Slack + Linear/Jira + Postgres. Heavy AI-tool adoption already.
- **Pain:** onboarding is slow, context is lost across tools/people, AI output is inconsistent, AI spend is invisible.
- **Why they buy:** ship faster with fewer regressions; onboard humans and agents instantly; control and see AI spend.
- **Budget:** already paying $10–40/dev/mo for AI tools; will add $15–40/dev/mo for the platform layer.
- **Buyer:** eng lead / staff engineer / CTO. **User:** every developer.
- **Where to find them:** developer communities, Product Hunt, X/LinkedIn build-in-public, YC/accelerator networks, the funnel from #2/#3.

### ICP-2 — Software agency / dev shop
- **Profile:** 5–50 people, many concurrent client codebases.
- **Pain:** context-switching across client repos; knowledge walks out with contractors; client onboarding is pure cost.
- **Why they buy:** per-client context isolation + instant restore = higher billable utilization and faster delivery.
- **Buyer:** agency owner / tech lead. **WTP:** high (efficiency = margin).

### ICP-3 — Enterprise platform / DevEx team (EXPANSION, Year 2)
- **Profile:** 100–1,000+ engineers; standardizing AI use; security/compliance requirements.
- **Pain:** governance, audit, compliance, policy enforcement, on-prem/VPC needs; key-person knowledge risk.
- **Why they buy:** a central control plane for AI-assisted engineering; audit trails; policy; deployment control.
- **Buyer:** VP Eng / Head of DevEx / Security. Long cycle, large ACV; needs SSO, SOC 2, on-prem.

### ICP-4 — Senior freelancer / solo developer (FREE → PRO funnel)
- **Profile:** individual professional juggling client projects.
- **Pain:** context loss across projects; re-explaining the system to the AI daily.
- **Role:** adoption + evangelism engine; cheap Pro; not the revenue core.

---

## 3. Anti-Personas (who we do NOT target)
- Non-technical / no-code builders (different product, different trust model).
- Teams not yet using AI tools (must be educated first — too costly to convert pre-adoption).
- Hobbyists unwilling to pay anything (served by the free tier; not a customer).
Targeting these dilutes focus and corrupts the product roadmap.

---

## 4. Jobs To Be Done
1. "When I start an AI session, **give my tool the team's context automatically** so it stops making known mistakes."
2. "When a human or agent joins, **make them productive in days, not weeks**."
3. "When AI does work across my org, **let me see, cost, and govern it**."
4. "When I switch tools or sessions, **don't lose what the AI learned**."
5. "When auditors/security ask, **prove what AI touched and that it was safe**."

JTBD #1 and #4 are the wedge (Context Handoff); #2 is the onboarding ROI story; #3 and #5 unlock Team and Enterprise.

---

## 5. Buyer vs. User
- **User (bottom-up):** individual developers — they adopt via the free tier and evangelize. The product must delight a single developer *before* any team value exists.
- **Buyer (top-down):** eng lead/CTO (Team), VP Eng/Security (Enterprise) — they pay for collaboration, governance, visibility, and compliance.
- **Motion:** PLG land (individual/team free) → expand (seats + governance) → enterprise (security/compliance/deployment). The product must serve both: a delightful individual experience *and* the dashboards/controls a buyer needs. See [GTM.md](./GTM.md), [SALES.md](./SALES.md).

---

## 6. Segment Prioritization

| Segment | When | Why |
|---------|------|-----|
| Solo / freelancer (free→Pro) | Launch | Adoption engine, feedback, evangelism |
| SaaS startup teams (Team) | Launch → Year 1 | Beachhead; fastest paid conversion; clearest pain |
| Agencies (Team) | Year 1 | High WTP, clear ROI |
| Enterprise | Year 2 | Largest contracts; gated on SOC 2 / SSO / on-prem |

---

## 7. Real-World Customer Snapshots (illustrative)
- **"Northwind" (Series A, 14 engineers):** adopts free Handoff via two developers; within a month the whole team is on it; the CTO upgrades to Team for the spend dashboard and shared context after onboarding a new hire in 3 days instead of 3 weeks.
- **"Pixel & Bolt" (agency, 9 devs, 12 clients):** buys Team immediately; the value is per-client context isolation and instant contractor onboarding — measurable utilization gain.
- **"GlobalBank DevEx" (enterprise, 800 engineers):** a 9-month cycle; starts as a 30-seat pilot in one BU; expands after SOC 2 Type II and an on-prem option close the security objection.

## 8. Tradeoffs, Risks, Alternatives
- **Tradeoff — bottom-up vs. top-down:** PLG is cheap and fast but yields small initial ACV; enterprise is large but slow. We land bottom-up and expand, refusing to build heavy enterprise features before PMF.
- **Risk — "nice to have" perception:** mitigated by quantifying the pain (onboarding weeks, repeated-mistake tax, AI spend) and a free tier that delivers an undeniable "aha."
- **Alternative rejected — enterprise-first:** higher ACV but slow, capital-intensive, and wrong for a solo/small founding team; we earn enterprise by first winning developers.

## 9. Future Considerations
As agents proliferate, a new buyer emerges: the team responsible for *agent operations*, who needs ContextOS to give agents institutional memory and guardrails. ContextOS's ICP expands with AI adoption rather than contracting.

## 10. Validation Questions (ask every design partner)
- How is your team's AI tooling losing context today, and what does it cost you (hours/week, repeated mistakes)?
- How long does onboarding take, and what's the senior-dev interrupt tax?
- Can anyone tell you what AI did across your codebase last month, and what it cost?
- What would make you trust a tool with your private code?
- Who signs off on a new dev tool — the eng lead, security, or both?

## 11. Related Documents
[PROBLEM.md](./PROBLEM.md) · [GTM.md](./GTM.md) · [SALES.md](./SALES.md) · [PRICING.md](./PRICING.md) · MARKET_RESEARCH.md

*Last reviewed 2026-06-19.*
