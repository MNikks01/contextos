#!/usr/bin/env node
// ContextOS CLI — capture durable team context and hand it off to any AI session.
// State persists in a portable Handoff bundle file (default ./contextos.bundle.json),
// so a fresh AI tool can `import` it and start warm.
//
//   contextos add <decision|convention|glossary|note|adr> "<title>" "<body>"
//   contextos list
//   contextos files [-o <dir>]        # write CLAUDE.md / AGENTS.md / llms.txt
//   contextos export [-o <file>]      # write the Handoff bundle
//   contextos import <bundle.json>    # merge another bundle in
//   contextos ask "<question>"        # answer grounded in the team context

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ContextOS } from "./index.ts";
import type { ContextBundle, ContextType } from "./types.ts";

const STORE = process.env.CONTEXTOS_STORE || "./contextos.bundle.json";
const TYPES: ContextType[] = ["decision", "convention", "glossary", "note", "adr"];

const HELP = `contextos — durable team context + Context Handoff (start any AI session warm)

Usage:
  contextos add <type> "<title>" "<body>"   type: ${TYPES.join(" | ")}
  contextos list
  contextos files [-o <dir>]                write CLAUDE.md / AGENTS.md / llms.txt
  contextos export [-o <file>]              write the portable Handoff bundle (JSON)
  contextos import <bundle.json>            merge another bundle into the store
  contextos ask "<question>"                answer grounded in the team context

State file: ${STORE}  (override with CONTEXTOS_STORE)
`;

function load(): ContextOS {
  if (existsSync(STORE)) {
    const bundle = JSON.parse(readFileSync(STORE, "utf8")) as ContextBundle;
    return ContextOS.import(bundle);
  }
  return new ContextOS("my-project");
}

function save(os: ContextOS): void {
  writeFileSync(STORE, JSON.stringify(os.export(), null, 2));
}

function flagValue(args: string[], names: string[]): string | undefined {
  for (let i = 0; i < args.length; i++) if (names.includes(args[i])) return args[i + 1];
  return undefined;
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);

  switch (cmd) {
    case "add": {
      const [type, title, body] = rest;
      if (!TYPES.includes(type as ContextType) || !title) {
        process.stderr.write(`✗ usage: contextos add <${TYPES.join("|")}> "<title>" "<body>"\n`);
        process.exit(1);
      }
      const os = load();
      os.store.add({ type: type as ContextType, title, body: body ?? "", tags: ["cli"] });
      save(os);
      process.stdout.write(`✓ added ${type}: ${title}\n`);
      return;
    }
    case "list": {
      const items = load().store.active();
      if (items.length === 0) {
        process.stdout.write("No context yet. Add some with: contextos add decision \"...\" \"...\"\n");
        return;
      }
      for (const it of items) process.stdout.write(`• [${it.type}] ${it.title}\n    ${it.body}\n`);
      return;
    }
    case "files": {
      const out = flagValue(rest, ["-o", "--out"]) ?? ".";
      const files = load().files();
      for (const [name, content] of Object.entries(files)) {
        writeFileSync(resolve(out, name), content);
        process.stdout.write(`✓ wrote ${resolve(out, name)}\n`);
      }
      return;
    }
    case "export": {
      const out = flagValue(rest, ["-o", "--out"]) ?? STORE;
      writeFileSync(out, JSON.stringify(load().export(), null, 2));
      process.stdout.write(`✓ exported Handoff bundle -> ${out}\n`);
      return;
    }
    case "import": {
      const file = rest[0];
      if (!file) {
        process.stderr.write("✗ usage: contextos import <bundle.json>\n");
        process.exit(1);
      }
      const incoming = JSON.parse(readFileSync(resolve(file), "utf8")) as ContextBundle;
      const os = load();
      for (const it of incoming.items) os.store.add({ type: it.type, title: it.title, body: it.body, tags: it.tags });
      save(os);
      process.stdout.write(`✓ merged ${incoming.items.length} item(s) from ${file}\n`);
      return;
    }
    case "ask": {
      const question = rest.filter((t) => !t.startsWith("-")).join(" ");
      if (!question) {
        process.stderr.write('✗ usage: contextos ask "<question>"\n');
        process.exit(1);
      }
      const result = await load().grounded().ask(question);
      if (result.contextItems.length === 0) {
        process.stdout.write("No relevant team context found.\n");
      } else {
        process.stdout.write("Relevant context:\n");
        for (const it of result.contextItems) process.stdout.write(`• [${it.type}] ${it.title} — ${it.body}\n`);
      }
      if (result.answer) process.stdout.write(`\nAnswer:\n${result.answer}\n`);
      else process.stdout.write("\n(Set ANTHROPIC_API_KEY for a written answer; showing retrieval only.)\n");
      return;
    }
    default:
      process.stdout.write(HELP);
      process.exit(cmd ? 1 : 0);
  }
}

main().catch((e) => {
  process.stderr.write(`✗ ${(e as Error).message}\n`);
  process.exit(1);
});
