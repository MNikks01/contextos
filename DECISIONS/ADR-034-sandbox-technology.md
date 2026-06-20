# ADR-034 — Sandbox technology for code-executing tools/agents

**Status:** Proposed (resolves an audit gap; confirm before V2 agent runtime) · **Date:** 2026-06-19

## Context
V2 agents and certain MCP tools may execute code or run untrusted operations over untrusted inputs (a customer's repo, tool outputs). The audit flagged that "sandboxed execution" is asserted across SECURITY/GUARDRAILS/AGENT_DESIGN without specifying the technology.

## Decision
**Proposed:** run all code-executing tools/agents in **ephemeral, isolated microVM/sandbox containers** — default to **gVisor-isolated containers** for general isolation, escalating to **Firecracker microVMs** for stronger tenant isolation where untrusted code runs. No ambient filesystem, no secrets, network egress allowlist only, CPU/memory/time limits, destroyed after run. Confirm the exact choice during V2 planning based on the hosting platform.

## Alternatives
- **Plain Docker containers:** insufficient kernel isolation for untrusted code execution.
- **Firecracker everywhere:** strongest isolation but heavier ops/cold-start; reserve for the highest-risk paths.
- **WASM sandbox:** promising for some tools, limited for arbitrary code today.

## Consequences
- A clear, defensible isolation story for security review and enterprise (a sales asset).
- Code execution can't damage the host, leak secrets, or reach other tenants.

## Risks
- Sandbox cold-start latency + ops complexity. *Mitigation:* warm pools for common cases; gVisor default, Firecracker only where justified; this is a V2 concern, not MVP.
- Choice may depend on the final hosting platform (PaaS vs. K8s). *Mitigation:* decide at V2 planning; keep the interface abstract so the implementation can swap.
