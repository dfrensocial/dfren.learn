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

import sharp from "sharp";
import { CELL_W, CELL_H, BLOCK_W, SYNC, windowValue, bitsForPayload, bitsToString, matchesSync, isPrintable, pickDirection, PATCH_FRACTION } from "./shared";

// Must match the encoder's PATCH_FRACTION exactly, not just be "close" or
// "a bit more generous" -- confirmed live, a larger analysis fraction broke
// decoding completely, even with zero scale/crop uncertainty (raw canvas
// pixels, no screenshot involved). The reason: a bigger centered crop has a
// different top-left corner than the true painted patch, and cells are
// counted from THAT corner -- so a "generous margin" doesn't add alignment
// tolerance, it just moves the assumed grid origin away from the real one,
// which our extremely tight per-cell tolerance (a few px out of a 16px
// cell) can't absorb. Any margin for box-detection imprecision has to come
// from elsewhere (the existing scale search, and small positional nudges),
// not from mismatching this fraction.
const ANALYSIS_FRACTION = PATCH_FRACTION;

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

  // Embed only within a centered PATCH_FRACTION patch, matching
  // paint-overlay.ts and what decode() now assumes -- see PATCH_FRACTION's
  // definition in shared.ts. decode() reads phase 0 of its cell grid
  // starting from the center-patch's own top-left corner, so encode() has to
  // start counting cells from that same corner, not the full frame's.
  const patchWidth = Math.round(width * PATCH_FRACTION);
  const patchHeight = Math.round(height * PATCH_FRACTION);
  const patchLeft = Math.round((width - patchWidth) / 2);
  const patchTop = Math.round((height - patchHeight) / 2);

  const bits = bitsForPayload(payload);
  const cellsX = Math.floor(patchWidth / CELL_W);
  const cellsY = Math.floor(patchHeight / CELL_H);
  const totalCells = cellsX * cellsY;

  for (let cy = 0; cy < cellsY; cy++) {
    for (let cx = 0; cx < cellsX; cx++) {
      const cellIndex = cy * cellsX + cx;
      const bit = bits[cellIndex % bits.length];
      const x0 = patchLeft + cx * CELL_W;
      const y0 = patchTop + cy * CELL_H;

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

// Computes the per-cell, direction-corrected, row-bias-subtracted diff
// array for a raw pixel buffer -- the one genuinely expensive step (a full
// pixel-level pass over the image). Returned as a flat row-major array so
// that trimming whole rows off the top/bottom afterward is just an array
// slice, not a recompute -- that's what makes searching many crop margins
// affordable: this runs once per (scale, left-trim, right-trim), and every
// top/bottom trim combination reuses its result for free.
function computeCellDiffs(data: Buffer, width: number, height: number, channels: number) {
  const cellsX = Math.floor(width / CELL_W);
  const cellsY = Math.floor(height / CELL_H);
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
  return { cellDiffs, cellsX, cellsY };
}

// Cheap: pure array voting over an already-computed cell-diff slice, no
// pixel access. Safe to call many times (once per top/bottom trim
// candidate) against the same underlying computeCellDiffs() result.
function voteBits(cellDiffs: number[], expectedPeriod?: number): { period: number; text: string } | null {
  function tryPeriod(period: number): { period: number; text: string } | null {
    if (cellDiffs.length < period) return null;
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

  // A blind 24-4096 period sweep is only for when the caller genuinely
  // doesn't know the payload length -- when expectedPeriod IS given (the
  // real caller always has one, see WATERMARK_EXPECTED_PERIOD), a miss on
  // it is a genuine miss, not a cue to blind-search. Falling through to the
  // sweep unconditionally here previously ran ~4000 extra vote passes on
  // every one of the thousands of scale/crop candidates tried elsewhere in
  // this file, turning what should be a sub-second check into minutes.
  if (expectedPeriod) {
    return tryPeriod(expectedPeriod);
  }
  for (let period = 24; period <= 4096; period++) {
    const hit = tryPeriod(period);
    if (hit) return hit;
  }
  return null;
}

// Builds a new compacted buffer with `leftCols` columns removed from the
// left and the result narrowed to `croppedWidth` -- an in-memory Buffer
// copy (cheap, no native resize/decode round-trip), unlike a row trim
// (top/bottom), which can be a single contiguous byte range since whole
// rows are stored contiguously; columns need per-row copying since each
// row's kept bytes aren't contiguous with the next row's.
function cropColumns(data: Buffer, width: number, height: number, channels: number, leftCols: number, croppedWidth: number) {
  const rowBytes = croppedWidth * channels;
  const out = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    data.copy(out, y * rowBytes, (y * width + leftCols) * channels, (y * width + leftCols + croppedWidth) * channels);
  }
  return out;
}

// Resizes an already-in-memory raw buffer (e.g. a column-cropped region)
// rather than re-reading from the original file/buffer -- used by the
// margin search, which crops BEFORE scaling (matching how a human -- or
// the manual crop tool -- naturally thinks about it: isolate the video
// first, then whatever resolution mismatch remains is comparatively small
// and jitter-sized). Scaling the whole image first and computing crop
// percentages of the already-scaled result is mathematically similar but
// not identical -- rounding at each stage compounds differently, which was
// enough to miss real crops that this order finds cleanly.
async function resizeRawBuffer(data: Buffer, width: number, height: number, channels: number, scale: number) {
  if (scale === 1) return { data, width, height, channels };
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  if (newWidth < CELL_W || newHeight < CELL_H) return null;
  const { data: out, info } = await sharp(data, { raw: { width, height, channels: channels as 1 | 2 | 3 | 4 } })
    .resize(newWidth, newHeight)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: out, width: info.width, height: info.height, channels: info.channels };
}

// Real screenshots are essentially never pixel-for-pixel the same size the
// overlay was painted at. Confirmed against real screenshots (not just
// synthetic tests):
//   1. Fine jitter from a capture tool's own resize/recompression step, or
//      an admin's hand-drawn crop not landing exactly on the video edge --
//      a few percent either way.
//   2. devicePixelRatio: the overlay is painted at CSS-pixel resolution
//      (see secure-video-player.tsx for why), but plenty of real
//      screenshot tools -- especially OS-level ones (Windows/macOS
//      screenshot, not a browser extension) -- capture at PHYSICAL pixel
//      resolution instead. On a 125% Windows display (a very common
//      default) that alone is a ~20% size mismatch, needing discrete,
//      physically-meaningful ratios (1/1.25, 1/1.5, 1/2, ...) rather than a
//      smooth percentage sweep, which would need hundreds of steps to hit
//      0.8000 exactly by accident.
// Cheap to search because the real caller (the /watermark checker) always
// knows the exact expected bit period for our own id format, so each
// candidate is one fast check, not a blind 24-4096 period sweep.
//
// A real fullscreen screenshot needed 0.81, not the exact 0.8 (1/1.25) --
// jitter was only applied around 1.0, not around each DPR ratio too. Fixed
// by jittering every base scale, not just 1.0 -- but 0.5% steps still
// weren't fine enough (confirmed live: still failed). The reason is scale
// tolerance shrinks with image width: a scale error compounds linearly with
// distance from the cell grid's origin, so the same percentage error drifts
// far more absolute pixels on a ~1920px-wide fullscreen capture than an
// ~850px windowed one. Empirically the tolerance for THIS image was
// somewhere inside a 2%-wide band but outside a 0.5%-wide one -- 0.1% steps
// give an order of magnitude more margin without the range needing to be
// any wider (the true value is always going to be close to a base scale;
// what changed is how precisely "close" has to be).
const JITTER_PCT = Array.from({ length: 41 }, (_, i) => Math.round((i - 20) * 0.1 * 10) / 10);
const COMMON_DPR = [1.1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3];
// Only the SHRINK direction (1/dpr) is physically well-motivated: a
// screenshot's physical-pixel resolution is always >= the CSS resolution
// the overlay was painted at (dpr >= 1), never smaller, so there's no real
// scenario needing the image grown by a full dpr factor -- and growing is
// the expensive direction (a 2x upscale is 4x the pixel area to process,
// 3x is 9x). One mild upscale base is kept for capture tools that
// downsample below CSS resolution (thumbnailing, some sharing pipelines);
// the large ones aren't worth the cost for a case that's rare in practice.
const BASE_SCALES = [1, ...COMMON_DPR.map((dpr) => 1 / dpr), 1.1];
function withJitter(bases: number[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const base of bases) {
    for (const pct of JITTER_PCT) {
      const scale = Math.round(base * (1 + pct / 100) * 10000) / 10000;
      if (!seen.has(scale)) {
        seen.add(scale);
        out.push(scale);
      }
    }
  }
  return out;
}
const SCALE_CANDIDATES = withJitter(BASE_SCALES);

// A crop that's off by even a handful of pixels breaks decoding completely
// -- measured directly: shifting a known-good crop's left edge by +/-4px
// (out of a 16px cell) was enough to go from a clean decode to zero signal,
// because every cell boundary in the image shifts with it, not just the
// one at the edge. That rules out a blind percentage-based margin search
// (an earlier version of this function did exactly that, and it doesn't
// work: the odds of a percentage step landing within a few pixels of the
// true edge on a full-size screenshot are tiny). What actually works:
// detect the video's real boundary from the image content itself, the same
// way a person would eyeball it -- the video is virtually always a
// visually distinct rectangle against whatever page chrome surrounds it
// (this app's course videos are dark against a light page, which is also
// the common case generally). detectContentBox finds that by thresholding
// row/column brightness and taking the largest contiguous dark run --
// confirmed to land exactly pixel-perfect on a real failing screenshot.
function rowMean(data: Buffer, width: number, channels: number, y: number) {
  let sum = 0;
  for (let x = 0; x < width; x++) sum += weightedValue(data, width, channels, x, y);
  return sum / width;
}
function colMean(data: Buffer, width: number, height: number, channels: number, x: number) {
  let sum = 0;
  for (let y = 0; y < height; y++) sum += weightedValue(data, width, channels, x, y);
  return sum / height;
}
function largestDarkRun(means: number[], thresh: number) {
  let bestStart = 0;
  let bestLen = 0;
  let curStart = -1;
  for (let i = 0; i < means.length; i++) {
    if (means[i] < thresh) {
      if (curStart === -1) curStart = i;
      if (i - curStart + 1 > bestLen) {
        bestLen = i - curStart + 1;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
    }
  }
  return { start: bestStart, len: bestLen };
}

function detectContentBox(data: Buffer, width: number, height: number, channels: number) {
  const rowMeans = Array.from({ length: height }, (_, y) => rowMean(data, width, channels, y));
  const colMeans = Array.from({ length: width }, (_, x) => colMean(data, width, height, channels, x));
  const rowThresh = (Math.min(...rowMeans) + Math.max(...rowMeans)) / 2;
  const colThresh = (Math.min(...colMeans) + Math.max(...colMeans)) / 2;
  const rowRun = largestDarkRun(rowMeans, rowThresh);
  const colRun = largestDarkRun(colMeans, colThresh);
  // Reject degenerate detections (near-uniform image, or a "box" that's
  // almost the whole frame -- not worth treating differently from no crop).
  if (rowRun.len < height * 0.3 || colRun.len < width * 0.3) return null;
  if (rowRun.len > height * 0.98 && colRun.len > width * 0.98) return null;
  return { left: colRun.start, top: rowRun.start, width: colRun.len, height: rowRun.len };
}

// A handful of small whole-box pixel nudges around the detected boundary,
// tried together with the scale list -- detection landed pixel-perfect on
// the one real screenshot this was tested against, but anti-aliasing or a
// softer content edge on other images could plausibly shift it by a couple
// of pixels, and the tolerance for that is very narrow (see above).
const BOX_NUDGES = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [2, 0],
  [-2, 0],
  [0, 2],
  [0, -2],
  [3, 0],
  [-3, 0],
  [0, 3],
  [0, -3],
  [4, 0],
  [-4, 0],
  [0, 4],
  [0, -4],
];
// Small width/height corrections tried on top of BOX_NUDGES -- see the
// comment where these are used. Kept short (a handful of values) since these
// combine with the whole scale-candidate list on every attempt.
const SIZE_NUDGES = [
  [0, 4],
  [0, -4],
  [0, 8],
  [0, -8],
  [4, 0],
  [-4, 0],
];
const MIN_CELL_ROWS = 8;
const MIN_CELL_COLS = 8;

export async function decode({
  input,
  expectedPeriod,
  isValidCandidate,
}: {
  input: string | Buffer;
  expectedPeriod?: number;
  // The 16-bit sync marker alone has roughly a 1 in 65536 chance of
  // matching pure noise -- negligible for a single attempt, but the scale
  // search alone now tries ~100+ candidates (needed after a real fullscreen
  // screenshot required a scale outside the old jitter band), which makes a
  // spurious match a real, observed risk (confirmed live: got back a
  // plausible-looking id that didn't correspond to any issued watermark).
  // When given, a hit is only accepted once this confirms it's real (e.g.
  // exists in the watermarks collection) -- otherwise the search keeps
  // going past it instead of returning the first thing that merely looks
  // like a valid bit pattern.
  isValidCandidate?: (text: string) => Promise<boolean>;
}): Promise<{ period: number | null; text: string | null }> {
  async function accept(hit: { period: number; text: string } | null) {
    if (!hit) return null;
    if (isValidCandidate && !(await isValidCandidate(hit.text))) return null;
    return hit;
  }

  // `assumedWidth`/`assumedHeight` default to the buffer's own size, but can
  // be given larger: a content-detected box can come up short on one edge
  // (its bottom few rows genuinely cropped away, or just under-detected)
  // while the patch itself -- comfortably inset by PATCH_FRACTION's margin --
  // never touches those missing rows at all. Computing the patch's position
  // from the box's TRUE total size while only ever reading pixels that
  // actually exist recovers exactly that case, which growing the crop itself
  // can't: there's nothing to grow into if those rows were really cropped
  // off the source image, but the math doesn't need them to be there.
  async function searchScales(
    data: Buffer,
    width: number,
    height: number,
    channels: number,
    assumedWidth = width,
    assumedHeight = height
  ) {
    // The watermark is only ever painted within a centered PATCH_FRACTION
    // patch (see paint-overlay.ts), so analyzing anything wider than that
    // just dilutes the vote with unwatermarked border pixels. ANALYSIS_FRACTION
    // must equal PATCH_FRACTION exactly -- a larger fraction here doesn't add
    // tolerance for an imprecise box, it moves the assumed grid origin away
    // from the real one (a bigger centered crop has a different top-left
    // corner), which breaks alignment outright. Tolerance for an imprecise
    // box comes from BOX_NUDGES/SIZE_NUDGES and the scale search instead.
    const patchW = Math.round(assumedWidth * ANALYSIS_FRACTION);
    const patchH = Math.round(assumedHeight * ANALYSIS_FRACTION);
    if (Math.floor(patchW / CELL_W) < MIN_CELL_COLS || Math.floor(patchH / CELL_H) < MIN_CELL_ROWS) return null;
    const left = Math.round((assumedWidth - patchW) / 2);
    const top = Math.round((assumedHeight - patchH) / 2);
    // The patch must fall entirely within pixels we actually have -- if the
    // assumed size is larger than the real buffer, an off-center patch could
    // still land outside it even though it's inset from the assumed edges.
    if (left < 0 || top < 0 || left + patchW > width || top + patchH > height) return null;
    const colCropped = cropColumns(data, width, height, channels, left, patchW);
    const rowBytes = patchW * channels;
    const patch = colCropped.subarray(top * rowBytes, (top + patchH) * rowBytes);

    for (const scale of SCALE_CANDIDATES) {
      const resized = await resizeRawBuffer(patch, patchW, patchH, channels, scale);
      if (!resized) continue;
      const { cellDiffs } = computeCellDiffs(resized.data, resized.width, resized.height, resized.channels);
      const hit = await accept(voteBits(cellDiffs, expectedPeriod));
      if (hit) return hit;
    }
    return null;
  }

  // Cheap pass first: treat the image as given as the video box (handles an
  // already-tight crop, an already-fullscreen capture, or a screenshot
  // that's essentially just the video) and analyze its center.
  const { data: fullData, info: fullInfo } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: fullWidth, height: fullHeight, channels } = fullInfo;

  const direct = await searchScales(fullData, fullWidth, fullHeight, channels);
  if (direct) return direct;

  // Fallback: detect the video's boundary from the image content (see
  // detectContentBox) in case there's significant surrounding page chrome,
  // then analyze the center of THAT box instead of the whole image. A
  // handful of pixel nudges around the detected boundary cover detection
  // being slightly off; unlike the pre-patch version of this search, exact
  // pixel precision here is a safety margin, not a requirement, since the
  // center of a roughly-right box still comfortably contains the patch.
  // The manual crop tool on the /watermark page covers cases detection
  // can't (e.g. the video isn't the visually darkest rectangle in the shot).
  const box = detectContentBox(fullData, fullWidth, fullHeight, channels);
  if (!box) return { period: null, text: null };

  // `assumedWidth`/`assumedHeight` (defaulting to the crop's own size) let a
  // SIZE_NUDGE ask searchScales to center against a bigger hypothetical box
  // than what's physically available at `left`/`top` -- see searchScales's
  // comment for why that's the right fix for a box that came up short on one
  // edge. Only the pixels that actually exist (clamped to the source image)
  // are ever read; the assumed size only feeds the centering math.
  async function tryBox(left: number, top: number, croppedWidth: number, croppedHeight: number, assumedWidth = croppedWidth, assumedHeight = croppedHeight) {
    if (left < 0 || top < 0 || croppedWidth <= 0 || croppedHeight <= 0) return null;
    if (left + croppedWidth > fullWidth || top + croppedHeight > fullHeight) return null;
    const colCropped = cropColumns(fullData, fullWidth, fullHeight, channels, left, croppedWidth);
    const rowBytes = croppedWidth * channels;
    const boxData = colCropped.subarray(top * rowBytes, (top + croppedHeight) * rowBytes);
    return searchScales(boxData, croppedWidth, croppedHeight, channels, assumedWidth, assumedHeight);
  }

  if (process.env.WM_DEBUG) console.log("box:", box);
  for (const [dx, dy] of BOX_NUDGES) {
    const hit = await tryBox(box.left + dx, box.top + dy, box.width, box.height);
    if (hit) return hit;
  }

  // Position nudges alone can't fix a box whose detected WIDTH/HEIGHT itself
  // is off (not just shifted) -- a wrong total height throws off the
  // half-way centering math even when the box's own top edge was measured
  // correctly. SIZE_NUDGES covers that by centering against a slightly
  // bigger/smaller assumed box while still only reading pixels available at
  // the detected top-left -- a positive nudge doesn't require extra rows to
  // physically exist, since the patch stays well inside PATCH_FRACTION's
  // margin either way (searchScales rejects it if that's ever not true).
  for (const [dw, dh] of SIZE_NUDGES) {
    const assumedWidth = box.width + dw;
    const assumedHeight = box.height + dh;
    const availWidth = Math.min(box.width, fullWidth - box.left);
    const availHeight = Math.min(box.height, fullHeight - box.top);
    const hit = await tryBox(box.left, box.top, availWidth, availHeight, assumedWidth, assumedHeight);
    if (hit) return hit;
  }
  if (process.env.WM_DEBUG) console.log("no hit for any box/size/scale combination");
  return { period: null, text: null };
}

export { CELL_W, CELL_H };
