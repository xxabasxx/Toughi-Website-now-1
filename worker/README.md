# راه‌اندازی بک‌اند طوقی (۱۰ دقیقه، همه رایگان)

## پیش‌نیاز
1. اکانت Cloudflare (رایگان)
2. نصب wrangler:  `npm i -g wrangler`
3. ورود:  `npx wrangler login`  (مرورگر باز می‌شود)

## مراحل
```bash
cd worker

# ۱) ساخت دیتابیس
npx wrangler d1 create tooghi-db
# database_id خروجی را کپی کن و در wrangler.toml جایگزین PUT-YOUR-D1-ID-HERE کن

# ۲) اجرای مهاجرت (ساخت جدول‌ها)
npx wrangler d1 execute tooghi-db --file=migrations/0001_schema.sql

# ۳) تست محلی
npx wrangler dev
# سپس: curl http://localhost:8787/api/health  →  {"ok":true,...}

# ۴) دیپلوی
npx wrangler deploy
# خروجی: https://tooghi-api.<sub>.workers.dev
```

## وصل کردن فرانت‌اند به بک‌اند
آدرس خروجی بالا را در فایل `vite.config.ts` یا `src/config.ts` می‌گذاری (در کامیت بعدی کد فرانت می‌نویسم) — یا ساده‌تر: Pages و Worker را روی یک دامنه میزبانی می‌کنیم تا API آدرس نسبی `/api/...` بگیرد (بدون CORS).

## OTP واقعی (اختیاری — بعداً)
SANDBOX_MODE=1: کد همیشه 12345 و در پاسخ برگردانده می‌شود (تست).
SANDBOX_MODE=0 + کاوه‌نگار SMS_TOKEN + SMS_TEMPLATE → پیامک واقعی.

## سلامت API
`GET /api/health` → پاسخ {"ok":true,"service":"tooghi-api"}
