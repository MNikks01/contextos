// Demo: capture team context, extract more from a PR, export the Context Handoff,
// then "restore into a fresh session" and show it starts warm. Zero-network.

import { ContextOS, diffBundles } from "../src/index.ts";

const os = new ContextOS("acme-payments");

// 1) Curated team context.
os.addConvention("Money as integer cents", "Represent all money as integer cents — never floats.");
os.addConvention("Errors via Result type", "Return Result<T,E>; throw only for programmer errors.");
const d1 = os.addDecision("Postgres over Mongo", "We chose Postgres + Drizzle for the core data model (ACID, relations).");
os.addGlossary("Settlement", "Moving authorized funds from the customer to the merchant's balance.");

// 2) Extract more context from a PR description.
const pr = `
This PR reworks the payouts service.
We decided to use idempotency keys on all payout POSTs to avoid double-pays.
Convention: never log raw card numbers — always mask to last4.
Also bumped the lib version. Minor cleanup.
`;
const proposals = os.propose(pr, "PR #482");
console.log(`\n▸ Extracted ${proposals.length} proposals from PR #482:`);
for (const p of proposals) console.log(`   - [${p.type} ${p.confidence}] ${p.title}`);
for (const p of proposals) os.accept(p); // a human would review first

// 3) Export the Context Handoff bundle.
const bundle = os.export();
console.log(`\n▸ Exported bundle: ${bundle.items.length} items, format v${bundle.formatVersion}`);
console.log(`\n----- generated CLAUDE.md (what a fresh AI session loads) -----\n`);
console.log(bundle.files["CLAUDE.md"]);

// 4) Restore into a "fresh session" — it starts warm.
const restored = ContextOS.import(bundle);
console.log(`\n▸ Restored fresh session "${restored.project}": ${restored.store.active().length} active context items inherited.`);

// 5) Supersede a decision, re-export, and diff.
const d2 = restored.addDecision("Postgres + read replicas", "Superseding: add read replicas for query scaling.");
restored.store.supersede(d1.id, d2.id);
const after = restored.export();
const diff = diffBundles(bundle, after);
console.log(`\n▸ Diff after superseding: +${diff.added.length} added, ~${diff.changed.length} changed, -${diff.removed.length} removed`);

console.log(`\n✅ Demo complete — Context Handoff exported, restored, and diffed.\n`);
