"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { isSupported, initializeAnalytics, type Analytics } from "firebase/analytics";

export const isFirebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// Placeholders when env vars are missing: getAuth() throws on an empty apiKey
// at import time, which would take down every page (AuthProvider is in the
// root layout). With placeholders the SDK loads, auth state is just "signed
// out", and sign-in attempts fail with a normal Firebase error instead.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "not-configured",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "not-configured",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics needs a real browser (no SSR, no unsupported browsers), so it's
// resolved lazily rather than at module load.
let analyticsPromise: Promise<Analytics | null> | null = null;
export function getFirebaseAnalytics() {
  if (typeof window === "undefined" || !isFirebaseConfigured || !firebaseConfig.measurementId) {
    return Promise.resolve(null);
  }
  if (!analyticsPromise) {
    // send_page_view is off because PageViewTracker sends page_view itself --
    // on first load AND on every client-side navigation. Leaving the SDK's
    // automatic one on would double-count the first page.
    analyticsPromise = isSupported().then((supported) =>
      supported ? initializeAnalytics(app, { config: { send_page_view: false } }) : null
    );
  }
  return analyticsPromise;
}
