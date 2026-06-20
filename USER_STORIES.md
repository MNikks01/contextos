# ContextOS — USER STORIES

100+ stories in `As a / I want / So that` form, grouped by epic and tagged with the maturity stage `[MVP|V1|V2|V3]`. Personas: **Dev** (individual developer), **Lead** (eng lead/CTO), **NewHire**, **Agent** (an AI agent acting on behalf of a user), **Admin** (org admin), **Sec** (security/compliance), **Freelancer**, **Agency**.

---

## Epic A — Onboarding & Account
1. As a Dev, I want to sign up with GitHub, so that I can start without creating new credentials. [MVP]
2. As a Dev, I want to connect a repository in one click, so that ContextOS can build my project memory. [MVP]
3. As a Dev, I want a guided first-run that produces my first "context bundle," so that I see value in minutes. [MVP]
4. As a Lead, I want to create an organization and invite teammates, so that we share context. [V1]
5. As an Admin, I want to assign roles on invite, so that access is correct from the start. [V1]
6. As a Dev, I want to import existing `CLAUDE.md`/`AGENTS.md` files, so that my current setup migrates instantly. [MVP]
7. As a Freelancer, I want separate workspaces per client, so that contexts never bleed across projects. [MVP]
8. As a Dev, I want SSO login, so that I follow company policy. [V3]
9. As an Admin, I want SCIM provisioning, so that user lifecycle is automated. [V3]
10. As a Dev, I want to delete my account and data, so that I control my footprint. [MVP]

## Epic B — Context Capture & Memory
11. As a Dev, I want ContextOS to auto-extract conventions from my codebase, so that I don't write them by hand. [MVP]
12. As a Dev, I want decisions from my PRs/commits captured as memory, so that the "why" is preserved. [MVP]
13. As a Dev, I want to record an architecture decision (ADR) in two clicks, so that it's not lost. [MVP]
14. As a Lead, I want a team glossary of domain terms, so that AI uses our language correctly. [V1]
15. As a Dev, I want to mark a chat insight as "remember this," so that it becomes durable context. [MVP]
16. As a Dev, I want stale context flagged automatically, so that the AI doesn't ground on outdated info. [V1]
17. As a Dev, I want context versioned, so that I can see how decisions evolved. [V1]
18. As a Lead, I want to review/approve context before it's shared team-wide, so that quality is controlled. [V1]
19. As a Dev, I want context organized by module/service, so that retrieval is scoped and relevant. [V1]
20. As an Agent, I want to write back what I learned during a task, so that future runs benefit. [V2]
21. As a Dev, I want to attach external docs (Notion/Confluence) as context sources, so that knowledge is unified. [V2]
22. As a Dev, I want conflicting decisions surfaced, so that we resolve contradictions. [V1]
23. As a Lead, I want to see which context is most/least used, so that we prune noise. [V1]
24. As a Dev, I want commit/PR descriptions auto-enriched from context, so that history stays meaningful. [V2]

## Epic C — Context Handoff (the wedge)
25. As a Dev, I want to export my project context as a portable bundle, so that any AI tool can load it. [MVP]
26. As a Dev, I want to restore context into a new Claude Code session, so that it starts warm. [MVP]
27. As a Dev, I want my Cursor and Claude Code to share the same context, so that switching tools loses nothing. [MVP]
28. As a Dev, I want a fresh AI session to inherit prior corrections, so that it stops repeating mistakes. [MVP]
29. As a NewHire, I want to load the team's full context on day one, so that I ramp in days not weeks. [V1]
30. As an Agent, I want to fetch the latest team context via MCP, so that I act consistently with conventions. [V2]
31. As a Dev, I want context to sync automatically as the codebase changes, so that it never goes stale. [V1]
32. As a Dev, I want to scope a handoff to one feature/module, so that the AI isn't overloaded with irrelevant context. [V1]
33. As a Lead, I want context portability guaranteed (open format), so that I'm not locked in. [MVP]
34. As a Dev, I want to diff two context bundles, so that I see what changed between sessions. [V1]

