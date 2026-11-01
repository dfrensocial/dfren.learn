"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Silent promo loop for the hero. Autoplay only works muted + inline. The
 * pause button is there so anyone who finds motion distracting can stop it.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  // React omits `muted` from server HTML, so browsers skip the autoplay attribute; start it by hand.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => setPlaying(false));
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }

  return (
    <div className="relative mx-auto mt-14 aspect-video max-w-5xl overflow-hidden border border-black bg-black">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        src="/video/geo-promo.mp4"
        poster="/video/geo-promo-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label="Short promo: people now ask AI instead of searching, so learn GEO to get recommended"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause video" : "Play video"}
        className="absolute bottom-3 right-3 rounded-full border border-white/40 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black"
      >
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}
