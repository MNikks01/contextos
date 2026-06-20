// Tests for the grounded composition (#1 reusing #2): answers cite team context + code.
import { ContextOS } from "../src/index.ts";
import { SAMPLE_REPO } from "./sample-repo.ts";

let fails = 0;
function ok(cond: boolean, label: string) {
  console.log(`${cond ? "✓" : "✗"} ${label}`);
  if (!cond) fails++;
}

const os = new ContextOS("acme");
os.addConvention("Money as integer cents", "Represent all money as integer cents — never use floats.");
os.addConvention("Never log card numbers", "Always mask card numbers to last4; never log the raw card number.");
os.addDecision("Postgres + Drizzle", "We chose Postgres + Drizzle for the orders data model.");

const g = os.grounded();
const stats = await g.indexCode(SAMPLE_REPO);
ok(stats.files === 3 && stats.chunks > 0, `indexed sample repo (${stats.files} files, ${stats.chunks} chunks)`);

// money question -> money convention + order code
const money = await g.ask("how is money stored for an order?", 4);
ok(
  money.contextItems.some((i) => i.title === "Money as integer cents"),
  "money question surfaces the 'integer cents' convention",
);
ok(
  money.codeCitations.some((c) => /orders\.ts|db\.ts/.test(c.path)),
  "money question cites order/db code",
);
ok(money.grounded === false && (money.contextItems.length > 0 || money.codeCitations.length > 0), "no LLM key -> retrieval-only with evidence");

// card question -> card convention + payments code
const card = await g.ask("how do we handle card numbers when charging a customer?", 4);
ok(card.contextItems.some((i) => i.title === "Never log card numbers"), "card question surfaces the 'never log card numbers' convention");
ok(card.codeCitations.some((c) => c.path.includes("payments.ts")), "card question cites payments.ts");

// irrelevant context is not force-included
ok(!money.contextItems.some((i) => i.title === "Never log card numbers"), "money question does NOT pull the card convention");

console.log(fails === 0 ? "\n✅ grounded composition: all tests passed" : `\n❌ ${fails} failed`);
process.exit(fails === 0 ? 0 : 1);
