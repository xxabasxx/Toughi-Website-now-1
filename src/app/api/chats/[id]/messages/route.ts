import { sql } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { ensureReady, err, getUser, json } from "@/lib/api-server";

export const dynamic = "force-dynamic";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

type Ctx = { params: Promise<{ id: string }> };

/** بررسی دسترسی کاربر به گفتگو (خریدار یا صاحب آگهی) */
async function canAccess(chatId: number, phone: string) {
  const { rows } = await db.execute(sql`
    SELECT c.id, c.buyer_phone, a.user_phone AS owner
    FROM chats c
    JOIN ads a ON a.id = c.ad_id
    WHERE c.id = ${chatId}
    LIMIT 1
  `);
  const chat = rows[0] as { id: number; buyer_phone: string; owner: string } | undefined;
  if (!chat) return null;
  if (chat.buyer_phone !== phone && chat.owner !== phone) return null;
  return chat;
}

/** GET /api/chats/:id/messages?after= — پیام‌های گفتگو (poll) */
export async function GET(req: Request, ctx: Ctx) {
  try {
    await ensureReady();

    const u = await getUser(req);
    if (!u) return err("وارد نشده‌ای", 401);

    const chatId = Number((await ctx.params).id);
    if (!Number.isFinite(chatId)) return err("گفتگو نامعتبر است");

    const access = await canAccess(chatId, u.phone);
    if (!access) return err("دسترسی نداری", 403);

    const after = Number(new URL(req.url).searchParams.get("after")) || 0;

    // خوانده‌شدن پیام‌های طرف مقابل
    await db.execute(sql`
      UPDATE messages SET read = 1 WHERE chat_id = ${chatId} AND sender != ${u.phone}
    `);

    const { rows } = await db.execute(sql`
      SELECT id, sender, body, at FROM messages
      WHERE chat_id = ${chatId} AND at > ${after}
      ORDER BY at ASC
      LIMIT 80
    `);

    const items = (rows as { id: number; sender: string; body: string; at: number | string }[]).map(
      (m) => ({
        id: Number(m.id),
        fromMe: m.sender === u.phone,
        body: m.body,
        at: Number(m.at),
      }),
    );

    return json({ ok: true, items });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}

/** POST /api/chats/:id/messages — ارسال پیام */
export async function POST(req: Request, ctx: Ctx) {
  try {
    await ensureReady();

    const u = await getUser(req);
    if (!u) return err("وارد نشده‌ای", 401);

    const chatId = Number((await ctx.params).id);
    if (!Number.isFinite(chatId)) return err("گفتگو نامعتبر است");

    const access = await canAccess(chatId, u.phone);
    if (!access) return err("دسترسی نداری", 403);

    const body = (await req.json().catch(() => ({}))) as { body?: string };
    const text = String(body.body ?? "").trim().slice(0, 1000);
    if (!text) return err("پیام خالی است");

    await db.insert(messages).values({
      chatId,
      sender: u.phone,
      body: text,
      read: 0,
      at: Date.now(),
    });

    return json({ ok: true }, 201);
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}
