# ContextOS — DEVOPS

Managed-first, K8s-later (D-009). Docker everywhere; GitHub Actions CI/CD; observability from day one.

## 1. Environments
| Env | Purpose | Infra |
|-----|---------|-------|
| Local | Dev | Docker Compose (Postgres+pgvector, Redis, app, workers) |
| Preview | Per-PR | Vercel preview + ephemeral DB branch (Neon) |
| Staging | Pre-prod, eval gate | Managed PaaS, prod-like |
| Production | Live | Managed PaaS → K8s at scale |

## 2. Docker
- Multi-stage Dockerfiles (build → slim runtime); distroless/alpine base.
- `docker-compose.yml` for local: app, workers, Postgres(pgvector), Redis, otel-collector.
- Images built in CI, pushed to registry (GHCR), tagged by SHA + semver.

## 3. CI/CD (GitHub Actions)
```mermaid
flowchart LR
    PR[PR opened] --> LINT[Lint + typecheck]
    LINT --> UNIT[Unit tests]
    UNIT --> EVAL[AI eval suite - gate]
    EVAL --> E2E[Playwright e2e]
    E2E --> BUILD[Build images]
    BUILD --> PREVIEW[Deploy preview]
    PREVIEW --> REVIEW[Review + approve]
    REVIEW --> MERGE[Merge to main]
    MERGE --> STAGING[Auto-deploy staging]
    STAGING --> CANARY[Canary -> prod]
```
- Pipeline: lint → typecheck → unit → **AI evals (regression gate)** → e2e → build → preview.
- Main → staging auto; production via canary/manual promote.
- Migrations run automatically with safety checks (forward-only, backfill-aware).

## 4. Deployments
- **Canary / progressive rollout** (small % traffic → ramp); auto-rollback on error/latency/cost spike.
- Feature flags decouple deploy from release (and gate provider-specific AI features).
- Blue/green for risky migrations.
- Zero-downtime; health checks + readiness probes.

## 5. Kubernetes (Year 2 / enterprise)
- Helm charts per service; HPA on CPU + queue depth + request rate.
- Introduced when: multi-service orchestration, enterprise VPC/on-prem, or cost/control needs justify it.
- Terraform for cloud infra; GitOps (Argo/Flux) for cluster state.

## 6. Data ops
- Managed Postgres with PITR; daily backups; **tested restores** (quarterly DR drill).
- Redis persistence for queues; DLQ for failed jobs.
- Vector index rebuild runbook; reindex workers idempotent.

## 7. Observability & alerting
OpenTelemetry collector → Prometheus/Grafana; Sentry for errors; logs to Loki/managed. Alerts to PagerDuty/Slack. See [OBSERVABILITY.md](./OBSERVABILITY.md).

## 8. Secrets & config
Cloud secret manager/Vault; env injected at runtime; no secrets in images/repo; rotation automated. Config via env + typed config module.

## 9. Reliability
- Multi-provider LLM failover; circuit breakers; retries with backoff + idempotency.
- Graceful degradation (cached answers, "service busy") under provider outage.
- SLOs tracked (OBSERVABILITY §7); error budget policy.

## 10. Cost ops
- Per-tenant cost dashboards; spend alerts; autoscale-to-zero for idle workers.
- LLM COGS tracking is a CI/observability concern, not an afterthought (gross margin > 70%).

## 11. Runbooks (maintained in repo)
Provider outage · reindex failure · DB restore · spend spike · injection incident · key rotation · canary rollback.
