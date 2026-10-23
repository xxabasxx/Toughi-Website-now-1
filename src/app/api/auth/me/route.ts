import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureReady, err, getUser, json } from "@/lib/api-server";

export const dynamic = "force-dynamic";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** GET /api/auth/me — پروفایل کاربر واردشده */
export async function GET(req: Request) {
  try {
    await ensureReady();
    const u = await getUser(req);
    if (!u) return err("وارد نشده‌ای", 401);
    return json({ ok: true, user: u });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}

/** PATCH /api/auth/me — ویرایش نام */
export async function PATCH(req: Request) {
  try {
    await ensureReady();
    const u = await getUser(req);
    if (!u) return err("وارد نشده‌ای", 401);
    const body = (await req.json().catch(() => ({}))) as { name?: string };
    const name = String(body.name ?? "").slice(0, 40).trim() || null;
    await db.execute(sql`UPDATE users SET name = ${name} WHERE phone = ${u.phone}`);
    return json({ ok: true });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}
