import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { adToListing, ensureReady, err, getUser, json } from "@/lib/api-server";

export const dynamic = "force-dynamic";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/ads/:id — جزئیات آگهی (+ شمارنده بازدید) */
export async function GET(req: Request, ctx: Ctx) {
  try {
    await ensureReady();
    const { id } = await ctx.params;

    const [row] = await db.select().from(ads).where(eq(ads.id, id)).limit(1);
    if (!row || row.status !== "active") return err("آگهی پیدا نشد", 404);

    await db.execute(sql`UPDATE ads SET views = views + 1 WHERE id = ${id}`);

    const viewer = await getUser(req);
    return json({
      ok: true,
      ad: adToListing({ ...row, views: Number(row.views) + 1 }, viewer?.phone ?? null),
    });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}

/** DELETE /api/ads/:id — حذف آگهی (فقط مالک) */
export async function DELETE(req: Request, ctx: Ctx) {
  try {
    await ensureReady();
    const { id } = await ctx.params;

    const u = await getUser(req);
    if (!u) return err("وارد نشده‌ای", 401);

    const deleted = await db
      .update(ads)
      .set({ status: "deleted" })
      .where(and(eq(ads.id, id), eq(ads.userPhone, u.phone)))
      .returning({ id: ads.id });

    if (!deleted.length) return err("این آگهی مال تو نیست", 403);
    return json({ ok: true });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}
