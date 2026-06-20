# ADR-015 — Row-Level Security for multi-tenancy

**Status:** Accepted · **Maps to:** D-004, CD-005 · **Date:** 2026-06-19

## Context
We host customers' crown-jewel code. A single cross-tenant leak is existential. Application-layer checks alone are fragile (one missed `where org_id` leaks data).

## Decision
Enforce tenant isolation at the **database** via Postgres **Row-Level Security**: every multi-tenant table carries `org_id`; a policy scopes rows to `current_setting('app.org_id')`, set per request inside a transaction. Vector/lexical/graph queries are additionally `org_id`-filtered. An automated test asserts no cross-tenant access (a CI invariant).

## Alternatives
- **App-layer-only filtering:** one forgotten clause = breach; rejected for a code-hosting product.
- **Schema-per-tenant / DB-per-tenant for everyone:** strongest isolation but heavy ops at SMB scale; reserved as an Enterprise option (ADR + D-004).

## Consequences
- Isolation is an enforced invariant, not a convention; even a buggy query can't leak.
- Slight per-request overhead to set the GUC; negligible.

## Consequences / Risks
- RLS misconfiguration or a `BYPASSRLS` role mistake. *Mitigation:* policies version-controlled with schema; least-privilege DB roles; the invariant test; platform-admin cross-tenant access is explicit + audited only.
- Connection pooling must preserve the per-tx GUC. *Mitigation:* set `app.org_id` via `set_config(...)` within the transaction, compatible with PgBouncer transaction pooling.
