"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Hero video: a YouTube embed driven through the IFrame API with our own controls on top, so it looks
 * like part of the site (no YouTube chrome, no "more videos"). Starts muted and playing (the only kind
 * of autoplay browsers allow); a pulsing "Tap to unmute" chip invites sound. Controls: play/pause,
 * 10 s back/forward, seek bar, volume, time, fullscreen. Space/arrow keys work when the player has focus.
 */

// Minimal typing for the bits of the IFrame API we use.
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(v: number): void;
  getVolume(): number;
  seekTo(s: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT as YTNamespace);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const Icon = {
  play: <path d="M8 5v14l11-7z" />,
  pause: <path d="M6 5h4v14H6zM14 5h4v14h-4z" />,
  back: (
    <>
      <path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" />
      <text x="8.2" y="15.8" fontSize="6.5" fontWeight="700" fill="currentColor" stroke="none">
        10
      </text>
    </>
  ),
  fwd: (
    <>
      <path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z" />
      <text x="8.2" y="15.8" fontSize="6.5" fontWeight="700" fill="currentColor" stroke="none">
        10
      </text>
    </>
  ),
  vol: <path d="M3 9v6h4l5 4V5L7 9zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" />,
  muted: <path d="M3 9v6h4l5 4V5L7 9zM16 9l5 6M21 9l-5 6" fill="none" />,
  full: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" />,
  replay: <path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" />,
};

function Svg({ name, className = "h-5 w-5" }: { name: keyof typeof Icon; className?: string }) {
  const stroked = name === "vol" || name === "muted" || name === "full" || name === "back" || name === "fwd";
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={stroked && name !== "back" && name !== "fwd" ? "none" : "currentColor"}
      stroke={stroked && name !== "back" && name !== "fwd" ? "currentColor" : "none"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {Icon[name]}
    </svg>
  );
}

