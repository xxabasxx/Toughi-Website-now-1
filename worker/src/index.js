/* ============================================================
   طوقی — Worker API (Workers + D1 + R2)
   Routes:
     POST /api/auth/send      {phone}            → ارسال کد
     POST /api/auth/verify    {phone,code}       → {token,user}
     GET  /api/auth/me        (bearer)           → {user}
     PATCH/api/auth/me        (bearer) {name}    → ویرایش نام
     GET  /api/ads?city&cat&q&mine               → لیست آگهی‌ها
     GET  /api/ads/:id                           → جزئیات (+views)
     POST /api/ads            (bearer) {...}     → ثبت آگهی
     DELETE/api/ads/:id       (bearer)           → حذف آگهی من
     POST /api/ads/:id/fav    (bearer)           → علاقه‌مندی (تعاملی)
     POST /api/upload         (bearer, image/*)  → {url}  (اگر R2 وصل باشد)
     GET  /api/chats          (bearer)           → لیست گفتگوهای من
     POST /api/chats          (bearer) {adId}    → شروع/دریافت گفتگو
     GET  /api/chats/:id/messages?after=         → پیام‌ها (poll)
     POST /api/chats/:id/messages (bearer) {body}→ ارسال پیام
   ============================================================ */

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });

const err = (message, status = 400) => json({ ok: false, message }, status);

