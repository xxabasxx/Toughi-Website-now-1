import { sql } from "drizzle-orm";
import { db } from "@/db";
import { digits, ensureReady, err, json, SANDBOX, validPhone } from "@/lib/api-server";

export const dynamic = "force-dynamic";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** POST /api/auth/send — ارسال کد تایید (OTP) */
export async function POST(req: Request) {
  try {
    await ensureReady();

    const body = (await req.json().catch(() => ({}))) as { phone?: string };
    const phone = digits(body.phone);
    if (!validPhone(phone)) return err("شماره موبایل معتبر نیست");

    const code = SANDBOX ? "12345" : String(10000 + Math.floor(Math.random() * 90000));
    const expires = Date.now() + 3 * 60 * 1000;

    await db.execute(sql`
      INSERT INTO otps(phone, code, expires, tries) VALUES (${phone}, ${code}, ${expires}, 0)
      ON CONFLICT (phone) DO UPDATE SET code = excluded.code, expires = excluded.expires, tries = 0
    `);

    // پیامک واقعی با کاوه‌نگار — فقط وقتی SMS_TOKEN تنظیم شده و حالت تست خاموش است
    const smsToken = process.env.SMS_TOKEN;
    if (!SANDBOX && smsToken) {
      try {
        await fetch(`https://api.kavenegar.com/v1/${smsToken}/verify/lookup.json`, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: `receptor=${phone}&token=${code}&template=${process.env.SMS_TEMPLATE || "tooghi"}`,
        });
      } catch {
        /* fail-open: کد در دیتابیس ذخیره شده */
      }
    }

    return json({
      ok: true,
      message: "کد تایید پیامک شد",
      devCode: SANDBOX ? code : undefined,
    });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}
