import { getWorkspace } from "@/lib/workspace-store";

export const runtime = "nodejs";

// Download the portable Context Handoff bundle (the open format).
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("workspaceId");
  const ws = id ? getWorkspace(id) : null;
  if (!ws) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
  const bundle = ws.os.export();
  return new Response(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${ws.os.project}-handoff.json"`,
    },
  });
}
