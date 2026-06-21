import { test } from "node:test";
import assert from "node:assert/strict";
import { ContextOS } from "../src/index.ts";
import { SAMPLE_REPO } from "../scripts/sample-repo.ts";

test("Context Handoff round-trips: export -> import preserves active context", () => {
  const os = new ContextOS("acme");
  os.addConvention("Cents", "money as integer cents");
  os.addDecision("PG", "use postgres");
  os.addGlossary("Settlement", "funds to merchant");
  const bundle = os.export();
  assert.ok(bundle.files["CLAUDE.md"].includes("integer cents"));
  const restored = ContextOS.import(bundle);
  assert.equal(restored.store.active().length, 3);
  assert.deepEqual(
    restored.store.list().map((i) => i.title),
    os.store.list().map((i) => i.title),
  );
});

test("import rejects an unsupported Handoff format version", () => {
  const os = new ContextOS("p");
  const bundle = os.export();
  assert.throws(() => ContextOS.import({ ...bundle, formatVersion: "9.0" }));
});

test("grounded: ask is grounded in BOTH team context and code", async () => {
  const os = new ContextOS("acme");
  os.addConvention("Money as integer cents", "Represent all money as integer cents — never use floats.");
  os.addConvention("Never log card numbers", "Always mask card numbers to last4; never log the raw card number.");
  const g = os.grounded();
  const stats = await g.indexCode(SAMPLE_REPO);
  assert.equal(stats.files, 3);

  const money = await g.ask("how is money stored for an order?", 4);
  assert.ok(money.contextItems.some((i) => i.title === "Money as integer cents"));
  assert.ok(money.codeCitations.some((c) => /orders\.ts|db\.ts/.test(c.path)));
  assert.equal(money.grounded, false); // no LLM key -> retrieval-only, but evidence present

  const card = await g.ask("how do we handle card numbers when charging a customer?", 4);
  assert.ok(card.contextItems.some((i) => i.title === "Never log card numbers"));
  assert.ok(card.codeCitations.some((c) => c.path.includes("payments.ts")));
});
