import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ads, chats, messages } from "@/db/schema";
import { ensureReady, err, getUser, json } from "@/lib/api-server";

export const dynamic = "force-dynamic";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

type ChatJoinRow = {
  id: number;
  ad_id: string;
  buyer_phone: string;
  created_at: number | string;
  ad_title: string;
  ad_images: string;
  owner: string;
  unread: number | string;
  last_msg: string | null;
  last_at: number | string | null;
};

/** GET /api/chats — لیست گفتگوهای من (خریدار یا فروشنده) */
export async function GET(req: Request) {
  try {
    await ensureReady();

    const u = await getUser(req);
    if (!u) return err("وارد نشده‌ای", 401);

    const { rows } = await db.execute(sql`
      SELECT * FROM (
        SELECT c.id, c.ad_id, c.buyer_phone, c.created_at,
               a.title AS ad_title, a.images AS ad_images, a.user_phone AS owner,
               (SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.id AND m.sender != ${u.phone} AND m.read = 0) AS unread,
               (SELECT body FROM messages m2 WHERE m2.chat_id = c.id ORDER BY at DESC LIMIT 1) AS last_msg,
               (SELECT at   FROM messages m3 WHERE m3.chat_id = c.id ORDER BY at DESC LIMIT 1) AS last_at
        FROM chats c
        JOIN ads a ON a.id = c.ad_id
        WHERE c.buyer_phone = ${u.phone} OR a.user_phone = ${u.phone}
      ) AS t
      ORDER BY COALESCE(t.last_at, t.created_at) DESC
      LIMIT 50
    `);

    const items = (rows as ChatJoinRow[]).map((r) => {
      let firstImage: string | null = null;
      try {
        firstImage = JSON.parse(r.ad_images || "[]")[0] ?? null;
      } catch {
        firstImage = null;
      }
      const isBuyer = r.buyer_phone === u.phone;
      return {
        id: Number(r.id),
        adId: r.ad_id,
        adTitle: r.ad_title,
        adImage: firstImage,
        role: isBuyer ? "buyer" : "seller",
        peer: isBuyer ? r.owner : r.buyer_phone,
        unread: Number(r.unread ?? 0),
        lastMsg: r.last_msg,
        lastAt: r.last_at == null ? null : Number(r.last_at),
      };
    });

    return json({ ok: true, items });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}

/** POST /api/chats — شروع یا دریافت گفتگو برای یک آگهی */
export async function POST(req: Request) {
  try {
    await ensureReady();

    const u = await getUser(req);
    if (!u) return err("برای چت باید وارد شوی", 401);

    const body = (await req.json().catch(() => ({}))) as { adId?: string };
    const adId = String(body.adId ?? "");
    if (!adId) return err("آگهی مشخص نشده");

    const [ad] = await db
      .select({ id: ads.id, userPhone: ads.userPhone, title: ads.title, status: ads.status })
      .from(ads)
      .where(eq(ads.id, adId))
      .limit(1);

    if (!ad || ad.status !== "active") return err("آگهی پیدا نشد", 404);
    if (ad.userPhone === u.phone) return err("با آگهی خودت که نمی‌شود چت کرد", 400);

    const [existing] = await db
      .select({ id: chats.id })
      .from(chats)
      .where(and(eq(chats.adId, adId), eq(chats.buyerPhone, u.phone)))
      .limit(1);

    if (existing) return json({ ok: true, chatId: Number(existing.id) });

    const [created] = await db
      .insert(chats)
      .values({ adId, buyerPhone: u.phone, createdAt: Date.now() })
      .returning({ id: chats.id });

    await db.insert(messages).values({
      chatId: created.id,
      sender: ad.userPhone,
      body: `سلام! این گفتگو درباره «${ad.title}» شروع شد`,
      read: 0,
      at: Date.now(),
    });

    return json({ ok: true, chatId: Number(created.id) });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}
