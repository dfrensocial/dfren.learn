/**
 * `?redirect=` comes from the URL, so it's attacker-controlled: left raw,
 * `//evil.com` or `/\evil.com` (or a tab/newline smuggled in, which browsers
 * strip) turns a legitimate login link into an open redirect. Only same-site
 * absolute paths are allowed through.
 */
export function safeRedirectPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (/[\\\u0000-\u001f]/.test(raw)) return fallback;
  return raw;
}
