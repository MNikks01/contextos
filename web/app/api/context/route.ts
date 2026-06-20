import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/workspace-store";

export const runtime = "nodejs";

const ALLOWED = ["decision", "adr", "convention", "glossary", "note"];

export async function POST(req: Request) {
  const { workspaceId, type, title, body } = await req
    .json()
    .catch(() => ({}) as { workspaceId?: string; type?: string; title?: string; body?: string });
  const ws = workspaceId ? getWorkspace(workspaceId) : null;
  if (!ws) return NextResponse.json({ error: { message: "Workspace not found — reload the page." } }, { status: 404 });
  if (!type || !ALLOWED.includes(type) || !title || !body) {
    return NextResponse.json({ error: { message: `Need type (${ALLOWED.join("|")}), title, body.` } }, { status: 400 });
  }
  ws.os.store.add({ type: type as never, title, body });
  return NextResponse.json({ items: ws.os.store.active(), files: ws.os.files() });
}
