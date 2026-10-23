import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { schemaDDL, type AdRow } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { faDigits } from "@/fa";

/* ------------------------------------------------ helpers */

export const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export const err = (message: string, status = 400) =>
  json({ ok: false, message }, status);

export const digits = (s: unknown) =>
  String(s ?? "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "");

export const validPhone = (p: string) => /^09\d{9}$/.test(p);

export const token = (n = 32) => randomBytes(n).toString("hex");

/** حالت تست: کد تایید همیشه ۱۲۳۴۵ و در پاسخ برمی‌گردد (مثل نسخه اصلی). */
export const SANDBOX = process.env.SANDBOX_MODE !== "0";

/* ------------------------------------------------ boot */

let ready = false;

/** جداول + داده نمایشی را (در صورت نبودن) آماده می‌کند؛ امن برای فراخوانی تکراری. */
export async function ensureReady() {
  if (ready) return;
  ready = true;
  await db.execute(schemaDDL);
  await ensureSeeded();
}

/* ------------------------------------------------ auth */

export type SessionUser = {
  phone: string;
  name: string | null;
  avatar: string | null;
};

export async function getUser(req: Request): Promise<SessionUser | null> {
  const h = req.headers.get("authorization") ?? "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return null;

  const { rows } = await db.execute(sql`
    SELECT user_phone, expires FROM sessions WHERE token = ${t} LIMIT 1
  `);
  const s = rows[0] as { user_phone: string; expires: number | string } | undefined;
  if (!s || Number(s.expires) < Date.now()) return null;

  const { rows: urows } = await db.execute(sql`
    SELECT phone, name, avatar FROM users WHERE phone = ${s.user_phone} LIMIT 1
  `);
  const u = urows[0] as SessionUser | undefined;
  return u ?? { phone: s.user_phone, name: null, avatar: null };
}

/* ------------------------------------------------ ads */

/** «۳۰ دقیقه پیش» — زمان نسبی فارسی */
export function faTimeAgo(ts: number): string {
  const diff = Date.now() - Number(ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "همین حالا";
  if (m < 60) return `${faDigits(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${faDigits(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d <= 1) return "دیروز";
  if (d < 30) return `${faDigits(d)} روز پیش`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${faDigits(mo)} ماه پیش`;
  return `${faDigits(Math.floor(mo / 12))} سال پیش`;
}

/**
 * سطر دیتابیس → شیء نرمال‌شده‌ی Listing که کامپوننت‌های فرانت انتظارش را دارند.
 * (نسبت به ورکر قدیمی: img / time / district / desc / specs اضافه شده‌اند)
 */
export function adToListing(r: AdRow, viewerPhone?: string | null) {
  let images: string[] = [];
  try {
    images = JSON.parse(r.images || "[]");
  } catch {
    images = [];
  }
  const specs = {
    age: r.age ?? undefined,
    sex: r.sex ?? undefined,
    breed: r.breed ?? undefined,
    health: r.health ?? undefined,
    delivery: r.delivery ?? undefined,
  };
  const hasSpecs = Object.values(specs).some(Boolean);
  return {
    id: r.id,
    title: r.title,
    cat: r.cat,
    img: images[0] ?? "",
    images,
    price: r.price == null ? null : Number(r.price),
    city: r.city,
    province: r.province ?? undefined,
    district: r.district ?? "",
    time: faTimeAgo(Number(r.createdAt)),
    desc: r.description ?? undefined,
    seller: r.seller ?? "فروشنده طوقی",
    phone: r.phone ?? undefined,
    badge: viewerPhone && viewerPhone === r.userPhone ? "آگهی من" : undefined,
    mine: viewerPhone === r.userPhone,
    featured: false,
    views: Number(r.views ?? 0),
    specs: hasSpecs ? specs : undefined,
    createdAt: Number(r.createdAt),
  };
}

export const newAdId = (phone: string) =>
  `ad_${digits(phone).slice(-8)}_${Date.now().toString(36)}`;
