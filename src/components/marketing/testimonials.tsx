import fs from "node:fs";
import path from "node:path";

// Student proof: screenshots (WhatsApp messages, results) dropped into
// public/images/testimonials/. Read at build time, shown in filename order as
// two auto-scrolling rows (see .marquee in globals.css). Nothing renders in
// production until at least one image is there; in dev a dashed placeholder
// marks the spot.
const DIR = path.join(process.cwd(), "public", "images", "testimonials");
const IMAGE = /\.(png|jpe?g|webp|avif)$/i;

const CARD_W = 300; // px, matches w-[300px] below
const GAP = 16; // px, right padding on each card
const SPEED = 45; // px per second
const COPIES = 4; // identical copies per row: keeps the strip wider than any screen

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

function Row({ files, reverse, offset }: { files: string[]; reverse?: boolean; offset: number }) {
  const duration = Math.round(((CARD_W + GAP) * files.length) / SPEED);
  return (
    <div className={`marquee ${reverse ? "marquee-reverse" : ""}`}>
      <div
        className="marquee-track"
        style={{ ["--dur" as string]: `${duration}s`, ["--copies" as string]: COPIES } as React.CSSProperties}
      >
        {Array.from({ length: COPIES }).flatMap((_, copy) =>
          files.map((f, i) => (
            <div
              key={`${copy}-${f}`}
              className={`shrink-0 ${copy > 0 ? "marquee-dup" : ""}`}
              style={{ width: CARD_W + GAP, paddingRight: GAP }}
              aria-hidden={copy > 0 ? true : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/testimonials/${encodeURIComponent(f)}`}
                alt={copy === 0 ? `Student message ${offset + i + 1}` : ""}
                loading="lazy"
                className="w-full rounded-2xl border border-neutral-200 bg-white shadow-sm"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function Testimonials() {
  const files = loadImages();
  const isDev = process.env.NODE_ENV !== "production";
  if (files.length === 0 && !isDev) return null;

  // Alternate images between two rows so they read as one wall; a single image
  // or two just gets one row.
  const rowA = files.filter((_, i) => i % 2 === 0);
  const rowB = files.filter((_, i) => i % 2 === 1);

  return (
    <section id="students" className="scroll-mt-16 overflow-hidden bg-neutral-50 py-16 sm:py-24">
      <h2 className="mx-auto max-w-3xl px-6 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        What students are saying
      </h2>

      {files.length === 0 ? (
        <p className="mx-auto mt-10 max-w-6xl rounded-2xl border-2 border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          Dev only: add screenshots to public/images/testimonials/ and they appear here. Hidden in production until
          there is at least one.
        </p>
      ) : (
        <div className="mt-12 space-y-4">
          <Row files={rowA} offset={0} />
          {rowB.length > 0 && <Row files={rowB} reverse offset={rowA.length} />}
        </div>
      )}
    </section>
  );
}
