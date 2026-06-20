// Single source of truth = engine/src (incl. the vendored codebase/ engine). The web app
// can't import it directly (Turbopack won't resolve outside its root and rejects .ts import
// extensions), so web/lib/engine is a GENERATED copy with .ts import extensions stripped.
//
//   node engine/scripts/sync-to-web.mjs          # regenerate web/lib/engine
//   node engine/scripts/sync-to-web.mjs --check   # exit 1 if out of sync

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, "../src");
const destRoot = resolve(here, "../../web/lib/engine");

async function tsFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await tsFiles(full)));
    else if (e.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

function transform(rel, content) {
  const stripped = content.replace(/from "(\.\.?\/[^"]+?)\.ts"/g, 'from "$1"');
  return `// GENERATED from engine/src/${rel} — DO NOT EDIT.\n// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs\n\n${stripped}`;
}

const files = await tsFiles(srcRoot);
const check = process.argv.includes("--check");
let drift = 0;

for (const abs of files) {
  const rel = relative(srcRoot, abs);
  const generated = transform(rel, await readFile(abs, "utf8"));
  const destPath = join(destRoot, rel);
  if (check) {
    let existing = "";
    try { existing = await readFile(destPath, "utf8"); } catch {}
    if (existing !== generated) { drift++; console.log(`✗ out of sync: web/lib/engine/${rel}`); }
  } else {
    await mkdir(dirname(destPath), { recursive: true });
    await writeFile(destPath, generated, "utf8");
    console.log(`✓ web/lib/engine/${rel}`);
  }
}

if (check) {
  console.log(drift === 0 ? "\n✅ engine copy in sync." : `\n❌ ${drift} out of sync — run: node engine/scripts/sync-to-web.mjs`);
  process.exit(drift === 0 ? 0 : 1);
}
console.log(`\n✅ synced ${files.length} files to web/lib/engine`);
