import { sql } from "drizzle-orm";
import { db } from "@/db";
import { LISTINGS } from "@/data";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** «۳۰ دقیقه پیش» / «۲ ساعت پیش» / «دیروز» → میلی‌ثانیه قبل از الان */
function timeOffsetMs(fa: string): number {
  const en = fa.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
  const num = parseInt(en.match(/\d+/)?.[0] ?? "1", 10);
  if (en.includes("دقیقه")) return num * 60_000;
  if (en.includes("ساعت")) return num * 3_600_000;
  if (en.includes("دیروز")) return 26 * 3_600_000;
  if (en.includes("روز")) return num * 86_400_000;
  return 0;
}

const SYSTEM_SELLER = "09990000000";

let seeded = false;

/**
 * بوت‌استرپ خودکار داده‌های نمایشی (فقط وقتی جدول آگهی‌ها خالی است).
 */
export async function ensureSeeded() {
  if (seeded) return;
  seeded = true;

  const rows = await db.execute(sql`SELECT COUNT(*)::int AS n FROM ads`);
  const count = Number((rows.rows[0] as { n: number } | undefined)?.n ?? 0);
  if (count > 0) return;

  const now = Date.now();
  for (let i = 0; i < LISTINGS.length; i++) {
    const l = LISTINGS[i];
    const createdAt = now - timeOffsetMs(l.time) - i * 45_000;
    const images = l.images?.length ? l.images : [l.img];
    const specs = l.specs ?? {};
    await db.execute(sql`
      INSERT INTO ads(
        id, user_phone, title, cat, breed, sex, age, health, delivery,
        price, agreed, province, city, district, description, phone, seller,
        images, status, views, created_at
      ) VALUES (
        ${`seed_${l.id}`}, ${SYSTEM_SELLER}, ${l.title}, ${l.cat},
        ${specs.breed ?? null}, ${specs.sex ?? null}, ${specs.age ?? null},
        ${specs.health ?? null}, ${specs.delivery ?? null},
        ${l.price}, ${l.price == null}, ${l.province ?? null}, ${l.city},
        ${l.district ?? null}, ${l.desc ?? null}, ${l.phone ?? SYSTEM_SELLER},
        ${l.seller ?? "فروشنده طوقی"}, ${JSON.stringify(images)},
        'active', ${120 + ((i * 37) % 480)}, ${createdAt}
      )
      ON CONFLICT (id) DO NOTHING
    `);
  }

  await db.execute(sql`
    INSERT INTO users(phone, name, created_at)
    VALUES (${SYSTEM_SELLER}, 'فروشگاه رسمی طوقی', ${now})
    ON CONFLICT (phone) DO NOTHING
  `);
}
