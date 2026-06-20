import { NextResponse } from "next/server";
import { extractProposals } from "@/lib/engine/extract";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { text } = await req.json().catch(() => ({}) as { text?: string });
  if (!text || text.trim().length < 12) {
    return NextResponse.json({ error: { message: "Provide some text (a PR description, chat, notes)." } }, { status: 400 });
  }
  return NextResponse.json({ proposals: extractProposals(text, "web") });
}
