// End-to-end web API proof for ContextOS: workspace -> add/extract context -> export
// Handoff -> index a codebase -> grounded ask. No browser, no keys.
import { readFile } from "node:fs/promises";
const BASE = process.env.BASE || "http://localhost:3960";
const J = (path, body) =>
  fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

// 0) health probe
let r = await fetch(BASE + "/api/health");
let d = await r.json();
if (!r.ok || d.status !== "ok") throw new Error("health check failed: " + JSON.stringify(d));
console.log(`✓ /api/health -> ${d.status} (${d.service})`);

// 1) create + seed a workspace
r = await J("/api/workspace", { project: "acme", seed: true });
d = await r.json();
if (!r.ok || d.items.length !== 4) throw new Error("workspace seed failed: " + JSON.stringify(d));
if (!d.files["CLAUDE.md"].includes("integer cents")) throw new Error("CLAUDE.md missing seeded convention");
const ws = d.workspaceId;
console.log(`✓ /api/workspace (seed) -> ${d.items.length} items; CLAUDE.md generated`);

// 2) add a context item
r = await J("/api/context", { workspaceId: ws, type: "convention", title: "Trunk-based dev", body: "Short-lived branches; merge daily." });
d = await r.json();
if (!r.ok || !d.files["CLAUDE.md"].includes("Trunk-based dev")) throw new Error("add context failed");
console.log(`✓ /api/context add -> now ${d.items.length} items, CLAUDE.md updated`);

// 3) extract from text
r = await J("/api/extract", { text: "We decided to use feature flags for risky rollouts. Convention: never commit secrets." });
d = await r.json();
if (!r.ok || !d.proposals.some((p) => /feature flags/i.test(p.body)) || !d.proposals.some((p) => /secrets/i.test(p.body)))
  throw new Error("extract failed: " + JSON.stringify(d));
console.log(`✓ /api/extract -> ${d.proposals.length} proposals (decision + convention)`);

// 4) index a codebase (zip)
const buf = await readFile("/tmp/ctx-code.zip");
const form = new FormData();
form.append("workspaceId", ws);
form.append("repo", new Blob([buf]), "code.zip");
r = await fetch(BASE + "/api/index-code", { method: "POST", body: form });
d = await r.json();
if (!r.ok || !d.chunks) throw new Error("index-code failed: " + JSON.stringify(d));
console.log(`✓ /api/index-code -> ${d.files} files, ${d.chunks} chunks`);

// 5) grounded ask: code question -> code citation
r = await J("/api/ask", { workspaceId: ws, question: "where is BM25 lexical retrieval implemented?" });
d = await r.json();
if (!d.codeCitations.some((c) => c.path.includes("lexical.ts"))) throw new Error("ask missed lexical.ts: " + JSON.stringify(d.codeCitations));
console.log(`✓ /api/ask (code) -> cites lexical.ts`);

// 6) grounded ask: context question -> context item
r = await J("/api/ask", { workspaceId: ws, question: "how should money be represented in cents?" });
d = await r.json();
if (!d.contextItems.some((i) => i.title === "Money as integer cents")) throw new Error("ask missed money convention");
console.log(`✓ /api/ask (context) -> surfaces 'Money as integer cents'`);

// 7) export the Handoff bundle
r = await fetch(BASE + `/api/export?workspaceId=${ws}`);
d = await r.json();
if (!r.ok || d.formatVersion !== "1.0" || !d.files["CLAUDE.md"]) throw new Error("export failed");
console.log(`✓ /api/export -> bundle v${d.formatVersion}, ${d.items.length} items`);

console.log("\n✅ ContextOS web API end-to-end PASSED");
