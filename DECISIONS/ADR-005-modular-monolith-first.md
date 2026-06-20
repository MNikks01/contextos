# ADR-005 — Modular monolith first; microservices later

**Status:** Accepted · **Maps to:** D-009 · **Date:** 2026-06-19

## Context
A small team must ship fast and operate simply pre-PMF, yet the architecture must scale to a distributed fleet (100K users).

## Decision
Build a **modular monolith** (one NestJS deployable + async workers) with hard module boundaries, and extract services **only when a measured SLO/cost metric forces it** — Retrieval first (Tier 2), then Orchestration/Integration/Workers (Tier 3).

## Alternatives
- **Microservices day one:** "future-proof" but crushes velocity, multiplies ops, and solves scale we don't have — the most common premature-scaling failure.
- **Serverless-first:** poor fit for long-running indexing/agent workloads and cold-start latency on the hot path.

## Consequences
- Maximum velocity and operability pre-scale; one thing to deploy/debug.
- Clean module seams make later extraction cheap.
- Extraction triggers are explicit ([../SCALE_ANALYSIS.md](../SCALE_ANALYSIS.md)).

## Risks
- "Monolith forever" inertia / accidental coupling across modules. *Mitigation:* enforce module boundaries in CI (no cross-module imports except via defined interfaces); treat the Retrieval seam as a contract from day one.
- A sudden enterprise on-prem deal could force K8s/services earlier than planned. *Mitigation:* keep the Helm/extraction path documented (ADR-024).
