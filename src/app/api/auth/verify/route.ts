import { sql } from "drizzle-orm";
import { db } from "@/db";
import { digits, ensureReady, err, json, token, validPhone } from "@/lib/api-server";

export const dynamic = "force-dynamic";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** POST /api/auth/verify — تایید کد و صدور توکن نشست */
export async function POST(req: Request) {
  try {
    await ensureReady();

    const body = (await req.json().catch(() => ({}))) as { phone?: string; code?: string };
    const phone = digits(body.phone);
    const code = digits(body.code);
    if (!validPhone(phone) || !/^\d{5}$/.test(code)) return err("اطلاعات ناقص است");

    const { rows } = await db.execute(sql`
      SELECT code, expires, tries FROM otps WHERE phone = ${phone} LIMIT 1
    `);
    const row = rows[0] as { code: string; expires: string | number; tries: number | string } | undefined;
    if (!row) return err("کدی برای این شماره ارسال نشده؛ دوباره درخواست بده", 404);
    if (Number(row.expires) < Date.now()) return err("کد منقضی شده؛ دوباره درخواست بده");
    if (Number(row.tries) >= 5) return err("تلاش زیاد بود؛ دوباره درخواست کد بده", 429);
    if (row.code !== code) {
      await db.execute(sql`UPDATE otps SET tries = tries + 1 WHERE phone = ${phone}`);
      return err("کد واردشده صحیح نیست", 401);
    }

    await db.execute(sql`DELETE FROM otps WHERE phone = ${phone}`);

    const now = Date.now();
    await db.execute(sql`
      INSERT INTO users(phone, created_at) VALUES (${phone}, ${now})
      ON CONFLICT (phone) DO NOTHING
    `);

    const t = token(32);
    await db.execute(sql`
      INSERT INTO sessions(token, user_phone, created_at, expires)
      VALUES (${t}, ${phone}, ${now}, ${now + 30 * 864e5})
    `);

    const { rows: urows } = await db.execute(sql`
      SELECT phone, name, avatar FROM users WHERE phone = ${phone} LIMIT 1
    `);
    const user = urows[0] as { phone: string; name: string | null; avatar: string | null };

    return json({ ok: true, token: t, user });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}
