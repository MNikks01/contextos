# ADR-028 — Secrets in a vault, never in DB/code

**Status:** Accepted · **Date:** 2026-06-19

## Context
ContextOS holds integration credentials (GitHub App tokens, Notion/Jira/Slack keys, DB creds) and provider API keys. Leaking these is catastrophic and a top enterprise objection.

## Decision
Store all secrets in a **dedicated secret manager / vault** (cloud KMS-backed). The database stores only **`secret_refs`** (pointers); generated code and logs **never** contain secrets. Prefer short-lived tokens (GitHub App) and automatic rotation.

## Alternatives
- **Encrypted columns in Postgres:** better than plaintext but expands the blast radius of a DB breach; vault isolation is stronger.
- **Env vars only:** fine for platform secrets, insufficient for per-tenant integration creds at scale.

## Consequences
- DB breach does not expose customer credentials (only refs).
- Clean rotation + audit; supports per-tenant keys / BYOK at Enterprise.

## Risks
- Vault is a critical dependency (availability + access control). *Mitigation:* HA vault; cache short-lived tokens in memory only; strict IAM; audit every secret access.
- Developer convenience pressure to "just put it in env." *Mitigation:* policy + CI secret-scanning blocks committed secrets.
