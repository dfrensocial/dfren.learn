import { NextRequest, NextResponse } from "next/server";
import { mux } from "@/lib/mux/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let event;
  try {
    event = await mux.webhooks.unwrap(rawBody, req.headers, process.env.MUX_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "video.asset.ready") {
    const asset = event.data;
    const playbackId = asset.playback_ids?.[0]?.id;
    // Lesson upload requests must set passthrough to "<courseId>:<lessonId>" so the
    // webhook (which only gets the asset back) knows which Firestore doc to update.
    const [courseId, lessonId] = (asset.passthrough ?? "").split(":");

    if (courseId && lessonId && playbackId) {
      await adminDb
        .collection("courses")
        .doc(courseId)
        .collection("lessons")
        .doc(lessonId)
        .set(
          { muxPlaybackId: playbackId, muxAssetId: asset.id, status: "ready" },
          { merge: true }
        );
    }
  }

  return NextResponse.json({ received: true });
}
