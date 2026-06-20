# ContextOS — SECURITY

Security is the price of entry: we ask engineering teams to connect their crown-jewels code. The #1 enterprise objection is "what happens to our code?" — answered by D-010 (customer data never trains any model).

## 1. RBAC
- Roles: **Owner / Admin / Member / Viewer** at org level; per-project overrides.
- Permission matrix enforced at API gateway + Row-Level Security in Postgres.
- Integrations and tools carry their own scopes (least privilege); an agent inherits the narrower of user/agent/tool scopes.
- API keys are org- and scope-scoped; rotatable; least privilege.

## 2. Audit logs
- Append-only `audit_logs`: actor (user/agent/system), action, resource, metadata, timestamp.
- Every AI action, tool call, context change, permission change, and data access is logged.
- Immutable (no update/delete); retained per compliance; exportable (V3 / SOC 2 evidence).
- Tamper-evidence: hash-chain option for Enterprise.

## 3. Secrets management
- All credentials (integration tokens, provider keys) in a cloud secret manager / Vault — **never** in the DB rows, never in context, never in logs.
- Per-tenant key references; short-lived tokens where providers support it; automatic rotation.
- `.env` never committed; CI uses encrypted secrets.

## 4. Encryption
- **In transit:** TLS 1.2+ everywhere (client↔API, service↔service, ↔providers).
- **At rest:** disk/db encryption; sensitive blobs (context bundles, integration creds) envelope-encrypted with per-tenant keys (Enterprise: customer-managed keys / BYOK).
- Backups encrypted.

## 5. Data handling & privacy (D-010)
- Customer code/data is **never** used to train any model (ours or providers'); use provider zero-retention / no-train tiers.
- Per-tenant data isolation (RLS; optional schema/DB-per-tenant for Enterprise).
- PII detection + redaction before model calls (V2).
- Data residency by region (V3); deletion on request (right to be forgotten).
- Configurable retention; customer can export and delete all data.

## 6. Application security
- Input validation everywhere (Zod); parameterized queries only (no string SQL).
- AuthN: secure sessions/JWT, OAuth, SSO/SAML/SCIM (V3 via WorkOS).
- AuthZ: deny-by-default; every endpoint checks org/project/role.
- Rate limiting + abuse protection (Redis).
- Dependency scanning (Dependabot), SAST in CI, secret scanning.
- CSRF/CORS, security headers, CSP on the web app.

## 7. AI-specific security
- **Prompt injection:** treat all retrieved content + tool outputs as untrusted; never let them alter system instructions or trigger unauthorized tools; see [GUARDRAILS.md](./GUARDRAILS.md).
- **Tool sandboxing:** code-executing tools run isolated (no ambient FS/network/secrets).
- **Output validation/moderation** before any action is taken.
- **Data leakage prevention:** retrieval is tenant-scoped; redaction; egress controls on what context leaves to providers.

## 8. Compliance roadmap
| When | Milestone |
|------|-----------|
| Launch | Privacy policy, DPA template, security page, sub-processor list |
| Year 1 | SOC 2 Type I process; pen test |
| Year 2 | SOC 2 Type II; GDPR readiness; on-prem/VPC option; data residency |
| On demand | HIPAA/ISO 27001 if enterprise requires |

## 9. Incident response
- Documented IR plan; on-call; severity levels; customer notification SLAs.
- Backups + tested restores; DR runbook (see [DEVOPS.md](./DEVOPS.md)).
- Security contact + responsible disclosure / bug bounty (Year 1+).

## 10. Threat model (top risks)
1. Prompt injection via connected repos/docs → unauthorized tool use → mitigations §7.
2. Cross-tenant data leak → RLS + tenant-scoped retrieval + tests.
3. Credential theft → vault + least privilege + rotation.
4. Supply-chain (deps) → scanning + pinning.
5. Over-permissioned agents → least privilege + HITL + budgets.
