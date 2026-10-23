import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { ads } from "@/db/schema";
import {
  adToListing,
  digits,
  ensureReady,
  err,
  getUser,
  json,
  newAdId,
  validPhone,
} from "@/lib/api-server";

export const dynamic = "force-dynamic";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** GET /api/ads — لیست آگهی‌ها با فیلتر شهر/دسته/جستجو (+mine=1) */
export async function GET(req: Request) {
  try {
    await ensureReady();

    const url = new URL(req.url);
    const city = url.searchParams.get("city");
    const cat = url.searchParams.get("cat");
    const q = (url.searchParams.get("q") ?? "").trim();
    const mine = url.searchParams.get("mine");
    const limit = Math.min(Number(url.searchParams.get("limit")) || 48, 100);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

    const viewer = await getUser(req);
    const conds = [eq(ads.status, "active")];

    if (mine === "1") {
      if (!viewer) return err("وارد نشده‌ای", 401);
      conds.push(eq(ads.userPhone, viewer.phone));
    } else {
      if (city && city !== "همه شهرها") conds.push(eq(ads.city, city));
      if (cat && cat !== "all") conds.push(eq(ads.cat, cat));
      if (q) {
        const like = `%${q}%`;
        conds.push(or(ilike(ads.title, like), ilike(ads.description, like), ilike(ads.breed, like))!);
      }
    }

    const rows = await db
      .select()
      .from(ads)
      .where(and(...conds))
      .orderBy(desc(ads.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const items = rows.slice(0, limit).map((r) => adToListing(r, viewer?.phone ?? null));
    return json({ ok: true, items, hasMore: rows.length > limit });
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}

/** POST /api/ads — ثبت آگهی جدید (نیازمند ورود) */
export async function POST(req: Request) {
  try {
    await ensureReady();

    const u = await getUser(req);
    if (!u) return err("برای ثبت آگهی باید وارد شوی", 401);

    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const title = String(b.title ?? "").trim();
    if (title.length < 4) return err("عنوان کوتاه است (حداقل ۴ حرف)");
    if (!b.cat) return err("دسته‌بندی انتخاب نشده");
    const city = String(b.city ?? "").trim();
    if (!city) return err("شهر انتخاب نشده");

    const images = Array.isArray(b.images) ? (b.images as unknown[]).filter(Boolean).slice(0, 4) : [];
    const agreed = !!b.agreed;
    const priceRaw = digits(b.agreed ? "" : b.price);
    const price = agreed ? null : priceRaw ? Number(priceRaw) : null;
    const phone = validPhone(digits(b.phone)) ? digits(b.phone) : u.phone;

    const id = newAdId(u.phone);
    const seller = String(b.seller ?? "").slice(0, 40).trim() || u.name || "فروشنده طوقی";

    const [row] = await db
      .insert(ads)
      .values({
        id,
        userPhone: u.phone,
        title: title.slice(0, 80),
        cat: String(b.cat),
        breed: (b.breed as string) || null,
        sex: (b.sex as string) || null,
        age: (b.age as string) || null,
        health: (b.health as string) || null,
        delivery: (b.delivery as string) || null,
        price,
        agreed,
        province: (b.province as string) || null,
        city,
        district: (b.district as string) || null,
        description: String(b.description ?? "").slice(0, 1500).trim() || null,
        phone,
        seller,
        images: JSON.stringify(images),
        status: "active",
        views: 0,
        createdAt: Date.now(),
      })
      .returning();

    return json({ ok: true, ad: adToListing(row, u.phone) }, 201);
  } catch (e) {
    return err("خطای سرور: " + msg(e), 500);
  }
}
