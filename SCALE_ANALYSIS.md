# ContextOS — SCALE ANALYSIS (Phase 2.1, Step 2)

> A Staff-Engineer / Principal-Architect / CTO review of whether the architecture survives 10 → 100,000 users, with bottlenecks, required changes, infrastructure changes, and **cost implications** at each tier. This **supersedes and expands** the scale section in [ARCHITECTURE.md §11](./ARCHITECTURE.md) (which now links here as the authoritative scale source). Assumptions are challenged, not assumed.

## 0. Executive Summary

The architecture **can** reach 100,000 users, but only because we evolve it tier-by-tier and refuse to distribute prematurely. The honest finding: **the binding constraint at every tier below ~10,000 users is not infrastructure — it is product/PMF and LLM COGS, not scale.** Three things actually break as we grow, in this order: (1) **embedding/indexing cost and throughput** (Tier 1–2), (2) **Postgres write/IO contention between OLTP, vectors, and time-series** (Tier 2–3), and (3) **organizational + cost-governance complexity of a distributed fleet** (Tier 3–4). pgvector carries us to ~Tier 2–3 before a dedicated vector store is justified; the modular monolith carries us to ~Tier 3 before microservices pay for themselves. The single most expensive mistake available to us is **adopting Kubernetes, microservices, or a dedicated vector DB at Tier 0–1** — solving scale we don't have while burning the runway that buys PMF. Every architectural split below is gated on a **measured** SLO or cost breach, never on anticipation.

**Unit definitions:** "users" ≈ active developers; ~5–15 developers per paying org; an active developer issues an estimated 20–100 AI requests/day and triggers indexing on each push. "Cost" figures are **order-of-magnitude planning estimates** (2026 managed-cloud + LLM pricing), not quotes — they exist to reason about *margin*, not to forecast a P&L.

---

## 1. The Load Model (what actually generates load)

Before sizing, name the load drivers — scale intuition fails without this:

| Driver | Scales with | Cost type | Hot/async |
|--------|-------------|-----------|-----------|
| AI requests (`/ask`, `/chat`) | active devs × requests/day | LLM tokens (variable, dominant) | hot/read |
| Embeddings | code churn (commits × changed files) | embedding tokens | async/write |
| Indexing/parsing | repo size + churn | CPU/IO | async/write |
| Vector search | AI requests | CPU/RAM (index in memory) | hot/read |
| Curated context writes | team activity | trivial | hot/write |
| Audit/usage/events | all activity (high fan-in) | storage + write IOPS | async/write |
| Agent runs | adoption of V2 | LLM + sandbox compute (spiky) | async |

**Key insight:** read load (AI requests) and write load (indexing/embedding) have *different* scaling curves and *different* cost structures. Conflating them is the root of most premature-scaling errors. The architecture's first real split (Retrieval service) exists precisely to separate them.

---

## 2. Tier 0 — 10 users (design partners / pre-PMF)

- **Topology:** one NestJS app (modular monolith) + one worker; managed Postgres+pgvector; one Redis; web on Vercel.
- **Can it support 10 users?** Trivially. A single small instance handles this with capacity to spare.
- **Bottleneck:** **none technical.** The bottleneck is PMF and whether the Context Handoff "aha" lands. Engineering effort spent on scale here is pure waste.
- **Required changes:** none. **Infra changes:** none — do **not** add K8s, microservices, a message broker, or a dedicated vector DB.
- **Cost implications:** ~$30–150/mo infra (small managed Postgres + Redis + a container + Vercel) **+ LLM usage** (the real variable). At 10 users the LLM bill might be tens to low-hundreds of dollars/month — already larger than infra. **The lesson begins here: COGS is LLM, not servers.**
- **CTO note:** instrument cost-per-request from day one or you will be blind to the only number that matters.

---

## 3. Tier 1 — 100 users (early traction, first paid teams)

- **Topology:** same monolith; **workers scaled horizontally and split by queue class** (indexing / embedding / agents); one Postgres **read replica**; CDN/WAF at the edge.
- **Can it support 100 users?** Yes, comfortably, with the worker split.
- **Bottlenecks:** (1) **embedding cost + indexing throughput** as repos and churn grow — the first real pressure; (2) bursty webhook-driven reindex storms.
- **Required changes:** content-hash caching (re-embed only changed files — must be working by now); batch embeddings; serialize reindex per `repo_id`; aggressive prompt + answer caching; per-tenant spend caps **live**.
- **Infra changes:** read replica; partition `audit_logs`/`usage_records`/`events` monthly; tune HNSW (`ef_construction`/`m`). Still **no K8s**.
- **Cost implications:** infra ~$300–1,500/mo; **LLM/embedding dominates** and can swing 5–10× with usage. At this tier, **margin is made or lost in the cache-hit rate and model routing**, not the server bill. Target: prove gross margin ≥ 70% *with real traffic* here.
- **Challenge to our assumptions:** if embedding cost is climbing super-linearly, our chunking is too granular or re-embedding too eagerly — fix the algorithm, don't add hardware.

---

