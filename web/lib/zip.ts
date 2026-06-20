import JSZip from "jszip";
import { languageFor } from "@/lib/engine/codebase/ingest";
import type { FileDoc } from "@/lib/engine/codebase/types";

const MAX_FILES = 600;
const MAX_FILE_BYTES = 400_000;
const MAX_TOTAL_BYTES = 8_000_000;
const SKIP = ["node_modules/", ".git/", "dist/", "build/", ".next/", "out/", "coverage/", "vendor/"];

// Read an uploaded repo zip into FileDoc[] (code/doc files only, with sane caps).
export async function filesFromZip(buf: Uint8Array): Promise<FileDoc[]> {
  const zip = await JSZip.loadAsync(buf);
  const paths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
  const root = commonRoot(paths);

  const docs: FileDoc[] = [];
  let total = 0;
  for (const p of paths) {
    if (docs.length >= MAX_FILES || total > MAX_TOTAL_BYTES) break;
    if (SKIP.some((s) => p.includes(s))) continue;
    const lang = languageFor(p);
    if (!lang) continue;
    const content = await zip.files[p].async("string");
    const size = Buffer.byteLength(content);
    if (size === 0 || size > MAX_FILE_BYTES) continue;
    total += size;
    const rel = root && p.startsWith(root) ? p.slice(root.length) : p;
    docs.push({ path: rel, language: lang, content, sizeBytes: size });
  }
  return docs;
}

function commonRoot(paths: string[]): string {
  if (paths.length === 0) return "";
  const top = paths[0].split("/")[0];
  return paths.every((p) => p.split("/")[0] === top) && paths[0].includes("/") ? `${top}/` : "";
}
