-- کاربران
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  phone      TEXT NOT NULL UNIQUE,
  name       TEXT,
  avatar     TEXT,
  created_at INTEGER NOT NULL
);
-- کدهای پیامکی
CREATE TABLE IF NOT EXISTS otps (
  phone   TEXT PRIMARY KEY,
  code    TEXT NOT NULL,
  expires INTEGER NOT NULL,
  tries   INTEGER NOT NULL DEFAULT 0
);
-- نشست‌ها (توکن ورود)
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_phone TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires    INTEGER NOT NULL
);
-- آگهی‌ها
CREATE TABLE IF NOT EXISTS ads (
  id         TEXT PRIMARY KEY,
  user_phone TEXT NOT NULL,
  title      TEXT NOT NULL,
  cat        TEXT NOT NULL,
  breed      TEXT, sex TEXT, age TEXT, health TEXT, delivery TEXT,
  price      INTEGER,
  agreed     INTEGER NOT NULL DEFAULT 0,
  province   TEXT, city TEXT NOT NULL, district TEXT,
  description TEXT,
  phone      TEXT, seller TEXT,
  images     TEXT NOT NULL DEFAULT '[]',
  status     TEXT NOT NULL DEFAULT 'active',
  views      INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_city    ON ads(city);
CREATE INDEX IF NOT EXISTS idx_ads_cat     ON ads(cat);
CREATE INDEX IF NOT EXISTS idx_ads_user    ON ads(user_phone);
-- چت‌ها
CREATE TABLE IF NOT EXISTS chats (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id       TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  UNIQUE(ad_id, buyer_phone)
);
CREATE TABLE IF NOT EXISTS messages (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id  INTEGER NOT NULL REFERENCES chats(id),
  sender   TEXT NOT NULL,
  body     TEXT NOT NULL,
  read     INTEGER NOT NULL DEFAULT 0,
  at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_msgs ON messages(chat_id, at);
