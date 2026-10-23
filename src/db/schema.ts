import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** کاربران — ورود با پیامک (OTP) */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

/** کدهای یکبارمصرف ورود */
export const otps = pgTable("otps", {
  phone: text("phone").primaryKey(),
  code: text("code").notNull(),
  expires: bigint("expires", { mode: "number" }).notNull(),
  tries: integer("tries").notNull().default(0),
});

/** نشست‌ها (توکن Bearer) */
export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userPhone: text("user_phone").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  expires: bigint("expires", { mode: "number" }).notNull(),
});

/** آگهی‌ها */
export const ads = pgTable(
  "ads",
  {
    id: text("id").primaryKey(),
    userPhone: text("user_phone").notNull(),
    title: text("title").notNull(),
    cat: text("cat").notNull(),
    breed: text("breed"),
    sex: text("sex"),
    age: text("age"),
    health: text("health"),
    delivery: text("delivery"),
    price: integer("price"),
    agreed: boolean("agreed").notNull().default(false),
    province: text("province"),
    city: text("city").notNull(),
    district: text("district"),
    description: text("description"),
    phone: text("phone"),
    seller: text("seller"),
    images: text("images").notNull().default("[]"),
    status: text("status").notNull().default("active"),
    views: integer("views").notNull().default(0),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (t) => [
    index("idx_ads_status").on(t.status, t.createdAt),
    index("idx_ads_city").on(t.city),
    index("idx_ads_cat").on(t.cat),
    index("idx_ads_user").on(t.userPhone),
  ],
);

/** گفتگوها (خریدار ↔ فروشنده) */
export const chats = pgTable(
  "chats",
  {
    id: serial("id").primaryKey(),
    adId: text("ad_id").notNull(),
    buyerPhone: text("buyer_phone").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (t) => [uniqueIndex("uq_chats_ad_buyer").on(t.adId, t.buyerPhone)],
);

/** پیام‌های گفتگو */
export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").notNull(),
    sender: text("sender").notNull(),
    body: text("body").notNull(),
    read: integer("read").notNull().default(0),
    at: bigint("at", { mode: "number" }).notNull(),
  },
  (t) => [index("idx_msgs").on(t.chatId, t.at)],
);

export type AdRow = typeof ads.$inferSelect;
export type UserRow = typeof users.$inferSelect;

/** DDL خام برای بوت‌استرپ خودکار (مثل ensureSchema ورکر اصلی) */
export const schemaDDL = sql.raw(`
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar TEXT,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS otps (
  phone TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires BIGINT NOT NULL,
  tries INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_phone TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  expires BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  user_phone TEXT NOT NULL,
  title TEXT NOT NULL,
  cat TEXT NOT NULL,
  breed TEXT,
  sex TEXT,
  age TEXT,
  health TEXT,
  delivery TEXT,
  price INTEGER,
  agreed BOOLEAN NOT NULL DEFAULT FALSE,
  province TEXT,
  city TEXT NOT NULL,
  district TEXT,
  description TEXT,
  phone TEXT,
  seller TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active',
  views INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  ad_id TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  UNIQUE(ad_id, buyer_phone)
);
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL,
  sender TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_city ON ads(city);
CREATE INDEX IF NOT EXISTS idx_ads_cat ON ads(cat);
CREATE INDEX IF NOT EXISTS idx_ads_user ON ads(user_phone);
CREATE INDEX IF NOT EXISTS idx_msgs ON messages(chat_id, at);
`);
