# ContextOS — OPEN SOURCE

Open-core (D-007): open-source the developer-loved primitives; keep the multi-tenant platform, governance, and hosted service proprietary.

## Open source (Apache-2.0)
| Component | Why open |
|-----------|----------|
| **Context handoff format + spec** | Portability builds trust (we don't hold context hostage); becomes a de-facto standard → distribution |
| **ContextOS CLI** (`pull`/`push`, local handoff) | Developer adoption; lives in terminals/CI; top-of-funnel |
| **Chunker / AST code-splitter** (`packages/rag` core) | Devs trust + contribute; recruiting; authority in RAG-over-code |
| **Eval harness primitives** (`packages/evals`) | Community quality contributions; thought leadership |
| **MCP server templates** (shared with #3) | Ride MCP adoption; funnel |
| **SDKs** (TS/Python clients) | Integration ease |

## Proprietary (commercial)
| Component | Why closed |
|-----------|-----------|
| Multi-tenant platform + hosted service | The actual product/revenue |
| Governance, RBAC, policy engine, audit | Enterprise value + hard to replicate |
| Integration Hub orchestration + credential vault | Operational moat |
| Agent runtime + observability at scale | Hard engineering + COGS-sensitive |
| Dashboards, billing, collaboration | Product surface |
| Managed retrieval at scale / index infra | Ops + cost moat |

## Rationale
- **OSS = distribution + trust + recruiting + funnel**, not direct revenue.
- **Proprietary = the parts that are hard to operate at scale** (multi-tenant, governance, hosting) — forks can't easily replicate these.
- Portability (open handoff format) is a *feature*, not a leak: it removes the lock-in objection and accelerates adoption, while the platform's value (governance, scale, integrations) keeps customers.

## Licensing
- OSS: Apache-2.0 (permissive → max adoption).
- Platform: commercial; source-available/escrow option for Enterprise if required.
- CLA for external contributors to keep relicensing flexibility.

## Community
Public roadmap for OSS parts; good first issues; responsive maintainership; the OSS repos double as the build-in-public surface. Guard against support burden by keeping the hard, hosted parts closed.

## Risk: competitor forks the OSS
Mitigation: the moat is the proprietary multi-tenant/governance/hosting + accumulated context + brand/community — not the chunker. We give away the commodity, keep the compound.
