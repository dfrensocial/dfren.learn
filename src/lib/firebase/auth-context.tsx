"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./client";
import { MAX_LOGIN_AGE_SECONDS } from "@/lib/session-policy";
import { getAcceptance } from "@/lib/legal-acceptance";
import { purgeStaleLoginEmail } from "@/lib/login-email";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const SESSION_SYNCED_KEY = "dfrenlearn:session-synced-at";
const SESSION_RESYNC_AFTER_MS = 12 * 60 * 60 * 1000;

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purgeStaleLoginEmail(); // a pending sign-in email never outlives 24h on this device
    return onAuthStateChanged(auth, (firebaseUser) => {
      // Absolute login lifetime: the browser login itself never expires, so
      // enforce the cap here too (the server enforces it independently).
      const lastSignIn = Date.parse(firebaseUser?.metadata.lastSignInTime ?? "");
      if (Number.isFinite(lastSignIn) && Date.now() - lastSignIn > MAX_LOGIN_AGE_SECONDS * 1000) {
        setUser(null);
        setLoading(false);
        void endExpiredSession();
        return;
      }
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        const last = Number(window.localStorage.getItem(SESSION_SYNCED_KEY) ?? 0);
        if (Date.now() - last > SESSION_RESYNC_AFTER_MS) void refreshSessionCookie(firebaseUser);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Syncs the httpOnly session cookie middleware.ts checks — call right after sign-in/sign-up. */
export async function syncSessionCookie(user: User) {
  const idToken = await user.getIdToken();
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, legal: getAcceptance() }),
  });
}

/**
 * Re-issues the session cookie for a user who is already signed in with
 * Firebase (their login persists in the browser far longer than the 5-day
 * server cookie). Returns false when the server refuses -- e.g. the session was
 * revoked -- so callers can fall back to a real sign-in instead of looping.
 */
export async function refreshSessionCookie(user: User): Promise<boolean> {
  try {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, legal: getAcceptance() }),
    });
    if (res.ok) window.localStorage.setItem(SESSION_SYNCED_KEY, String(Date.now()));
    return res.ok;
  } catch {
    return false;
  }
}

/** The login outlived its allowed lifetime: drop both the cookie and the Firebase login. */
export async function endExpiredSession() {
  await clearSessionCookie().catch(() => {});
  await signOut(auth).catch(() => {});
}

export async function clearSessionCookie() {
  window.localStorage.removeItem(SESSION_SYNCED_KEY);
  await fetch("/api/auth/session", { method: "DELETE" });
}
