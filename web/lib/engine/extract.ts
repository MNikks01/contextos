// GENERATED from engine/src/extract.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// Memory extraction — propose context items (decisions/conventions) from free text
// (a PR description, a chat, a commit). Heuristic + zero-network; an LLM can refine these
// when a key is configured. Proposals are reviewed before they enter the store.

import type { ContextProposal, ContextType } from "./types";

const DECISION_SIGNALS = [
  /\bwe (decided|chose|agreed|will use|are using|switched to|went with|standardiz\w+)\b/i,
  /\bdecision:/i,
  /\blet'?s (use|go with)\b/i,
];
const CONVENTION_SIGNALS = [
  /\balways\b/i,
  /\bnever\b/i,
  /\bdo not\b/i,
  /\bdon'?t\b/i,
  /\bmust\b/i,
  /\bprefer\b/i,
  /\bconvention:/i,
  /\buse\b.+\bnot\b/i,
  /\bwe use\b/i,
];

export function extractProposals(text: string, source = "input"): ContextProposal[] {
  const lines = text
    .split(/\n|(?<=[.!?])\s+/)
    .map((l) => l.trim().replace(/^[-*+]\s+/, ""))
    .filter(Boolean);

  const proposals: ContextProposal[] = [];
  for (const line of lines) {
    if (line.length < 12 || line.length > 280) continue;
    let type: ContextType | null = null;
    let confidence = 0;
    if (DECISION_SIGNALS.some((re) => re.test(line))) {
      type = "decision";
      confidence = 0.7;
    } else if (CONVENTION_SIGNALS.some((re) => re.test(line))) {
      type = "convention";
      confidence = 0.6;
    }
    if (!type) continue;
    proposals.push({ type, title: summarize(line), body: line, source, confidence });
  }
  return dedupe(proposals);
}

function summarize(line: string): string {
  const cleaned = line.replace(/^(convention|decision|note|adr)\s*:\s*/i, "").replace(/[.!?]+$/, "");
  const words = cleaned.split(/\s+/);
  return words.length <= 9 ? cleaned : words.slice(0, 9).join(" ") + "…";
}

function dedupe(ps: ContextProposal[]): ContextProposal[] {
  const seen = new Set<string>();
  return ps.filter((p) => {
    const key = p.body.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
