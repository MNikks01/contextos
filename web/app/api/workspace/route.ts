import { NextResponse } from "next/server";
import { createWorkspace } from "@/lib/workspace-store";
import type { ContextType } from "@/lib/engine/types";

export const runtime = "nodejs";

const SEED: [ContextType, string, string][] = [
  ["convention", "Money as integer cents", "Represent all money as integer cents — never use floats."],
  ["convention", "Never log card numbers", "Always mask card numbers to last4; never log the raw card number (PAN)."],
  ["decision", "Postgres + Drizzle", "We chose Postgres + Drizzle for the core data model (ACID, relations)."],
  ["glossary", "Idempotency key", "A client-supplied key that makes a POST safe to retry."],
];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}) as { project?: string; seed?: boolean });
  const { id, ws } = createWorkspace(body.project || "my-team");
  if (body.seed) for (const [type, title, b] of SEED) ws.os.store.add({ type, title, body: b });
  return NextResponse.json({ workspaceId: id, project: ws.os.project, items: ws.os.store.active(), files: ws.os.files() });
}
