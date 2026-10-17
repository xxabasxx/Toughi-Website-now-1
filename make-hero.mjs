import sharp from "sharp";

const src = "pick/c2.jpg";
const W = 1280;
const H = 1600; // 4:5 portrait

const variants = [
  { left: 850, out: "pick/v1.webp" },
  { left: 620, out: "pick/v2.webp" },
];

for (const v of variants) {
  await sharp(src)
    .extract({ left: v.left, top: 0, width: W, height: H })
    .resize(780, 975)
    .webp({ quality: 82 })
    .toFile(v.out);
  console.log("made", v.out);
}
