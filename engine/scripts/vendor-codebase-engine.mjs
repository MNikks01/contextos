// Vendor the Codebase Intelligence (#2) retrieval engine into ContextOS so #1 can answer
// questions grounded in code. They're separate repos, so this is a tracked copy (like the
// web apps' generated lib/engine). Canonical source: ../codebase-intelligence/engine/src.
//
//   node engine/scripts/vendor-codebase-engine.mjs          # re-vendor
//   node engine/scripts/vendor-codebase-engine.mjs --check   # exit 1 if out of date

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, "../../../codebase-intelligence/engine/src");
const destRoot = resolve(here, "../src/codebase");

let files;
try {
  files = (await readdir(srcRoot)).filter((f) => f.endsWith(".ts"));
} catch {
  console.error(`Source not found: ${srcRoot}\n(Need the codebase-intelligence repo as a sibling to re-vendor. The vendored copy in src/codebase is already committed.)`);
  process.exit(2);
}

const header = (f) =>
  `// VENDORED from codebase-intelligence/engine/src/${f} — DO NOT EDIT.\n` +
  `// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs\n\n`;

const check = process.argv.includes("--check");
let drift = 0;
for (const f of files) {
  const generated = header(f) + (await readFile(join(srcRoot, f), "utf8"));
  const destPath = join(destRoot, f);
  if (check) {
    let existing = "";
    try { existing = await readFile(destPath, "utf8"); } catch {}
    if (existing !== generated) { drift++; console.log(`✗ out of date: src/codebase/${f}`); }
  } else {
    await mkdir(destRoot, { recursive: true });
    await writeFile(destPath, generated, "utf8");
    console.log(`✓ vendored src/codebase/${f}`);
  }
}
if (check) { console.log(drift === 0 ? "\n✅ vendored copy in sync." : `\n❌ ${drift} out of date`); process.exit(drift === 0 ? 0 : 1); }
console.log(`\n✅ vendored ${files.length} files into src/codebase/`);
