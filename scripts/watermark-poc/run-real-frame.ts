// Demo/test harness for the invisible watermark scheme against a real
// captured course-video frame (the hardest case: a near-black background).
// Run with: npx tsx scripts/watermark-poc/run-real-frame.ts
// Expects scripts/watermark-poc/real-frame-cropped.png to exist locally
// (a screenshot of the actual player, cropped clear of any browser chrome
// border artifacts) -- not committed, see .gitignore.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { encode, decode } from "./lib";

const OUT = path.join(__dirname, "out-real");
fs.mkdirSync(OUT, { recursive: true });
const basePath = path.join(__dirname, "real-frame-cropped.png");

function clamp(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

async function makeRevealed(basePath: string, encodedPath: string, outPath: string, amplify = 12) {
  const [base, enc] = await Promise.all([
    sharp(basePath).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(encodedPath).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
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
  const payload = "a91f7c"; // short id -> looked up server-side to the viewer, not the email itself
  const deltas = [4, 8, 12, 16, 20, 24];

  for (const delta of deltas) {
    const pngPath = path.join(OUT, `encoded-delta${delta}.png`);
    const jpgPath = path.join(OUT, `encoded-delta${delta}.jpg`);
    const revealedPath = path.join(OUT, `revealed-delta${delta}.png`);

    const meta = await encode({ inputPath: basePath, outputPath: pngPath, payload, delta });
    await sharp(pngPath).jpeg({ quality: 85 }).toFile(jpgPath);
    await makeRevealed(basePath, pngPath, revealedPath);

    const expectedPeriod = 16 + payload.length * 8;
    const decodedPng = await decode({ input: pngPath, expectedPeriod });
    const decodedJpg = await decode({ input: jpgPath, expectedPeriod });

    console.log(`\n--- delta=${delta} (${meta.totalCells} cells) ---`);
    console.log("PNG decode:", decodedPng.text === payload ? `OK -> "${decodedPng.text}"` : `FAILED (got "${decodedPng.text}")`);
    console.log("JPEG q85 decode:", decodedJpg.text === payload ? `OK -> "${decodedJpg.text}"` : `FAILED (got "${decodedJpg.text}")`);
  }

  // Robustness check: downscale+upscale+JPEG to simulate a phone recording
  // a laptop screen.
  const finalDelta = 24;
  const finalPng = path.join(OUT, `encoded-delta${finalDelta}.png`);
  const screenRecPath = path.join(OUT, `encoded-delta${finalDelta}-screenrec-sim.jpg`);
  const meta = await sharp(finalPng).metadata();
  await sharp(finalPng)
    .resize(Math.round((meta.width ?? 1050) * 0.65), Math.round((meta.height ?? 573) * 0.65))
    .resize(meta.width, meta.height)
    .jpeg({ quality: 78 })
    .toFile(screenRecPath);
  const expectedPeriod = 16 + payload.length * 8;
  const decodedScreenRec = await decode({ input: screenRecPath, expectedPeriod });
  console.log(`\n--- delta=${finalDelta}, downscale 65%+upscale+JPEG78 (screen-recording simulation) ---`);
  console.log("Decode:", decodedScreenRec.text === payload ? `OK -> "${decodedScreenRec.text}"` : `FAILED (got "${decodedScreenRec.text}")`);

  console.log("\nAll output images in:", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
