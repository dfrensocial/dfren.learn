"use client";

import { useRef, useState } from "react";

// Internal tool: upload a screenshot/frame grab from a suspicious clip and
// recover the invisible forensic watermark id, plus whichever viewer it was
// issued to (once real issuance is wired into the player -- until then
// "found" but with no viewer record is expected).
//
// TODO: gate this route to admins. It's unauthenticated for now -- see
// src/app/api/watermark/decode/route.ts for the matching TODO.
type Result =
  | { found: false }
  | { found: true; watermarkId: string; viewer: { email: string; courseId: string; lessonId: string } | null };

type DragRect = { x: number; y: number; w: number; h: number };

export default function WatermarkCheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [dragRect, setDragRect] = useState<DragRect | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    setError(null);
    setDragRect(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  function clampToImg(x: number, y: number) {
    const img = imgRef.current;
    if (!img) return { x, y };
    return { x: Math.max(0, Math.min(x, img.clientWidth)), y: Math.max(0, Math.min(y, img.clientHeight)) };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const start = clampToImg(e.clientX - rect.left, e.clientY - rect.top);
    dragStartRef.current = start;
    setDragRect({ x: start.x, y: start.y, w: 0, h: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLImageElement>) {
    const start = dragStartRef.current;
    const img = imgRef.current;
    if (!start || !img) return;
    const rect = img.getBoundingClientRect();
    const current = clampToImg(e.clientX - rect.left, e.clientY - rect.top);
    setDragRect({
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      w: Math.abs(current.x - start.x),
      h: Math.abs(current.y - start.y),
    });
  }

  function handlePointerUp() {
    dragStartRef.current = null;
    // A drag too small to be intentional (an accidental click) isn't a real selection.
    setDragRect((r) => (r && r.w > 8 && r.h > 8 ? r : null));
  }

  // Converts the drag rectangle from displayed (CSS) pixels back to the
  // image's own natural pixel resolution -- the server crops in natural
  // pixels, since that's what the codec's cell grid is measured in.
  function naturalCropRect(): { left: number; top: number; width: number; height: number } | null {
    const img = imgRef.current;
    if (!img || !dragRect || dragRect.w <= 0 || dragRect.h <= 0) return null;
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    return {
      left: Math.round(dragRect.x * scaleX),
      top: Math.round(dragRect.y * scaleY),
      width: Math.round(dragRect.w * scaleX),
      height: Math.round(dragRect.h * scaleY),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const body = new FormData();
      body.append("image", file);
      const crop = naturalCropRect();
      if (crop) {
        body.append("cropLeft", String(crop.left));
        body.append("cropTop", String(crop.top));
        body.append("cropWidth", String(crop.width));
        body.append("cropHeight", String(crop.height));
      }
      const res = await fetch("/api/watermark/decode", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }
      setResult(data);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-white px-6 py-16 text-black">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight">Watermark checker</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Upload a screenshot or frame grab from a suspicious clip to recover the invisible watermark id embedded in
          it.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border border-black px-3 py-2 text-sm"
          />
          {previewUrl && (
            <div>
              <p className="mb-1 text-xs text-neutral-600">
                Optional: drag a box around just the video (skip page chrome, controls, borders) — helps a lot when
                the screenshot isn&apos;t a clean export of just the frame.
              </p>
              <div className="relative inline-block max-w-full select-none">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded file, not a static asset */}
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="Selected upload preview"
                  className="max-h-[70vh] max-w-full cursor-crosshair border border-black"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  draggable={false}
                />
                {dragRect && (
                  <div
                    className="pointer-events-none absolute border-2 border-red-500 bg-red-500/10"
                    style={{ left: dragRect.x, top: dragRect.y, width: dragRect.w, height: dragRect.h }}
                  />
                )}
              </div>
              {dragRect && (
                <button
                  type="button"
                  onClick={() => setDragRect(null)}
                  className="mt-1 text-xs text-neutral-600 underline"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={!file || submitting}
            className="bg-black px-4 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40"
          >
            {submitting ? "Checking..." : "Check for watermark"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {result && (
          <div className="mt-6 border border-black p-4 text-sm">
            {!result.found && (
              <div>
                <p>No watermark recovered from this image.</p>
                {!dragRect && (
                  <p className="mt-1 text-neutral-600">
                    Try dragging a box around just the video area above and checking again — extra page chrome
                    (controls, borders, surrounding text) around the video makes it harder to find.
                  </p>
                )}
              </div>
            )}
            {result.found && (
              <div className="flex flex-col gap-2">
                <p>
                  Watermark id: <span className="font-mono font-semibold">{result.watermarkId}</span>
                </p>
                {result.viewer ? (
                  <div>
                    <p>
                      Issued to: <span className="font-medium">{result.viewer.email}</span>
                    </p>
                    <p className="text-neutral-600">
                      Course: {result.viewer.courseId} / Lesson: {result.viewer.lessonId}
                    </p>
                  </div>
                ) : (
                  <p className="text-neutral-600">
                    No matching viewer record found (expected until per-viewer watermark issuance is live).
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
