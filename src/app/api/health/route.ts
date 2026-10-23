import { ensureReady } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureReady();
    return Response.json({ ok: true, service: "tooghi-api" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
