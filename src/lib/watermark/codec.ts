// Invisible forensic watermark: blind, differential luminance encoding,
// shaped with a smooth 2D window instead of a flat rectangle so there are
// no hard block edges -- a flat-block version looked like a checkerboard
// specifically because of those edges, not because of the brightness change
// itself. (A blue-channel-only variant was tried and rejected: on a
// near-black scene, added blue is a saturated color popping out of black --
// more visible than an equal luminance push, not less. The "eye is less
// sensitive to blue" rule of thumb only holds against a colorful backdrop,
// not against black.) For each payload bit, a left/right pair of soft blobs
// gets pushed apart in brightness. Decoding only needs the mean brightness
// difference between the two halves of each cell, so no original/
// unwatermarked reference is needed -- that's what makes it usable against
// a leaked screenshot or screen-recording where we'll never have the
// "clean" frame to diff against.
//
// This file is server-only (imports `sharp`, a native binary) and operates
// on a whole image file/buffer. The live player instead paints the same
// pattern onto a canvas overlay in real time -- see paint-overlay.ts, which
// shares the bit-layout logic in shared.ts but not this file.

import sharp, { type Sharp } from "sharp";
import { CELL_W, CELL_H, BLOCK_W, SYNC, windowValue, bitsForPayload, bitsToString, matchesSync, isPrintable, pickDirection } from "./shared";

// Equal push across R/G/B (plain average brightness) -- matches what the
// encoder actually writes, so decode reads back exactly what was pushed.
function weightedValue(data: Buffer, width: number, channels: number, x: number, y: number) {
  const idx = (y * width + x) * channels;
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
}

// Human vision masks small brightness changes far better where the image
// already has texture/edges than in a flat, dark region -- a uniform delta
// is invisible on a busy shot and a visible pattern on a flat one. So delta
// is scaled per cell by local contrast: full strength where there's texture
// to hide in, faded toward `floorScale` on flat stretches. That trades some
// capacity in flat regions for invisibility everywhere; redundancy (many
// repeats of the same short payload) makes up the difference at decode time.
function localStdDev(data: Buffer, width: number, channels: number, x0: number, y0: number, w: number, h: number) {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const l = weightedValue(data, width, channels, x, y);
      sum += l;
      sumSq += l * l;
      n++;
    }
  }
  const mean = sum / n;
  return Math.sqrt(Math.max(0, sumSq / n - mean * mean));
}

// Headroom/direction is judged on the channel(s) actually being pushed, not
// some other perceptual metric -- clipping happens per channel.
function localMean(data: Buffer, width: number, channels: number, x0: number, y0: number, w: number, h: number) {
  let sum = 0;
  let n = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      sum += weightedValue(data, width, channels, x, y);
      n++;
    }
  }
  return sum / n;
}

