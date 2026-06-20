# ContextOS — FEATURES

> The complete feature inventory on the maturity ladder (MVP → V1 → V2 → V3 → Future). Each feature carries a description, the user value, the rationale, and dependencies. This is the canonical scope document; [TASKS.md](./TASKS.md) decomposes these into work and [SPRINTS.md](./SPRINTS.md) sequences them.

## 1. Executive Summary

ContextOS's feature set is organized around one through-line: **make AI-assisted engineering reliable, governed, and cumulative.** The MVP exists to prove the wedge — the **Context Handoff** that ends context loss for a single team — and to do so with enough surrounding capability (auth, billing, grounded Q&A, basic analytics) that a team can actually adopt it. V1 makes it team-grade (collaboration, RBAC, observability, shared context). V2 adds the integration hub, agents, and automation that turn it into a platform. V3 unlocks enterprise (SSO, on-prem, governance) and the ecosystem (marketplace). The ordering is deliberate and ruthless: **each stage must independently deliver value and increase retention before the next is built**, because the graveyard of dev-tools startups is full of feature-complete products nobody adopted.

Legend: 🧠 context/memory · 🔌 integration/MCP · 🛡️ governance · 👁️ observability · 🤝 collaboration · 🤖 agents · 💳 commercial

---

## 2. MVP — Solve Context Loss for One Team

**Definition of done:** a solo developer or small team connects a repo, ContextOS builds project memory, any AI session (Claude Code/Cursor) can load that context, and the team *feels* the AI stop repeating mistakes. This is the "aha" that drives activation and word-of-mouth.

