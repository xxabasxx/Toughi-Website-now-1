/**
 * Cloudflare / CI-ready asset preparation.
 * Runs automatically before `vite build` and is fully idempotent:
 *  1. makes sure the two Pexels photos exist locally (downloads if missing, falls back safely)
 *  2. converts every jpg in public/img -> optimized webp in src/assets
 * Then `vite build` (vite-plugin-singlefile) inlines everything into one html.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SRC = "public/img";
const OUT = "src/assets";
mkdirSync(SRC, { recursive: true });
mkdirSync(OUT, { recursive: true });

const DOWNLOADS = {
  "arabian-frill.jpg":
    "https://images.pexels.com/photos/18065245/pexels-photo-18065245.jpeg?auto=compress&cs=tinysrgb&w=2000",
  "arabian-hero.jpg":
    "https://images.pexels.com/photos/30831251/pexels-photo-30831251.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

for (const [name, url] of Object.entries(DOWNLOADS)) {
  const target = `${SRC}/${name}`;
  if (existsSync(target)) continue;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    console.log("downloaded:", name);
  } catch (err) {
    console.log("download failed → fallback image for", name, `(${err.message ?? err})`);
    copyFileSync(`${SRC}/hero-pigeon.jpg`, target);
  }
}

const jpgs = readdirSync(SRC).filter((f) => f.endsWith(".jpg"));
for (const f of jpgs) {
  await sharp(`${SRC}/${f}`)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`${OUT}/${f.replace(/\.jpg$/, ".webp")}`);
}

console.log(`assets ready: ${readdirSync(OUT).length} webp files`);
