"use client";

import { useSyncExternalStore } from "react";
import { LEGAL } from "@/content/legal";

// ---------------------------------------------------------------------------
// The visitor's privacy choices. Two OPTIONAL purposes, both off until the
// visitor says yes:
//   analytics -> Google Analytics (via Firebase), first-party traffic-source
//                memory, source/device/location saved with an order, Mux Data
//                playback quality, server-side purchase counts
//   replay    -> Microsoft Clarity session recordings + heatmaps
//
// Everything else the site does (account, sign-in, order, payment, security
// logs, resume position) is NECESSARY processing and is covered by accepting
// the Terms + Privacy Policy at login / checkout -- never by this banner.
//
// Rules this file enforces:
//  - Nothing optional runs without an explicit "yes". Undecided = off.
//  - A browser Global Privacy Control / Do Not Track signal = off, until the
//    visitor makes an explicit choice (which then wins).
//  - Choices expire after 6 months or when the banner's purposes change
//    (LEGAL.consentVersion), so the visitor is asked again.
//  - Declining is stored on the device only. A "yes" is also logged on our
//    server (random id, time, choices, version -- no IP) as proof of consent.
// ---------------------------------------------------------------------------

export const CONSENT_KEY = "dfrenlearn:consent";
const KEY = CONSENT_KEY;
const RECORDED_KEY = "dfrenlearn:consent-recorded"; // a "yes" is on our server: a later "no" must be logged too
export const CONSENT_EVENT = "dfrenlearn:consent-change";
export const OPEN_SETTINGS_EVENT = "dfrenlearn:open-privacy-settings";
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

export type ConsentChoices = { analytics: boolean; replay: boolean };
type Stored = ConsentChoices & { id: string; version: string; decidedAt: number };

const OFF: ConsentChoices = { analytics: false, replay: false };

// If browser storage is blocked, the choice still holds for this page view
// (otherwise the banner could never be dismissed).
let memoryRaw: string | null = null;

function readRaw(): string | null {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v) return v;
  } catch {
    // fall through to memory
  }
  return memoryRaw;
}

function parse(raw: string | null): Stored | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<Stored>;
    if (
      typeof s.analytics !== "boolean" ||
      typeof s.replay !== "boolean" ||
      typeof s.id !== "string" ||
      s.version !== LEGAL.consentVersion ||
      typeof s.decidedAt !== "number" ||
      Date.now() - s.decidedAt > MAX_AGE_MS
    ) {
      return null; // unreadable, from an older banner, or expired: ask again
    }
    return s as Stored;
  } catch {
    return null;
  }
}

/** True when the browser itself says "don't track me" (GPC / Do Not Track). */
export function privacySignalOn(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

/** What is allowed right now. Undecided, expired or signalled = everything off. */
export function currentChoices(): ConsentChoices {
  if (typeof window === "undefined") return OFF;
  const s = parse(readRaw());
  return s ? { analytics: s.analytics, replay: s.replay } : OFF;
}

export const analyticsConsented = () => currentChoices().analytics;
export const replayConsented = () => currentChoices().replay;

/** Should the banner be shown? Only when there is no valid choice AND no privacy signal. */
export function needsDecision(): boolean {
  if (typeof window === "undefined") return false;
  return parse(readRaw()) === null && !privacySignalOn();
}

function newId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  // Older browsers: a proper v4 UUID (the server validates the format).
  const b = new Uint8Array(16);
  if (c?.getRandomValues) c.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function logToServer(id: string, choices: ConsentChoices, action: "accept" | "update" | "withdraw") {
  try {
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ id, ...choices, version: LEGAL.consentVersion, action }),
    }).catch(() => {});
  } catch {
    // proof-of-consent logging must never break the page
  }
}

/** Saves the visitor's choice, tells the rest of the app, and (for a "yes") logs proof. */
export function saveConsent(choices: ConsentChoices) {
  const prev = parse(readRaw());
  const id = prev?.id ?? newId();
  const stored: Stored = { ...choices, id, version: LEGAL.consentVersion, decidedAt: Date.now() };
  memoryRaw = JSON.stringify(stored);
  try {
    window.localStorage.setItem(KEY, memoryRaw);
  } catch {
    // storage blocked: the in-memory copy keeps the choice for this page view
  }

  const anyYes = choices.analytics || choices.replay;
  let recorded = false;
  try {
    recorded = window.localStorage.getItem(RECORDED_KEY) === id;
  } catch {
    // ignore
  }
  if (anyYes) {
    logToServer(id, choices, prev ? "update" : "accept");
    try {
      window.localStorage.setItem(RECORDED_KEY, id);
    } catch {
      // ignore
    }
  } else if (recorded) {
    logToServer(id, choices, "withdraw"); // they had said yes before: the withdrawal is part of the record
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function openPrivacySettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

// --- React binding ---------------------------------------------------------

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  window.addEventListener("storage", cb); // another tab changed it
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// useSyncExternalStore needs a stable snapshot: a string is compared by value.
const snapshot = () => `${analyticsConsented() ? 1 : 0}${replayConsented() ? 1 : 0}${needsDecision() ? 1 : 0}`;

/** `ready` is false during server render / hydration, so UI that depends on it can't mismatch. */
export function useConsent() {
  const snap = useSyncExternalStore(subscribe, snapshot, () => "ssr");
  return {
    ready: snap !== "ssr",
    analytics: snap[0] === "1",
    replay: snap[1] === "1",
    undecided: snap[2] === "1",
  };
}