export async function encode({
  inputPath,
  outputPath,
  payload,
  delta = 24,
  floorScale = 0.15,
  referenceStdDev = 8,
}: {
  inputPath: string;
  outputPath: string;
  payload: string;
  delta?: number;
  floorScale?: number;
  referenceStdDev?: number;
}) {
  const { data, info } = await sharp(inputPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const bits = bitsForPayload(payload);
  const cellsX = Math.floor(width / CELL_W);
  const cellsY = Math.floor(height / CELL_H);
  const totalCells = cellsX * cellsY;

  for (let cy = 0; cy < cellsY; cy++) {
    for (let cx = 0; cx < cellsX; cx++) {
      const cellIndex = cy * cellsX + cx;
      const bit = bits[cellIndex % bits.length];
      const x0 = cx * CELL_W;
      const y0 = cy * CELL_H;

      const std = localStdDev(data, width, channels, x0, y0, CELL_W, CELL_H);
      const scale = Math.max(floorScale, Math.min(1, std / referenceStdDev));
      const effectiveDelta = delta * scale;
      const cellMean = localMean(data, width, channels, x0, y0, CELL_W, CELL_H);
      const dir = pickDirection(cellMean);

      // bit=1 pushes the left half; bit=0 pushes the right half. The other
      // half is left untouched, so only one side of the pair ever moves.
      const pushLeft = bit === 1 ? dir * effectiveDelta : 0;
      const pushRight = bit === 0 ? dir * effectiveDelta : 0;

      for (let by = 0; by < CELL_H; by++) {
        const wy = windowValue(by, CELL_H);
        for (let bx = 0; bx < BLOCK_W; bx++) {
          const w = wy * windowValue(bx, BLOCK_W);
          if (pushLeft) applyDelta(data, width, channels, x0 + bx, y0 + by, pushLeft * w);
          if (pushRight) applyDelta(data, width, channels, x0 + BLOCK_W + bx, y0 + by, pushRight * w);
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .toFormat(outputPath.endsWith(".jpg") || outputPath.endsWith(".jpeg") ? "jpeg" : "png", { quality: 92 })
    .toFile(outputPath);

  return { width, height, cellsX, cellsY, totalCells, bitsEmbedded: bits.length };
}

function applyDelta(data: Buffer, width: number, channels: number, x: number, y: number, delta: number) {
  const idx = (y * width + x) * channels;
  for (let c = 0; c < 3; c++) {
    data[idx + c] = clamp(data[idx + c] + delta);
  }
}

function clamp(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

// Real screenshots are essentially never pixel-for-pixel the same size the
// overlay was painted at -- a screenshot tool, a screen recording's own
// encode step, an OS-level scaling quirk, or (in practice, the biggest
// factor) an admin's crop of the video out of a larger screenshot not
// landing on the exact video boundary all shift every cell boundary by a
// fraction of a pixel that compounds across the frame. A single degree of
// freedom (uniform scale) is cheap to search blindly, so decode tries a
// range of rescales before giving up. +/-8% covers the slop actually
// observed from a hand-cropped real screenshot in testing; going wider than
// that starts trading meaningful accuracy for runtime with little payoff.
const SCALE_SEARCH_RANGE = [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8]; // percent, tried in this order

export async function decode({
  input,
  expectedPeriod,
}: {
  input: string | Buffer;
  expectedPeriod?: number;
}): Promise<{ period: number | null; text: string | null }> {
  const base = sharp(input);
  const meta = await base.metadata();
  const width0 = meta.width ?? 0;
  const height0 = meta.height ?? 0;

  for (const pct of SCALE_SEARCH_RANGE) {
    const scale = 1 + pct / 100;
    const width = Math.round(width0 * scale);
    const height = Math.round(height0 * scale);
    if (width < CELL_W || height < CELL_H) continue;

    const scaled = pct === 0 ? base.clone() : sharp(input).resize(width, height);
    const hit = await decodeAtSize(scaled, expectedPeriod);
    if (hit.text) return hit;
  }
  return { period: null, text: null };
}

async function decodeAtSize(
  pipeline: Sharp,
  expectedPeriod?: number
): Promise<{ period: number | null; text: string | null }> {
  const { data, info } = await pipeline.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const cellsX = Math.floor(width / CELL_W);
  const cellsY = Math.floor(height / CELL_H);

  // For every cell position, compute left-mean minus right-mean, then flip
  // its sign back using the SAME dark/bright rule the encoder used to pick
  // its push direction -- that undoes the direction flip without either
  // side needing to share state. Subtracting each row's own mean diff on
  // top of that removes slow horizontal gradients (from actual video
  // content) that would otherwise bias every cell in that row the same way.
  const cellDiffs: number[] = [];
  for (let cy = 0; cy < cellsY; cy++) {
    const rowDiffs: number[] = [];
    for (let cx = 0; cx < cellsX; cx++) {
      const x0 = cx * CELL_W;
      const y0 = cy * CELL_H;
      let leftSum = 0;
      let rightSum = 0;
      for (let by = 0; by < CELL_H; by++) {
        for (let bx = 0; bx < BLOCK_W; bx++) {
          leftSum += weightedValue(data, width, channels, x0 + bx, y0 + by);
          rightSum += weightedValue(data, width, channels, x0 + BLOCK_W + bx, y0 + by);
        }
      }
      const cellMean = (leftSum + rightSum) / (CELL_W * CELL_H);
      const dir = pickDirection(cellMean);
      rowDiffs.push((leftSum - rightSum) * dir);
    }
    const rowMean = rowDiffs.reduce((a, b) => a + b, 0) / rowDiffs.length;
    for (const d of rowDiffs) cellDiffs.push(d - rowMean);
  }

  function tryPeriod(period: number): { period: number; text: string } | null {
    const votes = new Array(period).fill(0);
    for (let i = 0; i < cellDiffs.length; i++) {
      votes[i % period] += cellDiffs[i] > 0 ? 1 : -1;
    }
    const bits = votes.map((v) => (v > 0 ? 1 : 0));
    if (matchesSync(bits)) {
      const payloadBits = bits.slice(SYNC.length);
      const text = bitsToString(payloadBits).replace(/\0+$/, "");
      if (isPrintable(text)) return { period, text };
    }
    return null;
  }

  // A real checking engine always knows its own watermark scheme's payload
  // length (we chose it), so it checks that exact period first -- no need
  // to blind-guess. Falls back to a search when the length isn't known up
  // front (e.g. an admin uploading an arbitrary screenshot).
  if (expectedPeriod) {
    const hit = tryPeriod(expectedPeriod);
    if (hit) return hit;
  }
  for (let period = 24; period <= 4096; period++) {
    const hit = tryPeriod(period);
    if (hit) return hit;
  }
  return { period: null, text: null };
}

export { CELL_W, CELL_H };
