import fs from "node:fs";
import path from "node:path";

// Student proof: screenshots (WhatsApp messages, results) dropped into
// public/images/testimonials/. Read at build time, shown in filename order.
// Nothing renders in production until at least one image is there; in dev a
// dashed placeholder marks the spot.
const DIR = path.join(process.cwd(), "public", "images", "testimonials");
const IMAGE = /\.(png|jpe?g|webp|avif)$/i;

function loadImages(): string[] {
  try {
    return fs
      .readdirSync(DIR)
      .filter((f) => IMAGE.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

export function Testimonials() {
  const files = loadImages();
  const isDev = process.env.NODE_ENV !== "production";
  if (files.length === 0 && !isDev) return null;

  return (
    <section id="students" className="scroll-mt-16 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What students are saying
        </h2>

        {files.length === 0 ? (
          <p className="mt-10 rounded-2xl border-2 border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
            Dev only: add screenshots to public/images/testimonials/ and they appear here. Hidden in production until
            there is at least one.
          </p>
        ) : (
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {files.map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={f}
                src={`/images/testimonials/${encodeURIComponent(f)}`}
                alt={`Student message ${i + 1}`}
                loading="lazy"
                className="w-full break-inside-avoid rounded-2xl border border-neutral-200 bg-white shadow-sm"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
