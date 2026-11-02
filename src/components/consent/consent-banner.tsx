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
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    function open() {
      const c = currentChoices();
      setAnalytics(c.analytics);
      setReplay(c.replay);
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

  function decide(a: boolean, r: boolean) {
    saveConsent({ analytics: a, replay: r });
    setOpened(false);
    setPanel(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      className="fixed inset-x-3 bottom-3 z-[60] border border-black bg-white p-4 text-sm text-black shadow-lg sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[26rem]"
    >
      <h2 id="consent-heading" ref={headingRef} tabIndex={-1} className="font-semibold outline-none">
        Your privacy choices
      </h2>

      {!panel ? (
        <>
          <p className="mt-2 leading-relaxed text-neutral-700">
            We&apos;d like to use two optional tools, <strong>analytics</strong> and{" "}
            <strong>session recordings</strong>, to see what&apos;s working on the site and fix what isn&apos;t.
            Nothing optional runs unless you say yes, and you can change your mind any time.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => decide(false, false)}
              className="border border-black bg-white px-4 py-2.5 font-semibold transition hover:bg-neutral-100"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => decide(true, true)}
              className="border border-black bg-black px-4 py-2.5 font-semibold text-white transition hover:bg-neutral-800"
            >
              Accept
            </button>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
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
            Both are off until you switch them on. Sign-in, checkout and security always run, because we need
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
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => decide(analytics, replay)}
              className="border border-black bg-black px-4 py-2.5 font-semibold text-white transition hover:bg-neutral-800"
            >
              Save choices
            </button>
            <button
              type="button"
              onClick={() => decide(true, true)}
              className="border border-black bg-white px-4 py-2.5 font-semibold transition hover:bg-neutral-100"
            >
              Accept all
            </button>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
            <button type="button" onClick={() => decide(false, false)} className="underline">
              Decline all
            </button>
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
