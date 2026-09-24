// Browser-safe: paints the SAME bit pattern the server-side codec (codec.ts)
// can decode, but via alpha-composited pixels on a transparent overlay
// canvas layered over the video instead of destructively editing a video
// file. Whatever the browser composites on screen -- overlay canvas + video
// underneath -- is what a screenshot or screen-recording captures, and
// decode() in codec.ts reads pixels directly with no idea (or need to know)
// whether the brightness pattern came from file editing or a live overlay.
//
// Simplification vs. the file codec: this always brightens (never
// darkens). The file codec picks per-cell direction by sampling the actual
// frame's local brightness to dodge clipping on near-black/near-white
// content, which needs pixel-level read access to the video. Reading a
// live <video> element's pixels via canvas requires it to not be
// CORS-tainted, which depends on Mux's CORS headers for signed playback --
// not verified yet. A constant brighten-only push is simpler and, per the
// earlier real-frame testing, still stays subtle at a moderate delta; it
// just doesn't get the extra invisibility the adaptive version has on very
// bright scenes. Revisit with frame sampling once CORS is confirmed.
import { CELL_W, CELL_H, BLOCK_W, windowValue, bitsForPayload, PATCH_FRACTION } from "./shared";

// The watermark lives only in a centered patch, not the whole frame --
// two independent reasons landed on the same fix. (1) User requirement: a
// recording that crops out the edges (common -- people don't always
// capture the full screen) should still contain the watermark, which only
// holds if it was never out at the edges to begin with. (2) A scale error
// between how this was painted and how a screenshot was captured drifts
// cell alignment in proportion to distance from the grid's origin -- a
// fullscreen-width capture that needed far finer scale-search precision
// than a small windowed one, confirmed directly, was the same problem in
// disguise. Concentrating the grid near the center bounds that distance
// regardless of how large the player itself is, which is what actually
// fixes both.
export function paintWatermarkOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  payload: string,
  delta = 8
) {
  if (width <= 0 || height <= 0) return;
  const patchWidth = Math.round(width * PATCH_FRACTION);
  const patchHeight = Math.round(height * PATCH_FRACTION);
  const patchLeft = Math.round((width - patchWidth) / 2);
  const patchTop = Math.round((height - patchHeight) / 2);

  const bits = bitsForPayload(payload);
  const cellsX = Math.floor(patchWidth / CELL_W);
  const cellsY = Math.floor(patchHeight / CELL_H);
  if (cellsX === 0 || cellsY === 0) return;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data; // starts fully transparent (alpha 0 everywhere)

  for (let cy = 0; cy < cellsY; cy++) {
    for (let cx = 0; cx < cellsX; cx++) {
      const cellIndex = cy * cellsX + cx;
      const bit = bits[cellIndex % bits.length];
      const x0 = patchLeft + cx * CELL_W;
      const y0 = patchTop + cy * CELL_H;

      // bit=1 brightens the left half; bit=0 brightens the right half. The
      // other half is left fully transparent (untouched).
      const paintLeft = bit === 1;
      const paintRight = bit === 0;

      for (let by = 0; by < CELL_H; by++) {
        const wy = windowValue(by, CELL_H);
        for (let bx = 0; bx < BLOCK_W; bx++) {
          const alpha = delta * wy * windowValue(bx, BLOCK_W);
          if (paintLeft) setPixel(data, width, x0 + bx, y0 + by, alpha);
          if (paintRight) setPixel(data, width, x0 + BLOCK_W + bx, y0 + by, alpha);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function setPixel(data: Uint8ClampedArray, width: number, x: number, y: number, alpha: number) {
  const idx = (y * width + x) * 4;
  data[idx] = 255;
  data[idx + 1] = 255;
  data[idx + 2] = 255;
  data[idx + 3] = Math.max(0, Math.min(255, Math.round(alpha)));
}
