import { NextRequest, NextResponse } from "next/server";
import { decode } from "@/lib/watermark/codec";
import { lookupWatermark } from "@/lib/watermark/lookup";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
  const result = await decode({ input: buffer }).catch(() => ({ period: null, text: null }));

  if (!result.text) {
    return NextResponse.json({ found: false });
  }

  const viewer = await lookupWatermark(result.text);
  return NextResponse.json({ found: true, watermarkId: result.text, viewer });
}