const rnd = (n = 24) => {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const digits = (s) => String(s || "").replace(/\D/g, "");
const validPhone = (p) => /^09\d{9}$/.test(p);
const adIdFor = (phone) =>
  "ad_" + digits(phone).slice(-8) + "_" + Date.now().toString(36);

async function getUser(env, req) {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return null;
  const now = Date.now();
  const row = await env.DB.prepare(
    "SELECT user_phone,expires FROM sessions WHERE token=?"
  ).bind(token).first();
  if (!row || row.expires < now) return null;
  const user = await env.DB.prepare(
    "SELECT phone,name,avatar FROM users WHERE phone=?"
  ).bind(row.user_phone).first();
  return user || { phone: row.user_phone, name: null, avatar: null };
}

let schemaDone = false;
async function ensureSchema(env) {
  if (schemaDone) return;
  schemaDone = true;
  const stmts = [
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL UNIQUE, name TEXT, avatar TEXT, created_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS otps (phone TEXT PRIMARY KEY, code TEXT NOT NULL, expires INTEGER NOT NULL, tries INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_phone TEXT NOT NULL, created_at INTEGER NOT NULL, expires INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS ads (id TEXT PRIMARY KEY, user_phone TEXT NOT NULL, title TEXT NOT NULL, cat TEXT NOT NULL, breed TEXT, sex TEXT, age TEXT, health TEXT, delivery TEXT, price INTEGER, agreed INTEGER NOT NULL DEFAULT 0, province TEXT, city TEXT NOT NULL, district TEXT, description TEXT, phone TEXT, seller TEXT, images TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'active', views INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS chats (id INTEGER PRIMARY KEY AUTOINCREMENT, ad_id TEXT NOT NULL, buyer_phone TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(ad_id, buyer_phone))`,
    `CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id INTEGER NOT NULL, sender TEXT NOT NULL, body TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, at INTEGER NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_ads_city ON ads(city)`,
    `CREATE INDEX IF NOT EXISTS idx_ads_cat ON ads(cat)`,
    `CREATE INDEX IF NOT EXISTS idx_ads_user ON ads(user_phone)`,
    `CREATE INDEX IF NOT EXISTS idx_msgs ON messages(chat_id, at)`,
  ];
  for (const s of stmts) await env.DB.prepare(s).run();
}

const adRow = (r) => ({
  id: r.id,
  title: r.title,
  cat: r.cat,
  breed: r.breed,
  sex: r.sex,
  age: r.age,
  health: r.health,
  delivery: r.delivery,
  price: r.price == null ? null : Number(r.price),
  agreed: !!r.agreed,
  province: r.province,
  city: r.city,
  district: r.district,
  description: r.description,
  phone: r.phone,
  seller: r.seller,
  images: JSON.parse(r.images || "[]"),
  views: r.views,
  created_at: r.created_at,
});

async function adOwnerChatCount(env, adId, buyer) {
  const c = await env.DB.prepare(
    "SELECT id FROM chats WHERE ad_id=? AND buyer_phone=?"
  ).bind(adId, buyer).first();
  return c?.id || null;
}

const router = {
  /* ---------------- auth ---------------- */
  async sendOtp(env, req) {
    const { phone } = await req.json().catch(() => ({}));
    const p = digits(phone);
    if (!validPhone(p)) return err("شماره موبایل معتبر نیست");
    const code = env.SANDBOX_MODE === "1" ? "12345" : String(10000 + Math.floor(Math.random() * 90000));
    await env.DB.prepare(
      `INSERT INTO otps(phone,code,expires,tries) VALUES(?,?,?,0)
       ON CONFLICT(phone) DO UPDATE SET code=excluded.code,expires=excluded.expires,tries=0`
    ).bind(p, code, Date.now() + 3 * 60 * 1000).run();
    if (env.SANDBOX_MODE !== "1" && env.SMS_TOKEN) {
      // کاوه‌نگار — اگر SMS_TOKEN ست باشد
      try {
        await fetch(
          `https://api.kavenegar.com/v1/${env.SMS_TOKEN}/verify/lookup.json`,
          {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: `receptor=${p}&token=${code}&template=${env.SMS_TEMPLATE || "tooghi"}`,
          }
        );
      } catch (_) { /* fail-open: کد در دیتابیس هست */ }
    }
    return json({
      ok: true,
      message: "کد تایید پیامک شد",
      devCode: env.SANDBOX_MODE === "1" ? code : undefined,
    });
  },

  async verifyOtp(env, req) {
    const { phone, code } = await req.json().catch(() => ({}));
    const p = digits(phone), c = digits(code);
    if (!validPhone(p) || !/^\d{5}$/.test(c)) return err("اطلاعات ناقص است");
    const row = await env.DB.prepare("SELECT code,expires,tries FROM otps WHERE phone=?").bind(p).first();
    if (!row) return err("کدی برای این شماره ارسال نشده؛ دوباره درخواست بده", 404);
    if (row.expires < Date.now()) return err("کد منقضی شده؛ دوباره درخواست بده");
    if (row.tries >= 5) return err("تلاش زیاد بود؛ دوباره درخواست کد بده", 429);
    if (row.code !== c) {
      await env.DB.prepare("UPDATE otps SET tries=tries+1 WHERE phone=?").bind(p).run();
      return err("کد واردشده صحیح نیست", 401);
    }
    await env.DB.prepare("DELETE FROM otps WHERE phone=?").bind(p).run();
    await env.DB.prepare(
      `INSERT INTO users(phone,created_at) VALUES(?,?)
       ON CONFLICT(phone) DO NOTHING`
    ).bind(p, Date.now()).run();
    const token = rnd(32);
    await env.DB.prepare(
      "INSERT INTO sessions(token,user_phone,created_at,expires) VALUES(?,?,?,?)"
    ).bind(token, p, Date.now(), Date.now() + 30 * 864e5).run();
    const user = await env.DB.prepare("SELECT phone,name,avatar FROM users WHERE phone=?").bind(p).first();
    return json({ ok: true, token, user });
  },

  async me(env, req) {
    const u = await getUser(env, req);
    if (!u) return err("وارد نشده‌ای", 401);
    return json({ ok: true, user: u });
  },

  async patchMe(env, req) {
    const u = await getUser(env, req);
    if (!u) return err("وارد نشده‌ای", 401);
    const { name } = await req.json().catch(() => ({}));
    await env.DB.prepare("UPDATE users SET name=? WHERE phone=?")
      .bind(String(name || "").slice(0, 40) || null, u.phone).run();
    return json({ ok: true });
  },

  /* ---------------- ads ---------------- */
  async listAds(env, req, url) {
    const city = url.searchParams.get("city");
    const cat = url.searchParams.get("cat");
    const q = (url.searchParams.get("q") || "").trim();
    const mine = url.searchParams.get("mine");
    const limit = Math.min(Number(url.searchParams.get("limit")) || 48, 100);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

    let where = "status='active'";
    const binds = [];
    if (mine === "1") {
      const u = await getUser(env, req);
      if (!u) return err("وارد نشده‌ای", 401);
      where += " AND user_phone=?";
      binds.push(u.phone);
    } else {
      if (city && city !== "همه شهرها") { where += " AND city=?"; binds.push(city); }
      if (cat && cat !== "all") { where += " AND cat=?"; binds.push(cat); }
      if (q) {
        where += " AND (title LIKE ? OR description LIKE ? OR breed LIKE ?)";
        binds.push(`%${q}%`, `%${q}%`, `%${q}%`);
      }
    }
    const { results } = await env.DB.prepare(
      `SELECT * FROM ads WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...binds, limit + 1, offset).all();
    const items = results.slice(0, limit).map(adRow);
    return json({ ok: true, items, hasMore: results.length > limit });
  },

  async getAd(env, _req, id) {
    const row = await env.DB.prepare("SELECT * FROM ads WHERE id=?").bind(id).first();
    if (!row || row.status !== "active") return err("آگهی پیدا نشد", 404);
    env.DB.prepare("UPDATE ads SET views=views+1 WHERE id=?").bind(id).run();
    return json({ ok: true, ad: adRow({ ...row, views: row.views + 1 }) });
  },

  async createAd(env, req) {
    const u = await getUser(env, req);
    if (!u) return err("برای ثبت آگهی باید وارد شوی", 401);
    const b = await req.json().catch(() => ({}));
    const title = String(b.title || "").trim();
    if (title.length < 4) return err("عنوان کوتاه است (حداقل ۴ حرف)");
    if (!b.cat) return err("دسته‌بندی انتخاب نشده");
    const city = String(b.city || "").trim();
    if (!city) return err("شهر انتخاب نشده");
    const imgs = Array.isArray(b.images) ? b.images.filter(Boolean).slice(0, 4) : [];

    const id = adIdFor(u.phone);
    const phone = validPhone(digits(b.phone)) ? digits(b.phone) : u.phone;
    await env.DB.prepare(
      `INSERT INTO ads(id,user_phone,title,cat,breed,sex,age,health,delivery,price,agreed,province,city,district,description,phone,seller,images,status,created_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      id, u.phone, title.slice(0, 80), String(b.cat),
      b.breed || null, b.sex || null, b.age || null, b.health || null, b.delivery || null,
      b.agreed ? null : (Number(digits(b.price)) || null), b.agreed ? 1 : 0,
      b.province || null, city, b.district || null,
      String(b.description || "").slice(0, 1500) || null,
      phone, String(b.seller || "").slice(0, 40) || u.name || "فروشنده طوقی",
      JSON.stringify(imgs), "active", Date.now()
    ).run();
    const row = await env.DB.prepare("SELECT * FROM ads WHERE id=?").bind(id).first();
    return json({ ok: true, ad: adRow(row) }, 201);
  },

  async deleteAd(env, req, id) {
    const u = await getUser(env, req);
    if (!u) return err("وارد نشده‌ای", 401);
    const r = await env.DB.prepare(
      "UPDATE ads SET status='deleted' WHERE id=? AND user_phone=?"
    ).bind(id, u.phone).run();
    if (!r.meta.changes) return err("این آگهی مال تو نیست", 403);
    return json({ ok: true });
  },

  async upload(env, req) {
    const u = await getUser(env, req);
    if (!u) return err("وارد نشده‌ای", 401);
    if (!env.R2) return err("آپلود فایل فعال نیست (باکت R2 وصل نیست)", 501);
    const type = req.headers.get("content-type") || "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(type))
      return err("فقط عکس (jpg/png/webp)");
    const body = await req.arrayBuffer();
    if (body.byteLength > 5 * 1024 * 1024) return err("حجم عکس بیش از ۵ مگ");
    const key = `ads/${Date.now()}_${rnd(4)}.${type.split("/")[1]}`;
    await env.R2.put(key, body, { httpMetadata: { contentType: type } });
    return json({ ok: true, url: `/media/${key}` });
  },

  /* ---------------- chats ---------------- */
  async myChats(env, req) {
    const u = await getUser(env, req);
    if (!u) return err("وارد نشده‌ای", 401);
    const { results } = await env.DB.prepare(
      `SELECT c.*, a.title AS ad_title, a.images AS ad_images, a.user_phone AS owner,
              (SELECT COUNT(*) FROM messages m WHERE m.chat_id=c.id AND m.sender!=? AND m.read=0) AS unread,
              (SELECT body FROM messages m2 WHERE m2.chat_id=c.id ORDER BY at DESC LIMIT 1) AS last_msg,
              (SELECT at   FROM messages m3 WHERE m3.chat_id=c.id ORDER BY at DESC LIMIT 1) AS last_at
       FROM chats c JOIN ads a ON a.id=c.ad_id
       WHERE c.buyer_phone=? OR a.user_phone=?
       ORDER BY COALESCE(last_at, c.created_at) DESC LIMIT 50`
    ).bind(u.phone, u.phone, u.phone).all();
    const items = results.map((r) => ({
      id: r.id,
      adId: r.ad_id,
      adTitle: r.ad_title,
      adImage: (JSON.parse(r.ad_images || '[]')[0]) || null,
      role: r.buyer_phone === u.phone ? "buyer" : "seller",
      peer: r.buyer_phone === u.phone ? r.owner : r.buyer_phone,
      unread: r.unread,
      lastMsg: r.last_msg,
      lastAt: r.last_at,
    }));
    return json({ ok: true, items });
  },

  async openChat(env, req) {
    const u = await getUser(env, req);
    if (!u) return err("برای چت باید وارد شوی", 401);
    const { adId } = await req.json().catch(() => ({}));
    const ad = await env.DB.prepare("SELECT id,user_phone,title FROM ads WHERE id=? AND status='active'")
      .bind(adId).first();
    if (!ad) return err("آگهی پیدا نشد", 404);
    if (ad.user_phone === u.phone) return err("با آگهی خودت که نمی‌شود چت کرد", 400);
    let id = await adOwnerChatCount(env, adId, u.phone);
    if (!id) {
      const r = await env.DB.prepare(
        "INSERT INTO chats(ad_id,buyer_phone,created_at) VALUES(?,?,?)"
      ).bind(adId, u.phone, Date.now()).run();
      id = r.meta.last_row_id;
      await env.DB.prepare(
        "INSERT INTO messages(chat_id,sender,body,at) VALUES(?,?,?,?)"
      ).bind(id, ad.user_phone, `سلام 👋 این گفتگو درباره «${ad.title}» شروع شد`, Date.now()).run();
    }
    return json({ ok: true, chatId: id });
  },

  async listMsgs(env, req, chatId, url) {
    const u = await getUser(env, req);
    if (!u) return err("وارد نشده‌ای", 401);
    const after = Number(url.searchParams.get("after")) || 0;
    const chat = await env.DB.prepare(
      `SELECT c.*, a.user_phone AS owner FROM chats c JOIN ads a ON a.id=c.ad_id WHERE c.id=?`
    ).bind(chatId).first();
    if (!chat || (chat.buyer_phone !== u.phone && chat.owner !== u.phone))
      return err("دسترسی نداری", 403);
    env.DB.prepare("UPDATE messages SET read=1 WHERE chat_id=? AND sender!=?")
      .bind(chatId, u.phone).run();
    const { results } = await env.DB.prepare(
      "SELECT * FROM messages WHERE chat_id=? AND at>? ORDER BY at LIMIT 80"
    ).bind(chatId, after).all();
    return json({
      ok: true,
      items: results.map((m) => ({ id: m.id, fromMe: m.sender === u.phone, body: m.body, at: m.at })),
    });
  },

  async sendMsg(env, req, chatId) {
    const u = await getUser(env, req);
    if (!u) return err("وارد نشده‌ای", 401);
    const chat = await env.DB.prepare(
      `SELECT c.*, a.user_phone AS owner FROM chats c JOIN ads a ON a.id=c.ad_id WHERE c.id=?`
    ).bind(chatId).first();
    if (!chat || (chat.buyer_phone !== u.phone && chat.owner !== u.phone))
      return err("دسترسی نداری", 403);
    const { body } = await req.json().catch(() => ({}));
    const text = String(body || "").trim().slice(0, 1000);
    if (!text) return err("پیام خالی است");
    await env.DB.prepare("INSERT INTO messages(chat_id,sender,body,at) VALUES(?,?,?,?)")
      .bind(chatId, u.phone, text, Date.now()).run();
    return json({ ok: true }, 201);
  },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    try {
      await ensureSchema(env);

      if (p === "/api/health") return json({ ok: true, service: "tooghi-api" });

      if (p === "/api/auth/send" && request.method === "POST")   return await router.sendOtp(env, request);
      if (p === "/api/auth/verify" && request.method === "POST") return await router.verifyOtp(env, request);
      if (p === "/api/auth/me" && request.method === "GET")      return await router.me(env, request);
      if (p === "/api/auth/me" && request.method === "PATCH")    return await router.patchMe(env, request);

      if (p === "/api/ads" && request.method === "GET")          return await router.listAds(env, request, url);
      if (p === "/api/ads" && request.method === "POST")         return await router.createAd(env, request);
      if (p === "/api/upload" && request.method === "POST")      return await router.upload(env, request);
      let m = p.match(/^\/api\/ads\/([^/]+)$/);
      if (m && request.method === "GET")    return await router.getAd(env, request, m[1]);
      if (m && request.method === "DELETE") return await router.deleteAd(env, request, m[1]);

      if (p === "/api/chats" && request.method === "GET")  return await router.myChats(env, request);
      if (p === "/api/chats" && request.method === "POST") return await router.openChat(env, request);
      m = p.match(/^\/api\/chats\/(\d+)\/messages$/);
      if (m && request.method === "GET")  return await router.listMsgs(env, request, Number(m[1]), url);
      if (m && request.method === "POST") return await router.sendMsg(env, request, Number(m[1]));

      return err("آدرس پیدا نشد", 404);
    } catch (e) {
      return json({ ok: false, message: "خطای سرور: " + (e?.message || e) }, 500);
    }
  },
};

/*
  قرارداد API برای فرانت‌اند (مستند سریع):
  POST /api/auth/send      {phone:"09xx"}                      → {ok, devCode?}
  POST /api/auth/verify    {phone, code}                       → {ok, token, user}
  GET|PATCH /api/auth/me   (Bearer token)
  GET  /api/ads?city=&cat=&q=&limit=&offset=                   → {ok, items[], hasMore}
  GET  /api/ads?mine=1     (Bearer)                            → آگهی‌های خودم
  GET  /api/ads/:id                                            → {ok, ad}  (+view)
  POST /api/ads            (Bearer) {title,cat,city,...}       → {ok, ad}
  DELETE /api/ads/:id      (Bearer)                            → {ok}
  POST /api/upload         (Bearer, body=image bytes)          → {ok, url}
  GET  /api/chats          (Bearer)                            → {ok, items[]}
  POST /api/chats          (Bearer) {adId}                     → {ok, chatId}
  GET  /api/chats/:id/messages?after=ms  (Bearer)              → {ok, items[]}
  POST /api/chats/:id/messages (Bearer) {body}                 → {ok}
*/
