"use client";

import { useState } from "react";

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

export default function WatermarkCheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
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
      <div className="w-full max-w-md">
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
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded file, not a static asset
            <img src={previewUrl} alt="Selected upload preview" className="max-h-64 w-full border border-black object-contain" />
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
            {!result.found && <p>No watermark recovered from this image.</p>}
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
