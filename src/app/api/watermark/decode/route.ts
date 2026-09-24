import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { decode } from "@/lib/watermark/codec";
import { lookupWatermark } from "@/lib/watermark/lookup";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { WATERMARK_EXPECTED_PERIOD } from "@/lib/watermark/shared";

// TODO: gate this route to admins once auth is wired up (see /watermark
// page) -- until then it's reachable by anyone with the URL, so it's kept
// deliberately narrow: image-only, size-capped, and rate-limited.
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = rateLimit(`watermark-decode:${ip}`, { limit: 20, windowMs: 60 * 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("image");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // An admin-drawn crop box (see the /watermark page) around just the video
  // -- most real screenshots include page chrome (controls, borders,
  // surrounding text) the codec's cell grid was never painted under, which
  // dilutes the vote enough to break decoding even though the watermark
  // is genuinely there. Cropping server-side (not just relying on what the
  // admin visually selected) means we decode the exact pixels they marked.
  const cropInput = readCropRect(formData!);
  const decodeInput = cropInput ? await applyCrop(buffer, cropInput) : buffer;

  // Our own watermark ids are always WATERMARK_ID_LENGTH hex chars (issue.ts)
  // -- that's a fixed property of our scheme, not something to blind-guess,
  // so every scale candidate decode() tries can go straight to the single
  // right period instead of a slow 24-4096 sweep each time.
  //
  // The scale search now tries 100+ candidates (needed for real screenshots
  // whose exact scale falls outside a narrower jitter band), which makes an
  // accidental 16-bit sync-marker match a real, observed risk -- confirmed
  // live, a scan returned a plausible-looking id that had never been
  // issued. isValidCandidate rejects any hit that doesn't correspond to a
  // real watermark, so the search keeps going past a false positive instead
  // of confidently reporting the wrong person. The cache avoids looking the
  // accepted id up in Firestore twice (once to validate, once for the
  // response).
  const lookupCache = new Map<string, Awaited<ReturnType<typeof lookupWatermark>>>();
  async function isValidCandidate(text: string) {
    const viewer = await lookupWatermark(text);
    lookupCache.set(text, viewer);
    return viewer !== null;
  }

  const result = await decode({
    input: decodeInput,
    expectedPeriod: WATERMARK_EXPECTED_PERIOD,
    isValidCandidate,
  }).catch(() => ({ period: null, text: null }));

  if (!result.text) {
    return NextResponse.json({ found: false });
  }

  const viewer = lookupCache.get(result.text) ?? (await lookupWatermark(result.text));
  return NextResponse.json({ found: true, watermarkId: result.text, viewer });
}

function readCropRect(formData: FormData): { left: number; top: number; width: number; height: number } | null {
  const left = Number(formData.get("cropLeft"));
  const top = Number(formData.get("cropTop"));
  const width = Number(formData.get("cropWidth"));
  const height = Number(formData.get("cropHeight"));
  if (![left, top, width, height].every((n) => Number.isFinite(n) && n >= 0) || width <= 0 || height <= 0) {
    return null;
  }
  return { left, top, width, height };
}

async function applyCrop(
  buffer: Buffer,
  crop: { left: number; top: number; width: number; height: number }
): Promise<Buffer> {
  // A stale/out-of-range crop (e.g. rounding at the image edge) should fall
  // back to decoding the whole image rather than erroring the request.
  return sharp(buffer)
    .extract(crop)
    .toBuffer()
    .catch(() => buffer);
}
