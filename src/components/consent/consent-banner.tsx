"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OPEN_SETTINGS_EVENT, currentChoices, saveConsent, useConsent } from "@/lib/consent";

// Owner tools never show the banner (nothing is collected there either).
const HIDDEN_ON = ["/admin", "/watermark"];

/**
 * First-visit privacy banner + the "Privacy settings" panel.
 * - Decline and Accept are the same size and one click each.
 * - Never blocks the page (no overlay, no cookie wall).
 * - Nothing optional runs until a button is pressed.
 * - Reopened any time from the "Privacy settings" links (footer, legal pages).
 */
export function ConsentBanner() {
  const pathname = usePathname();
  const { ready, undecided } = useConsent();
  const [panel, setPanel] = useState(false);
  const [opened, setOpened] = useState(false); // opened on purpose from a "Privacy settings" link
  const [analytics, setAnalytics] = useState(false);
  const [replay, setReplay] = useState(false);
  const [ads, setAds] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    function open() {
      const c = currentChoices();
      setAnalytics(c.analytics);
      setReplay(c.replay);
      setAds(c.ads);
      setPanel(true);
      setOpened(true);
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  // Keyboard / screen-reader users: when the panel swaps in, keep focus inside the dialog.
  const prevPanel = useRef(panel);
  useEffect(() => {
    if (prevPanel.current !== panel) {
      prevPanel.current = panel;
      headingRef.current?.focus();
    }
  }, [panel]);

  const visible = ready && (opened || undecided) && !HIDDEN_ON.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!visible || !opened) return;
    headingRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpened(false);
        setPanel(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, opened]);

  if (!visible) return null;

  function decide(a: boolean, r: boolean, ad: boolean) {
    saveConsent({ analytics: a, replay: r, ads: ad });
    setOpened(false);
    setPanel(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      className={`fixed inset-x-2 bottom-2 z-[60] rounded-xl border border-neutral-300 bg-white/95 text-black shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[27rem] ${
        panel ? "p-4 text-sm" : "p-3 text-[13px]"
      }`}
    >
      <h2
        id="consent-heading"
        ref={headingRef}
        tabIndex={-1}
        className={panel ? "font-semibold outline-none" : "sr-only"}
      >
        Your privacy choices
      </h2>

      {!panel ? (
        <>
          <p className="leading-snug text-neutral-800">
            We use optional <strong>analytics</strong>, <strong>session recordings</strong> and Meta{" "}
            <strong>ad measurement</strong> to see what works and make this course better. Nothing runs unless you
            say yes, and you can change it any time.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => decide(false, false, false)}
              className="h-9 flex-1 rounded-lg border border-neutral-400 bg-white px-3 text-sm font-semibold transition hover:bg-neutral-100"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => decide(true, true, true)}
              className="h-9 flex-1 rounded-lg border border-neutral-400 bg-white px-3 text-sm font-semibold transition hover:bg-neutral-100"
            >
              Accept
            </button>
          </div>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-neutral-600">
            <button type="button" onClick={() => setPanel(true)} className="underline">
              Choose what to allow
            </button>
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-neutral-700">
            All three are off until you switch them on. Sign-in, checkout and security always run, because we need
            them to give you the service.
          </p>
          <div className="mt-3 space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>
                <span className="block font-medium">Analytics</span>
                <span className="block text-xs leading-relaxed text-neutral-600">
                  Counts visits, clicks and video progress (Google Analytics), remembers which link brought you
                  here, and measures video playback quality.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={replay}
                onChange={(e) => setReplay(e.target.checked)}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>
                <span className="block font-medium">Session recordings</span>
                <span className="block text-xs leading-relaxed text-neutral-600">
                  Replays of how you move around the pages, with typed text hidden (Microsoft Clarity). Helps us
                  spot confusing pages.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={ads}
                onChange={(e) => setAds(e.target.checked)}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>
                <span className="block font-medium">Ad measurement</span>
                <span className="block text-xs leading-relaxed text-neutral-600">
                  Tells Meta (Facebook, Instagram) which pages you visit, and, if you buy, that a purchase happened,
                  so we can see which of our ads work and show them to people who visited. No email, name or phone
                  number is sent.
                </span>
              </span>
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => decide(false, false, false)}
              className="border border-black bg-white px-4 py-2.5 font-semibold transition hover:bg-neutral-100"
            >
              Decline all
            </button>
            <button
              type="button"
              onClick={() => decide(true, true, true)}
              className="border border-black bg-white px-4 py-2.5 font-semibold transition hover:bg-neutral-100"
            >
              Accept all
            </button>
          </div>
          <button
            type="button"
            onClick={() => decide(analytics, replay, ads)}
            className="mt-2 w-full border border-black bg-white px-4 py-2.5 font-semibold transition hover:bg-neutral-100"
          >
            Save my choices
          </button>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
            {opened ? (
              <button
                type="button"
                onClick={() => {
                  setOpened(false);
                  setPanel(false);
                }}
                className="underline"
              >
                Close
              </button>
            ) : (
              <button type="button" onClick={() => setPanel(false)} className="underline">
                Back
              </button>
            )}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
