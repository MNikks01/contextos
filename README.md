# ContextOS — AI Developer Workspace

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![Free & Open Source](https://img.shields.io/badge/Free%20%26%20Open%20Source-%E2%9C%93-brightgreen.svg)](#-free--open-source)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%99%A5-ff69b4.svg)](https://github.com/sponsors/MNikks01)

> 💚 **Free & open source, forever.** Every feature is available to everyone — no paywalls, no tiers, no sign-up. Clone and self-host it, or use the hosted app. Licensed under Apache-2.0. If it helps you, [sponsoring](https://github.com/sponsors/MNikks01) is welcome but always optional.

**▶ Try it / deploy your own:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMNikks01%2Fcontextos&root-directory=web&project-name=contextos) · see [DEPLOY.md](./DEPLOY.md) for CLI & self-hosting.

**🖥️ CLI:** capture durable team context and hand it off to any AI session. From a clone (`npm link` in `engine/` to get the `contextos` command, or run directly):
```bash
node engine/src/cli.ts add decision "Use integer cents for money" "Avoid floats"
node engine/src/cli.ts list
node engine/src/cli.ts files            # write CLAUDE.md / AGENTS.md / llms.txt
node engine/src/cli.ts export -o handoff.json
node engine/src/cli.ts ask "how is money stored?"
```


> **The context and governance operating system for AI-assisted engineering teams.** ContextOS is what you get when you fuse *Cursor + Claude Code + Notion + GitHub + MCP + a persistent memory layer* into one platform — so that every AI tool, agent, session, and teammate shares the same institutional memory and operates under the same controls.

**Project #1 (Flagship)** · Strategic priority ⭐⭐⭐ · Build position in wedge: 3rd (the platform that absorbs #2 and #3) · Time-to-MVP: 3–4 months when assembled from the Codebase Intelligence (#2) and MCP Generator (#3) engines.

---

## About this repository

This is **ContextOS (project #1)**, extracted from a larger "AI Startup Lab." The docs at the repo root are the product spec/vision; references to sibling projects (Codebase Intelligence, MCP Server Generator) and shared lab files point to that broader context and aren't part of this standalone repo. The two are open-sourced separately:
[`codebase-intelligence`](https://github.com/MNikks01/codebase-intelligence) (#2, the retrieval engine ContextOS reuses) and [`mcp-server-generator`](https://github.com/MNikks01/mcp-server-generator) (#3).

**The working engine is in [`engine/`](./engine)** — the **Context Handoff**: capture a team's durable context (decisions, conventions, glossary) and export it as a portable bundle plus generated `CLAUDE.md` / `AGENTS.md` / `llms.txt`, so any AI tool or fresh session *starts warm*. Pure TypeScript, zero-network. A matching **MCP server** in [`mcp-server/`](./mcp-server) serves that context to Claude Desktop / Cursor / agents. Try it:
```bash
cd engine && node scripts/demo.ts && node scripts/test.ts   # the Handoff, end to end (15/15 tests)
cd ../mcp-server && npm install && npm run smoke            # serve context over MCP
```

Licensed under **Apache-2.0** — see [LICENSE](./LICENSE).

---

## 1. Executive Summary

Every engineering organization in 2026 has adopted AI coding tools — Cursor, GitHub Copilot, Claude Code, Windsurf, autonomous agents. Adoption is near-universal and still accelerating. But the tools are **amnesiac and solitary**: each session starts cold, each tool keeps its own private context, and the institutional knowledge an AI needs to be correct (architecture, decisions, conventions, ownership, history) lives in human heads and stale wikis. The result is a paradox: teams have superhuman code-generation capacity and subhuman code-*understanding* continuity. AI repeats known mistakes, new hires and new agents ramp slowly, AI spend is invisible and unbounded, and nobody can govern or audit what the AI actually did.

ContextOS solves this by becoming the **context layer and control plane** that sits *around* the AI tools teams already use. It does four things no incumbent does together:

1. **Persistent, shared memory** — a living store of the team's architecture, decisions (ADRs), conventions, glossary, and history that any AI tool or agent can load. We call the flagship capability the **Context Handoff**: export the team's context from one session/tool and restore it into another (Cursor → Claude Code → CI agent) so AI always starts *warm*.
2. **Codebase intelligence** — deep, retrieval-grounded understanding of the actual code (reusing the Codebase Intelligence engine, project #2), so answers and agents are grounded in reality with file:line citations, not generic patterns.
3. **MCP integration hub** — a single, governed place to connect GitHub, Notion, Jira/Linear, Slack, databases, and custom internal tools via the Model Context Protocol (reusing the MCP Generator, project #3), with central auth, permission scopes, rate limits, and audit.
4. **Governance + observability** — RBAC, audit logs, spend caps, guardrails (prompt-injection defense, PII redaction, human-in-the-loop), and full cost/quality observability over all AI-assisted work.

The strategic insight is that **the model is a rented commodity** (we never train one — see DECISION_LOG.md D-001) and **the editor is a crowded battlefield** (Cursor, Copilot, Windsurf). The durable, defensible, compounding asset is **the team's accumulated context and the controls around it** — which IDEs and model vendors are structurally disincentivized to make portable, because they want lock-in to *their* tool. ContextOS wins by being Switzerland: tool-agnostic, portable, and governed.

This README is the front door to ContextOS's documentation. It is implementation-oriented: a competent engineer, product manager, or AI agent should be able to start here, follow the cross-links, and build the product. Deeper word-count and structural depth live in the linked documents; this file orients you.

---

## 2. Detailed Explanation — What ContextOS Is

ContextOS is a multi-tenant SaaS plus a thin local layer (CLI + MCP server) that integrates with the developer's existing tools. Conceptually it has five planes:

| Plane | Responsibility | Analogy |
|-------|----------------|---------|
| **Memory plane** | Curated, versioned institutional knowledge: decisions, conventions, glossary, ADRs, ownership | Notion, but code-aware and AI-consumable |
| **Knowledge plane** | Derived understanding of the codebase: search, Q&A, impact analysis (reuses #2) | The "@codebase" of Cursor, but shared, governed, and API/MCP-first |
| **Integration plane** | MCP hub connecting external tools/data (reuses #3) | Zapier/MCP registry, but centrally governed |
| **Orchestration plane** | Runs AI chat, workflows, and agents with the above context loaded, model-routed and cost-controlled | Claude Code / an agent runtime, but team-aware |
| **Control plane** | RBAC, audit, policy, guardrails, observability, billing | Okta + Datadog + a policy engine for AI work |

The **unit of value** is durable, shared *context* — not a single completion. That reframing is the whole company. Where Cursor optimizes "the next edit for this developer in this session," ContextOS optimizes "the cumulative correctness and governance of all AI-assisted work across the team over time."

### The flagship workflow: Context Handoff
A developer working in Claude Code corrects the AI ("we use Drizzle, not Prisma; auth lives in `packages/auth`; never call the vendor SDK directly"). Today that correction dies when the session closes and never reaches their teammate's Cursor. In ContextOS, those corrections are captured (manually or auto-extracted from the session/PR), reviewed, and stored as durable context. The next session — *any* tool, *any* teammate, *any* agent — loads the team's context bundle and starts warm, never re-making the corrected mistake. This is the "aha" that drives activation and retention (see [GTM.md](./GTM.md)).

---

## 3. Real-World Examples (illustrative scenarios)

- **Series-A SaaS team (12 engineers):** Onboarding a new hire historically took 3 weeks of senior-dev hand-holding. With ContextOS, the new dev (and their AI tools) load the team context bundle on day one — architecture map, decisions, conventions, "start here" tours — and ship a real PR in 3 days. The eng lead sees, in one dashboard, that the team spent $1,840 on AI last month and that 92% of AI answers were rated helpful.
- **Agency (8 devs, 15 concurrent client codebases):** Context-switching between client repos used to cost hours daily. ContextOS keeps per-client context isolated and instantly restorable; a contractor rotating onto a client project inherits its full institutional memory in minutes, raising billable utilization.
- **Platform team at a 600-engineer enterprise:** Security needs to answer "what did AI touch in the payments service last quarter, and was any of it unsafe?" ContextOS's immutable audit log + guardrail console answers it in minutes and enforces that destructive agent actions require human approval.

---

## 4. Tradeoffs (and how we resolve them)

| Tradeoff | Tension | ContextOS choice |
|----------|---------|------------------|
| Tool-agnostic vs. deep integration | Being neutral can mean shallow integration | Go deep via MCP + a thin local layer; neutrality is the moat, depth comes from MCP standardization |
| Portable context vs. lock-in | Portability reduces switching cost (a "weakness") | Make context portable on purpose — trust drives adoption; the moat is *accumulated* context + governance + integrations, not hostage data (D-010) |
| Workflows vs. agents | Agents are exciting but unreliable | Prefer governed workflows; use agents only where dynamic reasoning is required ([AGENT_DESIGN.md](./AGENT_DESIGN.md)) |
| Build vs. assemble | Building cold is slow | Assemble ContextOS from the proven #2 (retrieval) and #3 (MCP) engines — the wedge strategy (DECISION_LOG.md D-002) |
| Self-serve vs. enterprise | Different motions, limited bandwidth | Land bottom-up (PLG, free Context Handoff) → expand to Team → sell governance to Enterprise |

---

## 5. Risks (top-level; full register in [RISKS.md](./RISKS.md))

1. **Incumbent bundling** — GitHub/Cursor/Anthropic could ship a native context layer. Mitigation: be the tool-agnostic, governed, portable layer they structurally won't build.
2. **RAG-over-code quality** — if grounding is mediocre, trust collapses. Mitigation: over-invest in the #2 engine; evals in CI; "I don't know" over hallucination.
3. **LLM COGS** — token costs can exceed margin. Mitigation: caching, model routing, lean retrieval, usage pricing, spend caps (target 70%+ gross margin).
4. **Founder focus** — a solo founder spreading across 7 products. Mitigation: strict sequencing; ContextOS is built *after* #3/#2 prove the hard parts.

---

## 6. Alternatives Considered (why ContextOS, not something else)

- **"Just a better IDE":** crowded (Cursor/Windsurf), and per-user by design; doesn't solve team memory/governance.
- **"Just a wiki with AI" (Notion AI):** not code-aware, not in the dev loop, manually maintained → stale.
- **"Just an agent" (Devin-style):** powerful but solitary, amnesiac across runs, hard to trust/govern.
- **"Just LLM observability" (LangSmith-style):** watches calls, not the knowledge/governance layer.

ContextOS is deliberately the *connective tissue* none of these own. See COMPETITOR_ANALYSIS.md.

---

## 7. Future Considerations

- **Org-wide knowledge graph** across all repos/services (V3).
- **Predictive context** ("you'll need X for this task") once usage data accumulates.
- **Fine-tuned/distilled small models** on proprietary, opt-in context data — only when D-001's revisit conditions are met.
- **On-prem/VPC** for regulated enterprises (V3), unlocking the largest contracts.
- **Marketplace hooks** feeding project #7 (Agent Marketplace) once distribution exists.

---

## 8. Capability Maturity Ladder

| Stage | Theme | Headline capabilities |
|-------|-------|----------------------|
| **MVP** | Solve context loss for one team | Auth, billing, project workspace, context store + memory, **Context Handoff**, AI Q&A grounded in code, basic analytics, feedback loop |
| **V1** | Team-ready | Teams, RBAC, shared context, collaboration, observability, search, reporting, living auto-docs |
| **V2** | Agents + integrations | MCP integration hub, agent runtime + observability, automation/workflows, guardrails console, enterprise controls |
| **V3** | Enterprise + ecosystem | SSO/SAML/SCIM, on-prem/VPC, advanced governance, multi-org, marketplace GA |

Full inventory and gating in [FEATURES.md](./FEATURES.md).

---

## 9. Document Map (this folder)

**Strategy:** [VISION](./VISION.md) · [PROBLEM](./PROBLEM.md) · [CUSTOMERS](./CUSTOMERS.md) · [FEATURES](./FEATURES.md) · [USER_STORIES](./USER_STORIES.md)
**Engineering:** [ARCHITECTURE](./ARCHITECTURE.md) · [TECH_STACK](./TECH_STACK.md) · [DATABASE](./DATABASE.md) · [API_DESIGN](./API_DESIGN.md) · [AI_ARCHITECTURE](./AI_ARCHITECTURE.md) · [RAG](./RAG.md) · [MCP](./MCP.md) · [AGENT_DESIGN](./AGENT_DESIGN.md)
**Production:** [SECURITY](./SECURITY.md) · [OBSERVABILITY](./OBSERVABILITY.md) · [GUARDRAILS](./GUARDRAILS.md) · [DEVOPS](./DEVOPS.md)
**Execution:** [TASKS](./TASKS.md) · [SPRINTS](./SPRINTS.md)
**Business:** [PRICING](./PRICING.md) · [GTM](./GTM.md) · [SALES](./SALES.md) · [RISKS](./RISKS.md) · [HIRING](./HIRING.md) · [OPEN_SOURCE](./OPEN_SOURCE.md) · [RESUME_VALUE](./RESUME_VALUE.md)
**AI-agent context:** [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) · [AI_CONTEXT.md](./AI_CONTEXT.md) · [PROJECT_MEMORY.md](./PROJECT_MEMORY.md) · [DECISIONS.md](./DECISIONS.md) · [llms.txt](./llms.txt) · [mcp.json](./mcp.json)

---

## 10. One-liner

> ContextOS is the team memory and control plane for AI-assisted engineering — so your tools, agents, and teammates never lose the plot, and you can see, govern, and trust everything the AI does.

*Flagship of the AI Startup Lab. Build after the wedge (#3 → #2 → #1). See START_HERE.md and ROADMAP.md.*
