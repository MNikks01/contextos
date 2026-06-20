// Tests for the ContextOS engine — the Context Handoff round-trip, file generation,
// memory extraction, supersede, and bundle diff. Run: node scripts/test.ts

import { ContextOS, ContextStore, diffBundles, extractProposals, HANDOFF_FORMAT_VERSION } from "../src/index.ts";

let fails = 0;
function ok(cond: boolean, label: string) {
  console.log(`${cond ? "✓" : "✗"} ${label}`);
  if (!cond) fails++;
}

// --- store + generation ---
const os = new ContextOS("proj");
os.addConvention("Cents not floats", "Represent money as integer cents.");
const dec = os.addDecision("Use Postgres", "We chose Postgres for ACID guarantees.");
os.addGlossary("Settlement", "Funds moving to the merchant balance.");
ok(os.store.size === 3, "store holds 3 items");

const files = os.files();
ok(Object.keys(files).join(",") === "CLAUDE.md,AGENTS.md,llms.txt", "generates the 3 agent files");
ok(files["CLAUDE.md"].includes("Represent money as integer cents"), "CLAUDE.md includes a convention body");
ok(files["AGENTS.md"].includes("Settlement"), "AGENTS.md includes a glossary term");

// --- export / import round-trip ---
const bundle = os.export();
ok(bundle.formatVersion === HANDOFF_FORMAT_VERSION, `bundle format version is ${HANDOFF_FORMAT_VERSION}`);
const restored = ContextOS.import(bundle);
ok(restored.project === "proj", "restored project name");
ok(restored.store.active().length === 3, "round-trip preserves active items");
ok(
  JSON.stringify(restored.store.list().map((i) => i.title)) === JSON.stringify(os.store.list().map((i) => i.title)),
  "round-trip preserves item titles/order",
);

// --- import rejects unknown format ---
let rejected = false;
try {
  ContextOS.import({ ...bundle, formatVersion: "9.0" });
} catch {
  rejected = true;
}
ok(rejected, "import rejects unsupported format version");

// --- memory extraction ---
const proposals = extractProposals(
  "We decided to use idempotency keys on payouts. Convention: never log raw card numbers. Minor cleanup of the README.",
  "PR #1",
);
ok(proposals.some((p) => p.type === "decision" && /idempotency/i.test(p.body)), "extracts a decision (idempotency)");
ok(proposals.some((p) => p.type === "convention" && /card numbers/i.test(p.body)), "extracts a convention (never log cards)");
ok(!proposals.some((p) => /minor cleanup/i.test(p.body)), "ignores noise ('minor cleanup')");

// --- supersede hides from active + generated files ---
const d2 = os.addDecision("Postgres + replicas", "Add read replicas.");
os.store.supersede(dec.id, d2.id);
ok(!os.files()["CLAUDE.md"].includes("Use Postgres"), "superseded decision drops out of CLAUDE.md");
ok(os.store.list({ status: "superseded" }).length === 1, "superseded item still retained (audit trail)");

// --- diff ---
const before = os.export();
os.addConvention("PR titles imperative", "Write PR titles in the imperative mood.");
const after = os.export();
const diff = diffBundles(before, after);
ok(diff.added.length === 1 && diff.removed.length === 0, "diff detects the one added item");

console.log(fails === 0 ? "\n✅ ContextOS engine: all tests passed" : `\n❌ ${fails} test(s) failed`);
process.exit(fails === 0 ? 0 : 1);
