// Pure bit-layout logic shared between the Node/sharp-based file codec
// (codec.ts, server-only) and the browser canvas overlay (paint-overlay.ts,
// client-safe). Nothing here touches Node APIs or `sharp` -- that import
// would break the client bundle, since sharp ships a native binary.

export const CELL_W = 16; // one bit cell = two 8x8 blocks side by side
export const CELL_H = 8;
export const BLOCK_W = CELL_W / 2;

// Wraps payload with a fixed 16-bit sync marker so the decoder can find
// bit-alignment even if it doesn't know the payload length in advance.
export const SYNC = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0];

// Raised-cosine bump: 0 at both ends of a `size`-wide span, 1 at the center.
// Applying this in both x and y turns a flat rectangular push into a soft
// blob that fades to nothing at every block boundary -- no more hard edges
// for the eye to lock onto.
export function windowValue(localPos: number, size: number) {
  return Math.sin((Math.PI * (localPos + 0.5)) / size) ** 2;
}

export function stringToBits(str: string): number[] {
  const bits: number[] = [];
  for (const ch of new TextEncoder().encode(str)) {
    for (let i = 7; i >= 0; i--) bits.push((ch >> i) & 1);
  }
  return bits;
}

export function bitsToString(bits: number[]): string {
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
    bytes.push(byte);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export function matchesSync(bits: number[]) {
  for (let i = 0; i < SYNC.length; i++) if (bits[i] !== SYNC[i]) return false;
  return true;
}

export function isPrintable(str: string) {
  return str.length > 0 && [...str].every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127);
}

// A dark scene (or a bright one) breaks a naive "+delta / -delta" push: on a
// near-black frame the "-delta" side just clips to 0, silently erasing half
// of every bit's signal. Fix: each cell only pushes ONE of its two halves,
// always in whichever direction has headroom (brighter if the cell is dark,
// darker if it's bright) -- never both directions on content that can't
// take it. The decoder recovers the sign by independently checking which
// regime the cell is in, so it doesn't need to be told.
export function pickDirection(cellMean: number) {
  return cellMean < 128 ? 1 : -1;
}

export function bitsForPayload(payload: string): number[] {
  return [...SYNC, ...stringToBits(payload)];
}