## 4. Tier 2 — 1,000 users (scaling; Team plan is the revenue core)

- **Topology:** **extract the Retrieval service** (heaviest, most independently scalable) from the monolith into its own deployable; Orchestration/Context/Integration/Governance remain together; add a managed broker alongside Redis for cross-service events.
- **Can it support 1,000 users?** Yes, but only after the Retrieval split and Postgres tuning; a single un-split monolith would start to show vector-query and IO contention.
- **Bottlenecks:** (1) **Postgres IO contention** — OLTP writes, vector queries, and time-series ingestion competing on one instance; (2) **vector query p95** under large tenants as the HNSW index grows (RAM-bound); (3) connection exhaustion.
- **Required changes:** PgBouncer connection pooling; move hot time-series (usage/audit/events) toward a columnar store (ClickHouse) for analytics; partition vectors by tenant; consider a **separate Postgres instance for the vector workload** (still pgvector, isolated from OLTP) if vector p95 nears the 4s SLO.
- **Infra changes:** multiple read replicas; vertical scale-up of the primary; begin **evaluating** (not adopting) K8s; SOC 2 Type I process; canary deploys.
- **Cost implications:** infra ~$2K–10K/mo; LLM still the largest line. **Vector RAM is now a real cost** — at ~millions–tens of millions of chunks, the HNSW index footprint (multiple GB of RAM) drives instance sizing. **First point where infra cost is non-trivial relative to LLM** for read-heavy tenants.
- **Challenge:** is pgvector still the right call? Yes *if* p95 holds and ops stays simple. Set the explicit migration threshold now (ADR-002 / D-004 revisit): **>50M vectors/tenant OR vector p95 > SLO sustained.**

---

## 5. Tier 3 — 10,000 users (growth; enterprise pilots)

- **Topology:** **microservices for the heavy/independent planes** — Retrieval, Orchestration, Integration Hub, Workers as independent services; Governance + Billing + Context as a core service. **Introduce Kubernetes** (the ops tax is finally justified) with HPA on CPU + queue depth + RPS; GitOps (Argo/Flux); Terraform.
- **Can it support 10,000 users?** Yes, but this is the tier where **distributed-systems complexity becomes the dominant risk** — cross-service latency, tracing, and cost governance.
- **Bottlenecks:** (1) **distributed complexity** (debuggability, tail latency across services); (2) **cost governance at fleet scale** (keeping margin > 70% across many tenants with very different usage); (3) Postgres as a single OLTP primary; (4) dedicated vector store likely needed for the largest tenants.
- **Required changes:** robust OTel tracing + tail-based sampling; a centralized **model-routing service** with cost-based routing + provider failover; shared prompt-cache and answer-cache services; **split Postgres by domain** (OLTP vs. vectors vs. analytics) and/or shard; adopt a dedicated vector store if pgvector is past its threshold; per-tenant FinOps dashboards.
- **Enterprise changes:** SSO/SAML/SCIM; single-tenant isolation option (schema/DB-per-tenant) for the largest/most-sensitive; **VPC/on-prem (Helm)** path — *this may force K8s earlier than Tier 3 if a big enterprise demands on-prem at Tier 2; flag explicitly.*
- **Infra changes:** multi-AZ HA; tested DR (PITR + restore drills); SOC 2 Type II; error-budget policy; service mesh optional.
- **Cost implications:** infra ~$15K–80K/mo; LLM spend now large in absolute terms but ideally a controlled % of revenue. **A dedicated platform/SRE function becomes necessary** — the cost shifts from pure infra to **people + infra**. FinOps is now a discipline, not a dashboard.
- **Challenge:** the temptation is to over-fragment into too many microservices. Resist — split only the four planes that demonstrably need independent scaling; keep the rest cohesive.

---

## 6. Tier 4 — 100,000 users (platform scale)

