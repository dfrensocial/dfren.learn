"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pause / play for the testimonial strip. Moving content that runs for more
 * than a few seconds needs a way to stop it, so this sits under the strip.
 * It flips data-paused on the surrounding section; globals.css does the rest.
 */
export function MarqueePause() {
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (section) section.dataset.paused = paused ? "true" : "false";
  }, [paused]);

  return (
    <div className="mt-6 flex justify-center">
      <button
        ref={ref}
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-black"
      >
        {paused ? "Play scrolling" : "Pause scrolling"}
      </button>
    </div>
  );
}
