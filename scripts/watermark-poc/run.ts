// Demo/test harness for the invisible watermark scheme (scripts/watermark-poc/lib.ts)
// against a synthetic gradient frame. Run with: npx tsx scripts/watermark-poc/run.ts

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { encode, decode } from "./lib";

const OUT = path.join(__dirname, "out");
fs.mkdirSync(OUT, { recursive: true });

async function makeSyntheticFrame(filePath: string, width = 1280, height = 720) {
  // Low-frequency gradient with mild noise -- closer to a talking-head shot
  // or a slide than flat noise. Smooth regions are the HARDER case for
  // hiding a watermark (banding shows up more), so this is a fairer test.
  const channels = 3;
  const data = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = 150 + 40 * Math.sin(x / 480) + 15 * Math.sin(y / 260);
      const g = 130 + 35 * Math.sin((x + y) / 600) + 10 * Math.cos(y / 340);
      const b = 120 + 30 * Math.cos(x / 520) + 12 * Math.sin(y / 300);
      const noise = (Math.random() - 0.5) * 4;
      data[idx] = clamp(r + noise);
      data[idx + 1] = clamp(g + noise);
      data[idx + 2] = clamp(b + noise);
    }
  }
  await sharp(data, { raw: { width, height, channels } }).png().toFile(filePath);
}

function clamp(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

async function makeRevealed(basePath: string, encodedPath: string, outPath: string, amplify = 12) {
  const [base, enc] = await Promise.all([
    sharp(basePath).raw().toBuffer({ resolveWithObject: true }),
    sharp(encodedPath).raw().toBuffer({ resolveWithObject: true }),
  ]);
  const { width, height, channels } = enc.info;
  const out = Buffer.alloc(width * height * channels);
  for (let i = 0; i < out.length; i++) {
    const diff = enc.data[i] - base.data[i];
    out[i] = clamp(128 + diff * amplify);
  }
  await sharp(out, { raw: { width, height, channels } }).png().toFile(outPath);
}

async function main() {
  const basePath = path.join(OUT, "base-frame.png");
  await makeSyntheticFrame(basePath);
  console.log("Synthetic frame generated:", basePath);

  const payload = "wm:a91f7c2e"; // stand-in for a short per-viewer watermark id
  const deltas = [1, 2, 3, 4, 6, 8, 10, 14];

  for (const delta of deltas) {
    const pngPath = path.join(OUT, `encoded-delta${delta}.png`);
    const jpgPath = path.join(OUT, `encoded-delta${delta}.jpg`);
    const revealedPath = path.join(OUT, `revealed-delta${delta}.png`);

    const meta = await encode({ inputPath: basePath, outputPath: pngPath, payload, delta });
    await sharp(pngPath).jpeg({ quality: 85 }).toFile(jpgPath);
    await makeRevealed(basePath, pngPath, revealedPath);

    const decodedPng = await decode({ input: pngPath, expectedPeriod: meta.bitsEmbedded });
    const decodedJpg = await decode({ input: jpgPath, expectedPeriod: meta.bitsEmbedded });

    console.log(`\n--- delta=${delta} (${meta.totalCells} cells, ${meta.bitsEmbedded} payload bits tiled) ---`);
    console.log("PNG decode:", decodedPng.text === payload ? `OK -> "${decodedPng.text}"` : `FAILED (got "${decodedPng.text}")`);
    console.log("JPEG q85 decode:", decodedJpg.text === payload ? `OK -> "${decodedJpg.text}"` : `FAILED (got "${decodedJpg.text}")`);
  }

  // Robustness check: downscale+upscale to simulate a phone screen-recording
  // of a laptop screen (resampling), then decode.
  const delta = 8;
  const pngPath = path.join(OUT, `encoded-delta${delta}.png`);
  const resizedPath = path.join(OUT, `encoded-delta${delta}-screenrecorded-sim.jpg`);
  await sharp(pngPath).resize(800, 450).resize(1280, 720).jpeg({ quality: 80 }).toFile(resizedPath);
  const expectedPeriod = 16 + payload.length * 8;
  const decodedResized = await decode({ input: resizedPath, expectedPeriod });
  console.log(`\n--- delta=${delta}, downscale+upscale+JPEG80 (screen-recording simulation) ---`);
  console.log("Decode:", decodedResized.text === payload ? `OK -> "${decodedResized.text}"` : `FAILED (got "${decodedResized.text}")`);

  console.log("\nAll output images in:", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
