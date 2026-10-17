import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync } from "node:fs";

const SRC = "public/img";
const OUT = "src/assets";
mkdirSync(OUT, { recursive: true });

// hero portrait crop (from the frill pigeon close-up)
const HERO_SRC = `${SRC}/arabian-frill.jpg`;
const HERO_OUT = `${OUT}/hero-arabian.webp`;

const files = readdirSync(SRC).filter((f) => f.endsWith(".jpg"));
for (const f of files) {
  const out = `${OUT}/${f.replace(/\.jpg$/, ".webp")}`;
  await sharp(`${SRC}/${f}`)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out);
}

if (existsSync(HERO_SRC)) {
  const meta = await sharp(HERO_SRC).metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 800;
  // portrait crop focused on the bird (right-of-centre in the frame)
  const cw = Math.min(Math.round(h * 0.8), w);
  const left = Math.min(Math.max(Math.round(w * 0.52), 0), w - cw);
  await sharp(HERO_SRC)
    .extract({ left, top: 0, width: cw, height: h })
    .resize(780, 975, { fit: "cover" })
    .webp({ quality: 84 })
    .toFile(HERO_OUT);
}

console.log("assets ready:", readdirSync(OUT).length, "webp files");
