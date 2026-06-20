import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/workspace-store";
import { filesFromZip } from "@/lib/zip";

export const runtime = "nodejs";

const MAX_ZIP_BYTES = 20_000_000;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: { message: "Expected a multipart upload." } }, { status: 400 });
  }
  const workspaceId = form.get("workspaceId");
  const file = form.get("repo");
  const ws = typeof workspaceId === "string" ? getWorkspace(workspaceId) : null;
  if (!ws) return NextResponse.json({ error: { message: "Workspace not found — reload." } }, { status: 404 });
  if (!(file instanceof File)) return NextResponse.json({ error: { message: "Upload a .zip as field 'repo'." } }, { status: 400 });
  if (file.size > MAX_ZIP_BYTES) return NextResponse.json({ error: { message: "Zip too large (20MB max)." } }, { status: 413 });

  const docs = await filesFromZip(new Uint8Array(await file.arrayBuffer()));
  if (docs.length === 0) return NextResponse.json({ error: { message: "No supported code files found." } }, { status: 400 });
  const stats = await ws.grounded.indexCode(docs);
  ws.codeIndexed = true;
  return NextResponse.json(stats);
}
