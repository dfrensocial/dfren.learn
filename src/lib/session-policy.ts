// A login (a real email-link / checkout sign-in) is honoured for this long.
// Firebase's own refresh token never expires, so without a cap someone who
// signed in once could stay in forever -- including a shared or stolen
// device. After this, the next request asks them to sign in by email again.
// Pure (no server imports) so both API routes and the browser can use it.
export const MAX_LOGIN_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * True when the user's last *actual* sign-in (the token's `auth_time`, which
 * silent token refreshes do not change) is older than the cap. A token with no
 * auth_time is not treated as expired -- Firebase always sets it, and failing
 * closed on a missing claim would risk locking everyone out.
 */
export function loginIsTooOld(authTime: number | undefined, nowMs = Date.now()): boolean {
  if (typeof authTime !== "number") return false;
  return nowMs / 1000 - authTime > MAX_LOGIN_AGE_SECONDS;
}
