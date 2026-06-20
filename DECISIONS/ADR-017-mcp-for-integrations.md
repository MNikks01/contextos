# ADR-017 — MCP for all tool/data integrations

**Status:** Accepted · **Date:** 2026-06-19

## Context
ContextOS must connect to GitHub, Notion, Jira/Linear, Slack, databases, and custom internal tools, and must expose its own context to external AI tools/agents. Bespoke integrations are M×N glue.

## Decision
Use the **Model Context Protocol (MCP)** as the standard for both inbound integrations (the Hub connects to MCP servers) and outbound exposure (ContextOS *is* an MCP server). Reuse the MCP Generator (#3) to create servers for custom internal tools.

## Alternatives
- **Bespoke per-integration adapters:** full control but M×N effort and no standardization.
- **A proprietary plugin protocol:** reinvents MCP; fights the ecosystem.
- **Zapier/iPaaS:** not AI-tool-native; wrong abstraction for agent tool-use.

## Consequences
- M+N instead of M×N integration effort; rides a fast-adopting open standard.
- Any MCP-aware host (Claude Desktop, Cursor, agents) can consume ContextOS.
- Central governance of tool calls (auth/permission/rate-limit/audit) in the Hub.

## Risks
- MCP spec churn/fragmentation. *Mitigation:* abstract behind our interfaces; track and contribute to the spec.
- Untrusted tool outputs = injection surface. *Mitigation:* treat tool output as data, never instructions; tool allowlist; see GUARDRAILS.
