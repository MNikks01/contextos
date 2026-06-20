# ContextOS — OBSERVABILITY

Three pillars (metrics/logs/traces) + AI-specific observability (cost, quality, agent trajectories). Stack: OpenTelemetry → Prometheus/Grafana; Sentry; structured logs. This capability also seeds Agent Monitoring (#4).

## 1. Metrics
**System:** request rate, latency p50/p95/p99, error rate, queue depth, worker throughput, DB/Redis health, index lag.
**AI:** tokens in/out per request, **cost per request/task**, model mix, cache hit rate, retrieval recall (sampled), answer faithfulness score (sampled), tool-call success rate, agent task success rate, agent steps per task.
**Business:** signups, activation rate, WAU/MAU, free→paid conversion, MRR, churn, per-tenant usage/cost.

Exposed via Prometheus; dashboards in Grafana.

## 2. Logs
- Structured JSON logs (request id, org id, user/agent id, route, latency, cost).
- AI call logs: model, prompt hash, token counts, cost, latency, cache hit, **redacted** I/O (PII-stripped) — retained per policy.
- Centralized (Loki/managed); correlated with traces via trace id.
- No secrets/PII in logs (enforced by a logging middleware filter).

## 3. Traces
- OpenTelemetry spans across the whole request: gateway → orchestration → retrieval → LLM call → tool calls → response.
- **AI spans** carry attributes: model, tokens, cost, cache, retrieval-k, rerank score.
- **Agent trajectory traces:** each step (reason/tool/observe) is a span; the run is a trace → replayable.
- Tail-based sampling: keep all errors + slow/expensive requests + sample of normal.

## 4. Dashboards
| Dashboard | For | Shows |
|-----------|-----|-------|
| System health | Eng | latency, errors, saturation, queues |
| AI cost | Founder/Lead | cost by org/project/model/task; cache hit; trend vs. revenue (margin) |
| AI quality | Eng | faithfulness, citation correctness, retrieval recall, feedback trend |
| Agent ops | Eng/Lead | task success, steps, failures by taxonomy, cost-per-task |
| Customer usage | Lead/Admin | adoption, who/what/when, per-team spend |
| Business | Founder | signups→activation→retention→MRR funnel |

## 5. Alerts
- Latency p95 > SLO; error rate spike; provider outage (→ failover); queue backlog.
- **Cost anomalies:** org/project spend spike; margin breach; runaway agent.
- Quality regression: faithfulness drops below threshold (from live sampling or CI evals).
- Security: auth failures spike, cross-tenant access attempt, audit-log write failure.
- Routed to PagerDuty/Slack by severity.

## 6. AI quality observability (the differentiator)
- Live sampling of answers/agent runs into the eval pipeline (LLM-as-judge + feedback).
- Failure taxonomy for agents: wrong tool, bad args, hallucination, loop, gave-up, budget-exceeded, unsafe.
- Per-feature golden eval scores tracked over time; CI gate on regression.
- "Show context sent" debugging: for any answer, view exactly what entered the prompt (transparency + debugging).

## 7. SLOs (targets)
- Availability 99.9% (V3 SLA).
- Answer first-token < 1.5s; full p95 < 4s.
- Index a 100k-LOC repo < 10 min.
- Cost-per-answer tracked; gross margin > 70%.

## 8. Instrumentation rule
Nothing ships without traces + cost attribution. "If you can't see it and cost it, you can't run it." Cost-per-task is a product metric, not just an ops metric.
