#!/usr/bin/env node
// MCP server for ContextOS. Loads a team's Context Handoff bundle (or a seed) and exposes
// it to any MCP host so a fresh session starts WARM with the team's decisions/conventions.
//
//   CONTEXTOS_BUNDLE=/path/to/handoff.json node src/server.ts
//
// IMPORTANT: stdout is the MCP JSON-RPC channel — never console.log to it. Status -> stderr.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { ContextOS } from "../../engine/src/index.ts";

// Load a bundle if provided; otherwise seed a small demo so the server is never empty.
let os: ContextOS;
const bundlePath = process.env.CONTEXTOS_BUNDLE;
if (bundlePath) {
  os = ContextOS.import(JSON.parse(await readFile(bundlePath, "utf8")));
  console.error(`[contextos-mcp] loaded bundle ${bundlePath}: ${os.store.active().length} active items`);
} else {
  os = new ContextOS("demo");
  os.addConvention("Money as integer cents", "Represent all money as integer cents — never floats.");
  os.addConvention("Conventional Commits", "Use Conventional Commits for every commit message.");
  os.addDecision("Postgres + Drizzle", "We chose Postgres + Drizzle for the core data model.");
  os.addGlossary("Idempotency key", "A client-supplied key that makes a POST safe to retry.");
  console.error(`[contextos-mcp] seeded demo context: ${os.store.active().length} items (set CONTEXTOS_BUNDLE to load real context)`);
}

const server = new McpServer({ name: "contextos", version: "0.1.0" });

server.tool(
  "load_context",
  "Load the team's durable context (decisions, conventions, glossary) as a CLAUDE.md-style brief. " +
    "Call this at the start of a session so you follow team norms and don't re-litigate settled decisions.",
  {},
  async () => ({ content: [{ type: "text", text: os.files()["CLAUDE.md"] }] }),
);

server.tool(
  "list_context",
  "List the team's active context items, optionally filtered by type.",
  { type: z.enum(["decision", "adr", "convention", "glossary", "note"]).optional() },
  async ({ type }) => {
    const items = os.store.list(type ? { type } : undefined).filter((i) => i.status === "active");
    const text = items.length ? items.map((i) => `- [${i.type}] ${i.title}: ${i.body}`).join("\n") : "No context items.";
    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "propose_context",
  "Extract candidate decisions/conventions from text (a PR description, chat, or notes). Returns proposals " +
    "for review — it does NOT save them. Use to capture institutional knowledge before it's lost.",
  { text: z.string().describe("Free text to mine for decisions/conventions"), source: z.string().optional() },
  async ({ text, source }) => {
    const ps = os.propose(text, source ?? "input");
    const out = ps.length
      ? ps.map((p) => `- [${p.type} · ${p.confidence}] ${p.title}\n    ${p.body}`).join("\n")
      : "No proposals found.";
    return { content: [{ type: "text", text: out }] };
  },
);

server.tool(
  "add_context",
  "Add a context item (decision / convention / glossary / note) to the team's shared context.",
  {
    type: z.enum(["decision", "convention", "glossary", "note"]),
    title: z.string(),
    body: z.string(),
  },
  async ({ type, title, body }) => {
    os.store.add({ type, title, body });
    return { content: [{ type: "text", text: `Added ${type}: ${title}` }] };
  },
);

await server.connect(new StdioServerTransport());
console.error("[contextos-mcp] ready");