| # | Feature | Cat | Description & user value | Rationale / dependency |
|---|---------|-----|--------------------------|------------------------|
| M1 | **Authentication** | 💳 | Email + GitHub/Google OAuth; sessions/JWT | Table stakes; GitHub OAuth doubles as repo-connect consent |
| M2 | **Billing (Free/Pro)** | 💳 | Stripe checkout/portal; usage metering; spend caps | Monetize from day one; usage metering protects margin (depends on cost tracking) |
| M3 | **Project workspace** | 🧠 | Create/manage projects; connect a repo | The container for all context |
| M4 | **Context store** | 🧠 | Structured, versioned project memory: decisions, ADRs, conventions, glossary | The core durable asset; everything else references it |
| M5 | **Context Handoff** ⭐ | 🧠 | Export a project's context as a portable bundle (JSON + generated `CLAUDE.md`/`AGENTS.md`); restore it warm into any AI session/tool; diff bundles | **The wedge.** Solves context loss directly; portability builds trust (D-010) |
| M6 | **AI Q&A grounded in code** | 🧠 | "How does X work here?" → grounded answer with file:line citations; "I don't know" on low confidence; streaming | Makes context immediately useful; trust via citations (reuses #2 retrieval) |
| M7 | **Memory capture / extraction** | 🧠 | Auto-extract candidate decisions/conventions from chats, PRs, commits → human review → store | Context that maintains itself; turns corrections into durable memory |
| M8 | **Basic analytics** | 👁️ | Usage, tokens, and cost per project; per-query cost shown | Visibility + COGS awareness from line one (depends on metering) |
| M9 | **Feedback loop** | 🧠 | Thumbs/notes on AI output → improves context + feeds evals | Quality compounding; grows the golden eval dataset |
| M10 | **Backups / no data loss** | 🛡️ | Context is backed up; restore-tested | Trust: never lose a customer's institutional memory |

**Why this exact MVP:** it is the smallest scope that delivers a *visceral* "aha" (warm AI sessions) while being a real, monetizable product (auth + billing + grounded Q&A). It deliberately excludes teams/RBAC/agents — a single delighted developer comes first, and gold-plating org features pre-PMF is a classic trap (FOUNDERS_NOTES.md).

---

## 3. V1 — Team-Ready

**Theme:** turn a single-user "aha" into a team product where context is shared, governed lightly, and observable. This is where the **Team plan** (the revenue core) becomes compelling.

| # | Feature | Cat | Description & value |
|---|---------|-----|---------------------|
| V1-1 | **Teams & org accounts** | 🤝 | Invite teammates; multi-project orgs |
| V1-2 | **RBAC** | 🛡️ | Owner/Admin/Member/Viewer; per-project roles; deny-by-default |
| V1-3 | **Shared context** | 🤝🧠 | Team-wide memory (not per-user); a correction by one helps all |
| V1-4 | **Collaboration** | 🤝 | Comments, @mentions, context review/approval workflow |
| V1-5 | **AI activity feed / observability** | 👁️ | Who/what/when/cost across the team; "show context sent" debug view |
| V1-6 | **Unified search** | 🧠 | Semantic + keyword over all context, code, and docs |
| V1-7 | **Reporting** | 👁️ | AI usage, cost, adoption dashboards (for the eng lead) |
| V1-8 | **Living auto-docs** | 🧠 | Documentation generated and refreshed from the codebase (reuses #2) |
| V1-9 | **Architecture map** | 🧠 | Auto-generated architecture/dependency diagram (Mermaid) |
| V1-10 | **Spend caps + alerts** | 🛡️ | Per-project/team budgets; threshold alerts; graceful degradation |
| V1-11 | **Reliability** | 🛡️ | Multi-provider failover; graceful degradation on provider outage |

**Upgrade trigger:** the jump from Pro to Team is *collaboration + governance + visibility* — shared context, RBAC, and the spend/quality dashboards an eng lead needs. We do not cripple individuals to force upgrades; we add team value.

---

## 4. V2 — Agents, Integrations, Automation (the platform emerges)

**Theme:** ContextOS becomes the integration hub and the place agents run with team context and guardrails. This is where it stops being "a memory tool" and becomes a platform.

| # | Feature | Cat | Description & value |
|---|---------|-----|---------------------|
| V2-1 | **MCP Integration Hub** | 🔌 | Connect GitHub/Notion/Jira/Slack/DBs/custom tools via MCP; central auth, permission scopes, rate limits, audit (reuses #3) |
| V2-2 | **Agent runtime** | 🤖 | Run single/multi-agent flows with team context loaded; sandboxed, budgeted |
| V2-3 | **Agent observability** | 👁️🤖 | Trajectory traces, cost-per-task, failure taxonomy, replay (reuses #4) |
| V2-4 | **Automation / workflows** | 🤖 | Triggers (on PR/issue) → context-aware workflows (e.g., convention-check review) |
| V2-5 | **Guardrails console** | 🛡️ | Configure prompt-injection sensitivity, PII redaction, tool permissions, HITL gates |
| V2-6 | **Policy engine** | 🛡️ | Org policies: allowed models/tools, retention, spend caps, HITL requirements |
| V2-7 | **Marketplace hooks** | 🔌 | Install community agents/MCP servers/workflows (feeds #7) |
| V2-8 | **ContextOS as MCP server** | 🔌 | Expose the org's context to any external tool/agent via `/mcp` |

---

## 5. V3 — Enterprise & Ecosystem

**Theme:** unlock the largest contracts (governance, security, deployment) and the network-effect moat (marketplace).

| # | Feature | Cat | Description & value |
|---|---------|-----|---------------------|
| V3-1 | **SSO / SAML / SCIM** | 🛡️ | Enterprise identity + provisioning |
| V3-2 | **On-prem / VPC deployment** | 🛡️ | Code never leaves the customer network; Helm chart |
| V3-3 | **Full audit + compliance exports** | 🛡️ | SOC 2 evidence; immutable, hash-chained logs |
| V3-4 | **Multi-org / business-unit management** | 🛡️ | Enterprise hierarchy |
| V3-5 | **Advanced governance** | 🛡️ | Custom policies, data residency, BYO-key/BYO-model |
| V3-6 | **Marketplace GA** | 🔌 | Publish + monetize agents/servers/workflows (full #7) |

---

## 6. Future / Exploratory (not committed; tracked for vision alignment)
- IDE plugins (deep Cursor/VS Code integration beyond MCP).
- **Org-wide knowledge graph** across all repos/services.
- **Predictive context** ("you'll likely need X for this task") from usage data.
- Fine-tuned/distilled small model on proprietary, opt-in context data (only per D-001 revisit).
- Voice/meeting capture → context.
- Privacy-safe, opt-in cross-company benchmarks ("teams like yours converged on X").

---

## 7. Feature → Reuse Map (why ContextOS is built last in the wedge)
- Retrieval / codebase brain (M6, V1-8/9) ← **Codebase Intelligence (#2)**
- Integration hub (V2-1, V2-8) ← **MCP Server Generator (#3)**
- Agent observability (V2-3) ← **Agent Monitoring (#4)**
- Scaffolding (Future) ← **Bootstrapper (#5)**; Design (Future) ← **System Design Assistant (#6)**; Marketplace (V3-6) ← **#7**

Most of ContextOS's hard features ship first as standalone products; ContextOS is *assembly + the context/governance layer on top*. This is the entire rationale for the wedge build order (DECISION_LOG.md D-002).

---

## 8. Prioritization Method (how we decide what's in/out)
Each candidate is scored on: **(a) does it deepen the wedge or retention?** (b) does it unlock a paid tier? (c) does it reuse an existing engine (cheap) or require net-new hard work (expensive)? (d) does it serve the current ICP ([CUSTOMERS.md](./CUSTOMERS.md))? Features that don't deepen retention or unlock revenue are deferred regardless of how exciting they are. The Context Handoff scores highest on every axis, which is why it is the MVP centerpiece.

---

## 9. Real-World Examples (feature in action)
- **M5 Context Handoff:** A dev finishes a Claude Code session having taught it three conventions; they `contextos push`; their teammate opens Cursor, the bundle auto-loads, and Cursor already knows the conventions.
- **V1-7 Reporting:** An eng lead opens the dashboard and sees AI spend by project, week-4 retention of AI usage, and answer-helpfulness trend — and sets a $200/project spend cap (V1-10).
- **V2-2/3 Agents:** A "convention reviewer" agent runs on every PR, flags a violation with a citation, and pauses for human approval before commenting (HITL via the guardrails console V2-5).

## 10. Tradeoffs, Risks, Alternatives
- **Tradeoff — breadth vs. depth per stage:** we deliberately keep each stage narrow; the risk is appearing "too simple" early. We accept this; depth of the wedge beats breadth of a shallow platform.
- **Risk — scope seduction:** every V2/V3 feature is tempting to pull forward. Mitigation: the prioritization method (§8) and sprint discipline ([SPRINTS.md](./SPRINTS.md)).
- **Alternative rejected — lead with agents:** flashy but unreliable; agents are V2, after grounding and governance make them trustworthy.

## 11. Future Considerations
As the engines (#2/#3/#4) mature, V2 features get cheaper to ship (reuse). The marketplace (V3-6) is gated on distribution and is correctly the last feature. Predictive context and the org-wide knowledge graph are the long-horizon differentiators once data accumulates.

## 12. Related Documents
[README.md](./README.md) · [USER_STORIES.md](./USER_STORIES.md) · [TASKS.md](./TASKS.md) · [SPRINTS.md](./SPRINTS.md) · [PRICING.md](./PRICING.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

*Last reviewed 2026-06-19.*
