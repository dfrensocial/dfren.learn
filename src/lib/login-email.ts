"use client";

// The email a sign-in link was sent to is remembered in the browser just long
// enough to finish signing in on the same device. It is a plain email, so it
// is only kept for 24 hours -- anything older is deleted on the next visit.

export const LOGIN_EMAIL_KEY = "dfrenlearn:login-email";
const AT_KEY = "dfrenlearn:login-email-at";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function rememberLoginEmail(email: string) {
  try {
    window.localStorage.setItem(LOGIN_EMAIL_KEY, email);
    window.localStorage.setItem(AT_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function forgetLoginEmail() {
  try {
    window.localStorage.removeItem(LOGIN_EMAIL_KEY);
    window.localStorage.removeItem(AT_KEY);
  } catch {
    // ignore
  }
}

/** Deletes a remembered email that is older than 24h (or has no timestamp). */
export function purgeStaleLoginEmail() {
  try {
    if (!window.localStorage.getItem(LOGIN_EMAIL_KEY)) return;
    const at = Number(window.localStorage.getItem(AT_KEY) ?? 0);
    if (!at || Date.now() - at > MAX_AGE_MS) forgetLoginEmail();
  } catch {
    // ignore
  }
}
