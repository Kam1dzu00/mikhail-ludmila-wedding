import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const originalsDir = path.join(root, "src/assets/images/originals");
const processedDir = path.join(root, "src/assets/images/processed");
const heroDir = path.join(root, "src/assets/images/hero");
const galleryDir = path.join(root, "src/assets/images/gallery");
const backgroundDir = path.join(root, "src/assets/images/backgrounds");
const thumbnailDir = path.join(root, "src/assets/images/thumbnails");
const publicDir = path.join(root, "public/images");

const recipes = [
  {
    input: "favorite-mirror.jpg",
    outputs: [
      { dir: heroDir, publicName: "favorite-mirror-hero", width: 1080, height: 1350, fit: "cover", position: "center" },
      { dir: galleryDir, publicName: "favorite-mirror-gallery", width: 1200, height: 1500, fit: "cover", position: "center" },
      { dir: thumbnailDir, publicName: "favorite-mirror-thumb", width: 420, height: 520, fit: "cover", position: "center" },
    ],
  },
  {
    input: "crimea-sea-couple.jpg",
    outputs: [
      { dir: galleryDir, publicName: "crimea-sea-couple-gallery", width: 1300, height: 1600, fit: "cover", position: "center" },
      { dir: backgroundDir, publicName: "crimea-sea-couple-bg", width: 1920, height: 1080, fit: "cover", position: "center" },
      { dir: thumbnailDir, publicName: "crimea-sea-couple-thumb", width: 420, height: 520, fit: "cover", position: "center" },
    ],
  },
  {
    input: "crimea-horizon.jpg",
    outputs: [
      { dir: backgroundDir, publicName: "crimea-horizon-bg", width: 1920, height: 1280, fit: "cover", position: "center" },
      { dir: galleryDir, publicName: "crimea-horizon-gallery", width: 1400, height: 875, fit: "cover", position: "center" },
      { dir: thumbnailDir, publicName: "crimea-horizon-thumb", width: 480, height: 300, fit: "cover", position: "center" },
    ],
  },
];

await Promise.all([processedDir, heroDir, galleryDir, backgroundDir, thumbnailDir, publicDir].map((dir) => fs.mkdir(dir, { recursive: true })));

for (const recipe of recipes) {
  const source = path.join(originalsDir, recipe.input);
  for (const output of recipe.outputs) {
    const base = sharp(source)
      .rotate()
      .resize({
        width: output.width,
        height: output.height,
        fit: output.fit,
        position: output.position,
        withoutEnlargement: true,
      })
      .modulate({ saturation: 0.94, brightness: 1.02 })
      .linear(1.04, -2)
      .sharpen({ sigma: 0.6, m1: 0.35 })
      .withMetadata({ orientation: undefined });

    const webp = `${output.publicName}.webp`;
    const jpg = `${output.publicName}.jpg`;
    await base.clone().webp({ quality: 82 }).toFile(path.join(output.dir, webp));
    await base.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(output.dir, jpg));
    await fs.copyFile(path.join(output.dir, webp), path.join(publicDir, webp));
    await fs.copyFile(path.join(output.dir, jpg), path.join(publicDir, jpg));

    try {
      const avif = `${output.publicName}.avif`;
      await base.clone().avif({ quality: 55 }).toFile(path.join(output.dir, avif));
      await fs.copyFile(path.join(output.dir, avif), path.join(publicDir, avif));
    } catch {
      // AVIF support depends on the local Sharp build; WebP and JPEG are always emitted.
    }
  }
}

console.log("Images prepared for the wedding invitation.");
