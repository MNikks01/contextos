import { test } from "node:test";
import assert from "node:assert/strict";
import { ContextStore } from "../src/store.ts";
import { renderClaudeMd, renderAll } from "../src/generate-files.ts";
import { extractProposals } from "../src/extract.ts";
import { diffBundles, exportBundle, HANDOFF_FORMAT_VERSION } from "../src/handoff.ts";

test("store: add / list / active", () => {
  const s = new ContextStore();
  s.add({ type: "convention", title: "Cents", body: "money as cents" });
  s.add({ type: "decision", title: "PG", body: "use postgres" });
  assert.equal(s.size, 2);
  assert.equal(s.active().length, 2);
  assert.equal(s.list({ type: "decision" }).length, 1);
});

test("store: supersede preserves the trail and bumps status", () => {
  const s = new ContextStore();
  const a = s.add({ type: "decision", title: "A", body: "old" });
  const b = s.add({ type: "decision", title: "B", body: "new" });
  s.supersede(a.id, b.id);
  assert.equal(s.active().length, 1);
  assert.equal(s.list({ status: "superseded" }).length, 1);
  assert.equal(s.get(a.id)?.supersededBy, b.id);
});

test("store: update bumps version", () => {
  const s = new ContextStore();
  const i = s.add({ type: "note", title: "n", body: "b" });
  s.update(i.id, { body: "b2" });
  assert.equal(s.get(i.id)?.version, 2);
});

test("generate-files: CLAUDE.md includes active conventions, excludes superseded", () => {
  const s = new ContextStore();
  s.add({ type: "convention", title: "Cents", body: "money as integer cents" });
  const d = s.add({ type: "decision", title: "Mongo", body: "use mongo" });
  const d2 = s.add({ type: "decision", title: "PG", body: "use postgres" });
  s.supersede(d.id, d2.id);
  const md = renderClaudeMd("proj", s.active());
  assert.match(md, /money as integer cents/);
  assert.doesNotMatch(md, /use mongo/);
  assert.deepEqual(Object.keys(renderAll("proj", s.active())), ["CLAUDE.md", "AGENTS.md", "llms.txt"]);
});

test("extract: finds decisions + conventions, ignores noise", () => {
  const ps = extractProposals("We decided to use idempotency keys. Convention: never log raw card numbers. Minor cleanup of the README.");
  assert.ok(ps.some((p) => p.type === "decision" && /idempotency/i.test(p.body)));
  assert.ok(ps.some((p) => p.type === "convention" && /card numbers/i.test(p.body)));
  assert.ok(!ps.some((p) => /minor cleanup/i.test(p.body)));
});

test("handoff: diffBundles detects added / changed", () => {
  const s = new ContextStore();
  s.add({ type: "convention", title: "A", body: "a" });
  const before = exportBundle("p", s);
  assert.equal(before.formatVersion, HANDOFF_FORMAT_VERSION);
  s.add({ type: "convention", title: "B", body: "b" });
  const after = exportBundle("p", s);
  const diff = diffBundles(before, after);
  assert.equal(diff.added.length, 1);
  assert.equal(diff.removed.length, 0);
});
