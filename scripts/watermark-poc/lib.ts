// Invisible forensic watermark: blind, differential luminance encoding.
// For each payload bit, a small left/right pair of blocks gets pushed apart
// in brightness. Decoding only needs the mean brightness difference between
// the two halves of each cell, so no original/unwatermarked reference is
// needed -- that's what makes it usable against a leaked screen-recording
// where we'll never have the "clean" frame to diff against.

import sharp from "sharp";

const CELL_W = 32; // one bit cell = two 16x16 blocks side by side
const CELL_H = 16;
const BLOCK_W = CELL_W / 2;

function stringToBits(str: string): number[] {
  const bits: number[] = [];
  for (const ch of Buffer.from(str, "utf8")) {
    for (let i = 7; i >= 0; i--) bits.push((ch >> i) & 1);
  }
  return bits;
}

function bitsToString(bits: number[]): string {
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
    bytes.push(byte);
  }
  return Buffer.from(bytes).toString("utf8");
}

// Wraps payload with a fixed 16-bit sync marker so the decoder can find
// bit-alignment even if it doesn't know the payload length in advance.
const SYNC = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0];

// Human vision masks small brightness changes far better where the image
// already has texture/edges than in a flat, dark region -- a uniform delta
// is invisible on a busy shot and a visible checkerboard on a flat one (this
// is exactly what a real course frame showed). So delta is scaled per cell
// by local contrast: full strength where there's texture to hide in, faded
// toward `floorScale` on flat stretches. That trades some capacity in flat
// regions for invisibility everywhere; redundancy (many repeats of the same
// short payload) makes up the difference at decode time.
function localStdDev(data: Buffer, width: number, channels: number, x0: number, y0: number, w: number, h: number) {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const l = luminance(data, width, channels, x, y);
      sum += l;
      sumSq += l * l;
      n++;
    }
  }
  const mean = sum / n;
  return Math.sqrt(Math.max(0, sumSq / n - mean * mean));
}

function localMean(data: Buffer, width: number, channels: number, x0: number, y0: number, w: number, h: number) {
  let sum = 0;
  let n = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      sum += luminance(data, width, channels, x, y);
      n++;
    }
  }
  return sum / n;
}

// A dark scene (or a bright one) breaks the naive "+delta / -delta" push:
// on a near-black frame the "-delta" side just clips to 0, silently erasing
// half of every bit's signal. Fix: each cell only pushes ONE of its two
// halves, always in whichever direction has headroom (brighter if the cell
// is dark, darker if it's bright) -- never both directions on content that
// can't take it. The decoder recovers the sign by independently checking
// which regime the cell is in, so it doesn't need to be told.
function pickDirection(cellMean: number) {
  return cellMean < 128 ? 1 : -1;
}

export async function encode({
  inputPath,
  outputPath,
  payload,
  delta = 8,
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

  const bits = [...SYNC, ...stringToBits(payload)];
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
        for (let bx = 0; bx < BLOCK_W; bx++) {
          if (pushLeft) applyDelta(data, width, channels, x0 + bx, y0 + by, pushLeft);
          if (pushRight) applyDelta(data, width, channels, x0 + BLOCK_W + bx, y0 + by, pushRight);
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

export async function decode({ inputPath, expectedPeriod }: { inputPath: string; expectedPeriod?: number }) {
  const { data, info } = await sharp(inputPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
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
          leftSum += luminance(data, width, channels, x0 + bx, y0 + by);
          rightSum += luminance(data, width, channels, x0 + BLOCK_W + bx, y0 + by);
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
  // to blind-guess. Falls back to a search only for this demo's convenience.
  if (expectedPeriod) {
    const hit = tryPeriod(expectedPeriod);
    if (hit) return hit;
  }
  for (let period = 24; period <= 4096; period++) {
    const hit = tryPeriod(period);
    if (hit) return hit;
  }
  return { period: null as number | null, text: null as string | null };
}

function matchesSync(bits: number[]) {
  for (let i = 0; i < SYNC.length; i++) if (bits[i] !== SYNC[i]) return false;
  return true;
}

function isPrintable(str: string) {
  return str.length > 0 && [...str].every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127);
}

function luminance(data: Buffer, width: number, channels: number, x: number, y: number) {
  const idx = (y * width + x) * channels;
  return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
}

export { CELL_W, CELL_H };
