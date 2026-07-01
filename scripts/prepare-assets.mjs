import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = "D:\\함께하는개발\\동영상이미지자료\\이미지";
const outputDir = path.resolve("public/assets/site-images");

const images = [
  ["00.png", "field-hero-01.webp"],
  ["01.png", "field-hero-02.webp"],
  ["02.png", "field-hero-03.webp"],
  ["03.png", "field-hero-04.webp"],
  ["04.png", "field-slide-01.webp"],
  ["05.png", "field-slide-02.webp"],
  ["20250304_135932.jpg", "field-slide-03.webp"],
  ["20250304_140031.jpg", "field-slide-04.webp"],
  ["20250304_140612.jpg", "field-card-01.webp"],
  ["20250304_142019.jpg", "field-card-02.webp"],
];

await fs.mkdir(outputDir, { recursive: true });

for (const [sourceName, outputName] of images) {
  const sourcePath = path.join(sourceDir, sourceName);
  const outputPath = path.join(outputDir, outputName);
  await sharp(sourcePath)
    .rotate()
    .resize({
      width: outputName.includes("card") ? 1400 : 1920,
      height: outputName.includes("card") ? 1050 : 1080,
      fit: "cover",
      position: "center",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(outputPath);
  console.log(`wrote ${outputPath}`);
}