## Epic D — AI Interaction & Retrieval
35. As a Dev, I want to chat with my project context, so that I get grounded answers about our system. [MVP]
36. As a Dev, I want answers to cite file:line, so that I can verify them. [MVP] (reuses #2)
37. As a Dev, I want to ask "how does X work in our codebase?", so that I understand unfamiliar code. [V1]
38. As a Dev, I want "I don't know" instead of a hallucination when context is missing, so that I can trust it. [MVP]
39. As a Dev, I want semantic + keyword search across code and docs, so that I find things by meaning or name. [V1]
40. As a Dev, I want the cheapest adequate model used per query, so that my costs stay low. [MVP]
41. As a Dev, I want streaming responses, so that I'm not staring at a spinner. [MVP]
42. As a Dev, I want to ask impact questions ("what breaks if I change this?"), so that I refactor safely. [V1] (reuses #2)
43. As a Dev, I want follow-up questions to keep context, so that the conversation is coherent. [MVP]
44. As a Lead, I want answers consistent with our approved decisions, so that AI doesn't contradict policy. [V1]

## Epic E — Integrations (MCP Hub)
45. As a Dev, I want to connect GitHub via MCP, so that AI can read issues/PRs/code. [V2]
46. As a Dev, I want to connect Slack, so that AI can reference team discussions. [V2]
47. As a Dev, I want to connect Jira/Linear, so that AI links work to tickets. [V2]
48. As a Dev, I want to connect Notion/Confluence, so that docs become context. [V2]
49. As a Dev, I want to connect a database via MCP, so that AI can answer data questions safely. [V2]
50. As an Admin, I want to manage which integrations are enabled org-wide, so that we control data exposure. [V2]
51. As an Admin, I want per-integration permission scopes, so that least privilege is enforced. [V2]
52. As a Dev, I want to add a custom internal tool as an MCP server, so that AI uses our proprietary systems. [V2] (reuses #3)
53. As an Admin, I want a central view of all connected tools and their permissions, so that nothing is unmanaged. [V2]
54. As a Dev, I want one-click install of a community MCP server, so that I extend capabilities fast. [V2] (feeds #7)

## Epic F — Collaboration
55. As a Lead, I want to share a project workspace with the team, so that everyone works from one context. [V1]
56. As a Dev, I want to comment on a decision/context entry, so that we discuss in place. [V1]
57. As a Dev, I want to @mention a teammate on a context item, so that I pull them in. [V1]
58. As a Lead, I want an activity feed of context changes, so that I stay aware. [V1]
59. As a Dev, I want to see who added/edited a piece of context, so that I know who to ask. [V1]
60. As a NewHire, I want a "start here" guided tour of the project context, so that I orient quickly. [V1]
61. As an Agency, I want to hand a client's context to a new contractor instantly, so that ramp is fast. [V1]
62. As a Lead, I want to fork a context as a template for new projects, so that we standardize. [V2]

## Epic G — Governance, Security & Compliance
63. As a Sec, I want RBAC on every project and integration, so that access follows policy. [V1]
64. As a Sec, I want an immutable audit log of all AI actions, so that we can investigate. [V1]
65. As a Sec, I want to know my code never trains any model, so that I can approve the tool. [MVP] (D-010)
66. As a Sec, I want PII auto-redacted before it hits a model, so that we avoid leaks. [V2]
67. As a Sec, I want prompt-injection detection on untrusted inputs, so that agents aren't hijacked. [V2]
68. As an Admin, I want to require human approval for destructive agent actions, so that nothing dangerous runs unattended. [V2]
69. As a Sec, I want data retention policies per project, so that we comply with regulations. [V2]
70. As a Sec, I want SOC 2 evidence exports, so that audits are painless. [V3]
71. As a Sec, I want on-prem/VPC deployment, so that code never leaves our network. [V3]
72. As an Admin, I want to set spend caps per project/team, so that AI costs can't run away. [V1]
73. As a Sec, I want secrets stored in a vault, never in context, so that credentials aren't exposed. [MVP]
74. As an Admin, I want to set data residency (region), so that we meet jurisdiction rules. [V3]
75. As a Sec, I want a policy engine to define allowed models/tools, so that usage is compliant. [V2]

## Epic H — Observability & Cost
76. As a Lead, I want a dashboard of AI usage and cost by team/project/person, so that I manage spend. [V1]
77. As a Dev, I want per-query cost shown, so that I'm cost-aware. [MVP]
78. As a Lead, I want alerts when spend exceeds a threshold, so that I'm not surprised. [V1]
79. As a Lead, I want adoption metrics (who uses AI, how much), so that I measure ROI. [V1]
80. As a Dev, I want to see latency of AI responses, so that I know what to expect. [V1]
81. As a Lead, I want answer-quality/feedback trends, so that I know if context is helping. [V1]
82. As a Lead, I want a report of AI activity for the month, so that I brief leadership. [V1]

## Epic I — Agents & Automation
83. As a Dev, I want to run an agent with my team's context loaded, so that it acts consistently. [V2]
84. As a Lead, I want to see an agent's full trajectory (steps/tools/cost), so that I trust and debug it. [V2] (reuses #4)
85. As a Dev, I want agents sandboxed, so that they can't damage my system. [V2]
86. As a Lead, I want to trigger a workflow on PR open (e.g., context-aware review), so that quality is automatic. [V2]
87. As a Dev, I want an agent to update docs when code changes, so that docs stay current. [V2]
88. As an Admin, I want budgets/step-limits per agent, so that runaway agents can't rack up cost. [V2]
89. As a Lead, I want a failure taxonomy of agent errors, so that we systematically improve. [V2] (reuses #4)
90. As a Dev, I want to replay a failed agent run, so that I can diagnose it. [V2]
91. As a Dev, I want agents to ask for approval before risky steps, so that I stay in control. [V2]

## Epic J — Billing & Plans
92. As a Dev, I want a generous free tier, so that I can evaluate without commitment. [MVP]
93. As a Dev, I want to upgrade to Pro self-serve, so that I unlock limits instantly. [MVP]
94. As a Lead, I want per-seat team billing, so that adding teammates is simple. [V1]
95. As a Lead, I want usage transparency and caps, so that I avoid bill shock. [MVP]
96. As an Admin, I want annual invoicing for Enterprise, so that procurement works. [V3]
97. As a Lead, I want to see which plan features we're hitting limits on, so that upgrading is informed. [V1]

## Epic K — Marketplace (later)
98. As a Dev, I want to browse community agents/MCP servers, so that I extend ContextOS. [V3] (#7)
99. As a creator, I want to publish and monetize an agent/server, so that I earn from my work. [V3] (#7)
100. As an Admin, I want only security-reviewed marketplace items installable, so that we stay safe. [V3] (#7)

## Epic L — Reliability & Trust
101. As a Dev, I want ContextOS to degrade gracefully if a model provider is down, so that I'm not blocked. [V1]
102. As a Dev, I want my context backed up, so that I never lose it. [MVP]
103. As a Lead, I want an SLA on uptime, so that we can depend on it. [V3]
104. As a Dev, I want to know exactly what context was sent to the model for an answer, so that there are no surprises. [V1]
105. As a Sec, I want every model call logged with inputs/outputs (redacted), so that we have full traceability. [V2]

---

*Stories drive [TASKS.md](./TASKS.md) and [SPRINTS.md](./SPRINTS.md). MVP stories (1–3, 6–7, 10–16, 25–28, 33, 35–41, 43, 65, 73, 77, 92–95, 102) are the launch scope.*