export function HeroPlayer({ videoId, title }: { videoId: string; title: string }) {
  const reactId = useId().replace(/:/g, "");
  const mountId = `yt-${reactId}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seeking = useRef(false);
  const startedRef = useRef(false);
  const milestones = useRef<Set<number>>(new Set());
  // GA4's standard video events. Only ids/titles/percent, nothing personal; track() sends nothing without consent.
  const videoParams = useMemo(
    () => ({ video_title: title, video_provider: "youtube", video_url: `https://youtu.be/${videoId}` }),
    [title, videoId],
  );

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [blocked, setBlocked] = useState(false); // autoplay refused
  const [fullscreen, setFullscreen] = useState(false);

  // Create the player once.
  useEffect(() => {
    let cancelled = false;
    let blockTimer: ReturnType<typeof setTimeout> | undefined;
    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(document.getElementById(mountId) as HTMLElement, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            setReady(true);
            setDuration(e.target.getDuration());
            e.target.mute();
            e.target.playVideo();
            // If the browser refuses autoplay, fall back to a big play button.
            blockTimer = setTimeout(() => {
              const st = e.target.getPlayerState();
              if (st !== YT.PlayerState.PLAYING && st !== YT.PlayerState.BUFFERING) setBlocked(true);
            }, 2500);
          },
          onStateChange: (e) => {
            const st = e.data;
            setPlaying(st === YT.PlayerState.PLAYING || st === YT.PlayerState.BUFFERING);
            setEnded(st === YT.PlayerState.ENDED);
            if (st === YT.PlayerState.PLAYING) {
              setBlocked(false);
              setDuration(e.target.getDuration());
              if (!startedRef.current) {
                startedRef.current = true;
                track("video_start", { ...videoParams, autoplay: true, muted: e.target.isMuted() });
              }
            }
            if (st === YT.PlayerState.ENDED) track("video_complete", { ...videoParams, video_percent: 100 });
          },
        },
      });
    });
    return () => {
      cancelled = true;
      if (blockTimer) clearTimeout(blockTimer);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [mountId, videoId, videoParams]);

  // Progress ticker.
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p || seeking.current) return;
      const t = p.getCurrentTime();
      setTime(t);
      setMuted(p.isMuted());
      const d = p.getDuration();
      if (d > 0 && p.getPlayerState() === 1) {
        for (const m of [25, 50, 75]) {
          if (t / d >= m / 100 && !milestones.current.has(m)) {
            milestones.current.add(m);
            track("video_progress", { ...videoParams, video_percent: m });
          }
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [ready, videoParams]);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const wake = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2800);
  }, []);

  useEffect(() => {
    // While paused the bar is always shown (see render), so only the playing case needs the hide timer.
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setControlsVisible(false), 2800);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [playing]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (ended) {
      p.seekTo(0, true);
      p.playVideo();
      return;
    }
    if (playing) p.pauseVideo();
    else p.playVideo();
    setBlocked(false);
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      if (p.getVolume() === 0) p.setVolume(100);
      setMuted(false);
      track("video_unmute", videoParams);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const skip = (delta: number) => {
    const p = playerRef.current;
    if (!p) return;
    const t = Math.min(Math.max(p.getCurrentTime() + delta, 0), Math.max(duration - 0.5, 0));
    p.seekTo(t, true);
    setTime(t);
    if (ended) p.playVideo();
  };

  const onVolume = (v: number) => {
    const p = playerRef.current;
    if (!p) return;
    setVolume(v);
    p.setVolume(v);
    if (v === 0) {
      p.mute();
      setMuted(true);
    } else if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return; // let the sliders keep their own arrows
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      skip(-10);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      skip(10);
    } else if (e.key === "m") {
      toggleMute();
    } else if (e.key === "f") {
      toggleFullscreen();
    }
  };

  const pct = duration > 0 ? Math.min((time / duration) * 100, 100) : 0;
  const showBig = ready && (!playing || blocked) && !ended;

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <figure className="w-full">
      <div
        ref={wrapRef}
        role="group"
        aria-label={`Video player: ${title}`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerMove={() => playing && wake()}
        onPointerDown={() => playing && wake()}
        className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-accent/40 outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* The YouTube iframe replaces this div. Scaled up slightly to crop YouTube's top title strip. */}
        <div className="absolute inset-0 origin-center scale-[1.04]">
          <div id={mountId} className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full" />
        </div>

        {/* Click catcher: blocks the iframe's own UI and makes the whole picture a play/pause button. */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause video" : "Play video"}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent"
          tabIndex={-1}
        />

        {/* Loading shimmer before the player is ready */}
        {!ready && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-neutral-950">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
          </div>
        )}

        {/* Paused / blocked: dim + big play */}
        {showBig && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white shadow-[0_10px_40px_rgba(169,89,28,0.55)] sm:h-24 sm:w-24">
              <Svg name="play" className="ml-1 h-9 w-9 sm:h-11 sm:w-11" />
            </span>
          </div>
        )}

        {/* Ended */}
        {ended && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/85">
            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-dark"
            >
              <Svg name="replay" /> Watch again
            </button>
            <a href="#pricing" className="text-sm font-medium text-neutral-300 underline underline-offset-4 hover:text-white">
              Get the course ↓
            </a>
          </div>
        )}

        {/* Tap to unmute */}
        {ready && muted && playing && !ended && (
          <button
            type="button"
            onClick={toggleMute}
            className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-accent-dark"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <Svg name="muted" className="h-4 w-4" />
            Tap to unmute
          </button>
        )}

        {/* Control bar */}
        <div
          className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 ${
            controlsVisible || !playing ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {/* Seek bar */}
          <input
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={0.1}
            value={Math.min(time, Math.max(duration, 1))}
            aria-label="Seek"
            onPointerDown={() => (seeking.current = true)}
            onPointerUp={() => (seeking.current = false)}
            onChange={(e) => {
              const t = Number(e.target.value);
              setTime(t);
              playerRef.current?.seekTo(t, true);
            }}
            className="hp-range w-full"
            style={{ ["--pct" as string]: `${pct}%` }}
          />
          <div className="mt-1 flex items-center gap-1 text-white">
            <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className={btn}>
              <Svg name={ended ? "replay" : playing ? "pause" : "play"} />
            </button>
            <button type="button" onClick={() => skip(-10)} aria-label="Back 10 seconds" className={btn}>
              <Svg name="back" className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => skip(10)} aria-label="Forward 10 seconds" className={btn}>
              <Svg name="fwd" className="h-6 w-6" />
            </button>
            <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className={btn}>
              <Svg name={muted ? "muted" : "vol"} />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => onVolume(Number(e.target.value))}
              className="hp-range hidden w-20 sm:block"
              style={{ ["--pct" as string]: `${muted ? 0 : volume}%` }}
            />
            <span className="ml-2 select-none text-xs tabular-nums text-neutral-200">
              {fmt(time)} <span className="text-neutral-400">/ {fmt(duration)}</span>
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              className={`${btn} ml-auto`}
            >
              <Svg name="full" />
            </button>
          </div>
        </div>
      </div>
    </figure>
  );
}
