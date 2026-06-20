// Demo: ContextOS answers grounded in BOTH the team's context and the code (the wedge
// composition — #1 reusing #2). Zero-network; set ANTHROPIC_API_KEY for a written answer.

import { ContextOS } from "../src/index.ts";
import { SAMPLE_REPO } from "./sample-repo.ts";

const os = new ContextOS("acme-payments");
os.addConvention("Money as integer cents", "Represent all money as integer cents — never use floats.");
os.addConvention("Never log card numbers", "Always mask card numbers to last4; never log the raw card number (PAN).");
os.addDecision("Postgres + Drizzle", "We chose Postgres + Drizzle for the orders data model.");

const g = os.grounded();
const stats = await g.indexCode(SAMPLE_REPO);
console.log(`\n▸ Indexed code: ${stats.files} files -> ${stats.chunks} chunks. Context items: ${os.store.active().length}`);

for (const q of ["how is money stored for an order?", "how do we handle card numbers when charging a customer?"]) {
  const r = await g.ask(q, 4);
  console.log(`\n▸ Q: ${q}`);
  if (r.contextItems.length) {
    console.log("  relevant team context:");
    for (const i of r.contextItems) console.log(`    - [${i.type}] ${i.title}: ${i.body}`);
  }
  if (r.codeCitations.length) {
    console.log("  code evidence:");
    for (const c of r.codeCitations.slice(0, 3))
      console.log(`    - ${c.path}:${c.startLine}-${c.endLine}${c.symbol ? ` (${c.symbol})` : ""}`);
  }
  if (r.grounded) console.log(`  answer: ${r.answer}`);
}

console.log(
  `\n✅ Grounded composition works${process.env.ANTHROPIC_API_KEY ? "" : " (retrieval-only — set ANTHROPIC_API_KEY for written answers)"}.\n`,
);
