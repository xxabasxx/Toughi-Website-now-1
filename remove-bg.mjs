import { removeBackground } from "@imgly/background-removal-node";
import { readFileSync, writeFileSync } from "node:fs";

const [, , input, output, model = "isnet"] = process.argv;

const src = readFileSync(input);
const blob = new Blob([src], { type: "image/jpeg" });
const out = await removeBackground(blob, {
  model,
  output: { format: "image/png", quality: 0.92 },
});
const buf = Buffer.from(await out.arrayBuffer());
writeFileSync(output, buf);
console.log("saved", output, "model:", model, "—", buf.length, "bytes");