- **Topology:** fully service-oriented, **multi-region**, Kubernetes-native; Retrieval and Orchestration scaled regionally; the MCP Hub is a fleet handling untrusted tool I/O in isolated sandboxes; a durable, replayable broker (Kafka-class) feeds analytics and the (now live) marketplace (#7).
- **Can it support 100,000 users?** Yes — but the constraints are now **organizational and economic**, not architectural. The architecture is "known"; the hard part is running it efficiently and keeping margin.
- **Bottlenecks:** (1) **gross-margin defense at fleet LLM spend**; (2) **multi-region data consistency + residency**; (3) **operational coordination** across many services/teams; (4) OLTP sharding (`org_id`-sharded Postgres / Citus-class / Spanner-class).
- **Required changes:** sharded vector store partitioned by tenant; OLTP sharded by `org_id`; columnar analytics warehouse; tiered caching (edge prompt cache + regional answer cache); cost/latency/quality-aware routing across providers **and possibly self-hosted open-weight models for the cheapest high-volume paths** (only if D-001's revisit conditions are met); data residency (EU/US) controls; per-tenant encryption (BYOK).
- **Infra changes:** multi-region K8s; global traffic management; fleet-wide policy engine; full compliance posture (SOC 2 II, ISO 27001, residency).
- **Cost implications:** infra + LLM in the high-six to seven figures/year; **the strategic cost lever is inference economics** — caching, routing, and (potentially) self-hosting the cheapest paths. Dedicated **FinOps + platform/SRE** functions. Customers may *see and tune* their own spend as a product surface.
- **Challenge:** at this tier, "build vs. rent the model" genuinely reopens (D-001 revisit) — but only for narrow, high-volume, cost-sensitive paths via distillation/fine-tuning, never frontier pre-training.

---

## 7. Scale Summary Table

| Dimension | 10 | 100 | 1,000 | 10,000 | 100,000 |
|-----------|----|-----|-------|--------|---------|
| Topology | monolith+1 worker | monolith+worker pool | Retrieval split out | microservices/K8s | multi-region SOA |
| Real bottleneck | **PMF** | **embedding cost/throughput** | **Postgres IO / vector p95** | **distributed complexity + FinOps** | **margin + org scaling** |
| Postgres | single | +read replica | +replicas, partitions, PgBouncer | split by domain / shard | sharded multi-region |
| Vectors | pgvector | pgvector (tuned) | pgvector partitioned (maybe isolated instance) | dedicated store (if past threshold) | sharded vector store |
| Events | Redis Streams | Redis Streams | +managed broker | durable broker | Kafka-class replayable |
| Infra $/mo (est.) | $30–150 | $300–1.5K | $2K–10K | $15K–80K | $100K+ |
| Dominant cost | LLM | LLM | LLM (+vector RAM) | LLM + people | LLM economics + people |
| Compliance | privacy page | +DPA | SOC 2 I | SOC 2 II, SSO, VPC | +ISO, residency, BYOK |
| Org | solo | solo+contractor | +eng, on-call forms | +platform/SRE, FinOps | +multiple teams |

---

## 8. Cross-Cutting Cost Reality (the thing most scale analyses miss)
Across **every** tier below 100K users, **LLM/embedding tokens are the dominant variable cost — usually larger than all infrastructure combined.** This inverts the classic SaaS scaling story (where infra is the cost). The implications:
- **Margin is an AI-architecture problem, not an infra problem.** The levers (caching, routing, lean retrieval, spend caps — [AI_ARCHITECTURE.md §9](./AI_ARCHITECTURE.md)) matter more than instance sizing until very large scale.
- **Cost-per-task must be instrumented from Tier 0** and tracked as a product metric, with anomaly alerts.
- **A heavy free-tier user can be margin-negative** without hard caps — free-tier cost guards are a scaling requirement, not a nicety.

---

## 9. Failure Domains & Blast Radius (under-specified in ARCHITECTURE — addressed here)
- **LLM provider outage:** mitigated by multi-provider failover (D-003). Blast radius: degraded AI quality, not downtime, if failover works. *Test this.*
- **Vector store / Retrieval down:** AI Q&A degrades to "I don't know" + curated-context-only answers; the app stays up. Acceptable graceful degradation.
- **Postgres primary down:** full outage at Tier 0–2 (single primary). Mitigated by multi-AZ + read replicas (promote) at Tier 2+. RTO/RPO targets: RPO ≤ 5 min (PITR), RTO ≤ 1 hr (Tier 2+).
- **Redis/broker down:** indexing/agents pause (queued), hot reads cached briefly; surface index-staleness to users.
- **A single tenant's heavy load:** must not degrade others — per-tenant rate limits + spend caps + (Tier 3+) noisy-neighbor isolation.

---

## 10. Verdict & Recommendations
1. **The architecture is sound and appropriately staged.** The tier discipline (split only on measured breach) is the single most important scaling decision.
2. **Do not pre-scale.** No K8s/microservices/dedicated-vector-DB before the measured triggers. This is the most likely self-inflicted wound.
3. **Treat margin as an AI-architecture KPI from Tier 0.** Cost-per-task instrumentation + caching + routing are scaling infrastructure.
4. **Pin the reuse dependency (#2/#3).** The architecture assumes their engines; that dependency is a scaling/scheduling risk, not just a build risk.
5. **Make the K8s/on-prem trigger explicit** (enterprise on-prem may force K8s before Tier 3).
6. **Set quantified thresholds now:** vector-DB migration (>50M vectors/tenant OR vector p95 > SLO); Postgres split (IO contention measured); microservices (a plane's scaling demonstrably diverges).

## 11. Related Documents
[ARCHITECTURE.md](./ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md) · [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md) · [DEVOPS.md](./DEVOPS.md) · [DECISIONS/ADR-002-use-pgvector.md](./DECISIONS/ADR-002-use-pgvector.md) · [DECISIONS/ADR-005-modular-monolith-first.md](./DECISIONS/ADR-005-modular-monolith-first.md) · [DECISIONS/ADR-024-managed-cloud-kubernetes-later.md](./DECISIONS/ADR-024-managed-cloud-kubernetes-later.md)

*Authoritative scale source for ContextOS. Cost figures are order-of-magnitude planning estimates. Last reviewed 2026-06-19.*
