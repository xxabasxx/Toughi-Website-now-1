# راهنمای رفع مشکل دیپلوی «طوقی» روی کلودفلر

این سند پاسخ مستقیم به این سؤال است: **چرا سایت بعد از افزودن کدهای «ثبت آگهی» و «ارسال کد» روی کلودفلر از کار افتاد؟**

---

## ۱) چرا خراب شد؟ (ردیابی دقیق)

قبل از آن کامیت‌ها، سایت فقط یک باندل استاتیک Vite بود و Pages بی‌مشکل سروش می‌کرد. دو فایل جدید عامل خرابی شدند:

### الف) `wrangler.toml` در ریشه ریپو (عامل اصلی)

```toml
[[d1_databases]]
binding = "DB"
database_id = "c98357e2-f004-4e32-a910-49062801795d"
```

- وقتی Pages از طریق **اتصال GitHub** دیپلوی می‌شود، کلودفلر این فایل را می‌خواند و سعی می‌کند bindingها را اعتبارسنجی کند.
- اگر `database_id` در **همان اکانت کلودفلرِ** پروژه Pages وجود نداشته باشد (ساخته نشده، در اکانت دیگری است، یا اشتباه کپی شده)، کل دیپلوی با خطای شبیه
  `Couldn't find a D1 database with the name or binding [DB]` **شکست می‌خورد** → سایت کلاً بالا نمی‌آید.
- در سناریوی دیگر، اگر binding ساخته شده ولی اسم/آیدی اشتباه باشد، سایت بالا می‌آید ولی **همه‌ی `/api/*` پاسخ ۵۰۰** می‌دهند (لاگین و ثبت آگهی همیشه خطا) → در ظاهر «سایت کار نمی‌کند».

### ب) نسخه‌ی Node محیط build کلودفلر

- `vite@7` و `@tailwindcss/vite@4` به **Node ≥ 20.19 یا ≥ 22.12** نیاز دارند.
- اگر متغیر `NODE_VERSION` را در تنظیمات Pages ست نکرده باشی، build با نسخه‌ی قدیمی‌تر اجرا و **شکست** می‌خورد.

### ج) `sharp` در اسکریپت build

`npm run build` اول `node prepare-assets.mjs` را اجرا می‌کند که به کتابخانه‌ی نیتیو `sharp` وابسته است. اگر نصب باینری آن در محیط CI کلودفلر شکست بخورد، build کلاً fail می‌شود. (اسکریپت برای دانلود عکس‌ها fallback دارد، ولی برای شکست `sharp` fallbackی نیست.)

### د) باگ نرم‌افزاری (مستقل از کلودفلر)

پاسخ API ورکر (`adRow`) فقط فیلدهای خام را برمی‌گرداند ولی کامپوننت‌ها شیء نرمال‌شده‌ی `Listing` با `img / time / district / desc / specs` انتظار دارند؛ یعنی آگهی‌های سرور با عکس خراب و زمان خالی نمایش داده می‌شدند. **در نسخه‌ی بازسازی‌شده‌ی این پروژه این باگ رفع شده** — پاسخ `/api/ads` دقیقاً همان شکلی است که UI می‌خواهد.

---

## ۲) راه‌حل برای ریپوی فعلی (Vite + Pages)، گام‌به‌گام

1. **ساخت D1 در همان اکانت:**
   ```bash
   npx wrangler login
   npx wrangler d1 create tooghi-db
   npx wrangler d1 list   # database_id درست را بردار
   ```
2. **بایند کردن D1 از داشبورد** (نه فایل):
   - Pages project → **Settings → Functions → D1 database bindings**
   - Variable name: `DB` → انتخاب دیتابیس `tooghi-db` → Save (برای Production و Preview هر دو)
3. **متغیرهای محیطی** (Settings → Environment variables):
   - `NODE_VERSION = 22`
   - `SANDBOX_MODE = 1` (حالت تست؛ کد ورود همیشه ۱۲۳۴۵)
   - برای پیامک واقعی: `SMS_TOKEN` (توکن کاوه‌نگار) → بهتر است Secret تعریف شود
4. **اصلاح `wrangler.toml` ریشه** — برای جریان Git-Pages فقط این را نگه دار:
   ```toml
   pages_build_output_dir = "dist"
   compatibility_date = "2025-01-01"
   ```
   بخش `[[d1_databases]]` و `name` را حذف کن (binding از داشبورد اعمال می‌شود).
5. **تنظیمات build در Pages:** Build command: `npm run build` — Output directory: `dist`
6. **Retry deployment** و بعد تست:
   - `https://<site>.pages.dev/api/health` باید `{"ok":true}` برگرداند.

> ترفند عیب‌یابی: Pages → Deployments → View details → **Logs**؛ خطای دقیق build/deploy آنجا دیده می‌شود.

### مسیر جایگزین — Workers با Static Assets (پایدارتر از Pages برای این معماری)

```toml
# wrangler.toml
name = "tooghi-site"
main = "worker/src/index.js"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"

[vars]
SANDBOX_MODE = "1"

[[d1_databases]]
binding = "DB"
database_name = "tooghi-db"
database_id = "<ID-درست-از-wrangler-d1-list>"
```

سپس: `npm run build && npx wrangler deploy` — در این حالت `functions/` لازم نیست چون خود ورکر مستقیماً سرو می‌شود.

---

## ۳) نسخه‌ی بازسازی‌شده در همین پروژه

سایت به‌صورت کامل با **Next.js 16 + PostgreSQL (Drizzle ORM)** بازنویسی شده و همان قرارداد API را دارد:

| مسیر | توضیح |
|---|---|
| `POST /api/auth/send` | ارسال کد (`SANDBOX_MODE=1` → کد `12345` و `devCode` در پاسخ) |
| `POST /api/auth/verify` | تایید کد و صدور توکن |
| `GET/PATCH /api/auth/me` | پروفایل |
| `GET/POST /api/ads` | لیست/ثبت آگهی |
| `GET/DELETE /api/ads/:id` | جزئیات/حذف |
| `GET/POST /api/chats` + `/api/chats/:id/messages` | چت و پیام |

- Frontend به‌صورت Client-Side رندر می‌شود و **بدون هیچ تغییری در تجربه‌ی کاربری** کار می‌کند.
- دیتابیس با `npx drizzle-kit push` ساخته می‌شود؛ علاوه بر آن، خودسرور هم جداول و داده‌های نمایشی را به‌صورت خودکار بوت‌استرپ می‌کند.

### راه دیپلوی این نسخه روی کلودفلر (Workers)

```bash
npm i -D @opennextjs/cloudflare wrangler
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

و به‌جای PostgreSQL می‌توانی همان helperهای `src/lib/api-server.ts` را با D1/Durable Objects یا Hyperdrive به Postgres وصل کنی.

---

## ۴) چک‌لیست نهایی

- [ ] `database_id` با خروجی `npx wrangler d1 list` در **همان اکانت** یکی است
- [ ] binding `DB` در داشبورد Pages ست شده (نه فقط در فایل)
- [ ] `NODE_VERSION = 22`
- [ ] `SANDBOX_MODE = 1` برای تست
- [ ] `/api/health` پاسخ `ok` می‌دهد
- [ ] لاگین با کد `۱۲۳۴۵` و ثبت یک آگهی تست شده
