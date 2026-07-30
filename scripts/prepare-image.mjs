import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const finalDir = path.join(root, "src/assets/images/final");
const publicImages = path.join(root, "public/images");
const source = path.join(finalDir, "couple-main-retouched.png");

await fs.mkdir(publicImages, { recursive: true });

const base = sharp(source)
  .rotate()
  .resize({
    width: 1400,
    height: 1750,
    fit: "cover",
    position: "center",
    withoutEnlargement: false,
  })
  .modulate({ saturation: 0.96, brightness: 1.01 })
  .linear(1.02, -1)
  .sharpen({ sigma: 0.45, m1: 0.25 });

await base.clone().webp({ quality: 84 }).toFile(path.join(finalDir, "couple-main-final.webp"));
await base.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(finalDir, "couple-main-final.jpg"));
await fs.copyFile(path.join(finalDir, "couple-main-final.webp"), path.join(publicImages, "couple-main-final.webp"));
await fs.copyFile(path.join(finalDir, "couple-main-final.jpg"), path.join(publicImages, "couple-main-final.jpg"));

await sharp(path.join(finalDir, "couple-main-final.jpg"))
  .resize(1200, 630, { fit: "cover", position: "center" })
  .composite([
    {
      input: Buffer.from(`
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="rgba(248,244,237,0.72)"/>
          <rect x="48" y="48" width="1104" height="534" rx="22" fill="rgba(255,255,255,0.22)" stroke="rgba(37,42,43,0.22)"/>
          <text x="76" y="166" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#252a2b">Михаил и Людмила</text>
          <text x="76" y="254" font-family="Georgia, serif" font-size="76" font-weight="700" fill="#252a2b">Мы решили пожениться.</text>
          <text x="80" y="322" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#8f5b3f">Да, добровольно.</text>
        </svg>
      `),
      blend: "over",
    },
  ])
  .png()
  .toFile(path.join(root, "public/og.png"));

console.log("Main couple photo prepared.");
