import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/workspace-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { workspaceId, question } = await req.json().catch(() => ({}) as { workspaceId?: string; question?: string });
  const ws = workspaceId ? getWorkspace(workspaceId) : null;
  if (!ws) return NextResponse.json({ error: { message: "Workspace not found — reload." } }, { status: 404 });
  if (!question) return NextResponse.json({ error: { message: "question is required." } }, { status: 400 });
  const result = await ws.grounded.ask(question, 6);
  return NextResponse.json(result);
}
