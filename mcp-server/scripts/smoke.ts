// Drives the ContextOS MCP server over real stdio JSON-RPC:
// initialize -> tools/list -> load_context / propose_context / add_context + list_context.

import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// Point `ask` at a real codebase (the engine's own source) so it can ground in code.
const env = { ...process.env, CODEBASE_PATH: resolve(here, "../../engine/src") };
const child = spawn("node", [resolve(here, "../src/server.ts")], { stdio: ["pipe", "pipe", "inherit"], env });

let buf = "";
const pending = new Map<number, (m: any) => void>();
child.stdout.on("data", (chunk) => {
  buf += chunk.toString();
  let nl: number;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg: any;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)!(msg); pending.delete(msg.id); }
  }
});
const send = (o: any) => child.stdin.write(JSON.stringify(o) + "\n");
const request = (id: number, method: string, params?: any) =>
  new Promise<any>((res) => { pending.set(id, res); send({ jsonrpc: "2.0", id, method, params }); });

function assert(cond: boolean, label: string) {
  if (!cond) { console.error(`✗ ${label}`); child.kill(); process.exit(1); }
  console.log(`✓ ${label}`);
}

const init = await request(1, "initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "smoke", version: "1.0.0" } });
assert(init.result?.serverInfo?.name === "contextos", `initialize -> ${init.result?.serverInfo?.name}`);
send({ jsonrpc: "2.0", method: "notifications/initialized" });

const names = ((await request(2, "tools/list", {})).result?.tools ?? []).map((t: any) => t.name);
assert(
  ["load_context", "list_context", "propose_context", "add_context", "ask"].every((n) => names.includes(n)),
  `tools/list -> ${names.join(", ")}`,
);

const lc = await request(3, "tools/call", { name: "load_context", arguments: {} });
assert((lc.result?.content?.[0]?.text ?? "").includes("integer cents"), "load_context -> warm CLAUDE.md with seeded convention");

const pc = await request(4, "tools/call", { name: "propose_context", arguments: { text: "We decided to use feature flags for risky rollouts. Convention: never commit secrets.", source: "PR #7" } });
const pcText = pc.result?.content?.[0]?.text ?? "";
assert(/feature flags/i.test(pcText) && /secrets/i.test(pcText), "propose_context -> extracts decision + convention");

await request(5, "tools/call", { name: "add_context", arguments: { type: "convention", title: "Trunk-based dev", body: "Short-lived branches; merge to main daily." } });
const ls = await request(6, "tools/call", { name: "list_context", arguments: { type: "convention" } });
assert((ls.result?.content?.[0]?.text ?? "").includes("Trunk-based dev"), "add_context then list_context shows the new item");

// grounded ask over the indexed codebase
const ga = await request(7, "tools/call", { name: "ask", arguments: { question: "where is BM25 lexical retrieval implemented?" } });
assert((ga.result?.content?.[0]?.text ?? "").includes("lexical.ts"), "ask grounds in code (cites lexical.ts)");

child.kill();
console.log("\n✅ ContextOS MCP server works end-to-end over MCP.");
