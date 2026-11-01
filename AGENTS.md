<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# dfrenLearn — Project Rules

Course platform: landing page → guest checkout → protected video lessons. Currently sells one course (`geo-blueprint`), built so adding more later is cheap — see "Multi-course readiness" below.

## Tech Stack
- **Next.js 16** (App Router, TypeScript, Tailwind, `src/` dir)
- **Firebase**: Auth (email-link sign-in only), Firestore (courses/lessons/users/enrollments), Storage (thumbnails/assets)
- **Mux**: video hosting/streaming. Assets created with `playback_policy: "signed"` — never `"public"`. Playback always goes through a short-lived signed token issued server-side (`/api/mux/playback-token`), never a raw playback ID shipped to the client.
- **Razorpay**: payments, guest checkout (no signup required before paying — see "Checkout & accounts" below). Orders created server-side (`/api/razorpay/create-order`), verified via signature both at `/api/razorpay/verify` (client-triggered, right after payment) and the webhook (`/api/razorpay/webhook`, idempotent fallback).

## Architecture
- `src/lib/firebase/client.ts` — browser SDK, safe for client components.
- `src/lib/firebase/admin.ts` — service-account SDK, server-only (API routes, RSCs). Never import into a client component.
- `src/lib/mux/` — server SDK + signed-playback-token helper.
- `src/lib/razorpay/` — server SDK, signature verification, and `grant-access.ts` (shared by `/api/razorpay/verify` and the webhook).
- Auth: sign-in is **email link only** (no passwords, no self-serve signup — `/signup` redirects to `/login`). Firebase ID token (client) → exchanged for an httpOnly session cookie via `/api/auth/session` → `middleware.ts` gates `/dashboard/*` on cookie *presence* only (UX redirect, not security). Real enforcement is per-request: API routes verify the Bearer ID token with `verifyIdToken(token, true)` (honours revocation) and Firestore rules gate direct reads. The session cookie is never verified server-side — dashboard pages are client-rendered.
- Admin = verified email listed in `ADMIN_EMAILS` (server env, comma-separated; empty = nobody). `requireAdmin()` in `src/lib/admin-auth.ts` guards `/api/watermark/decode`.
- Firestore layout: `courses/{courseId}`, `courses/{courseId}/lessons/{lessonId}`, `users/{uid}/enrollments/{courseId}`.
- Course marketing copy + price live in `src/content/courses/{courseId}.ts` (typed `CourseContent`), not hardcoded in components — components take it as props. `scripts/seed-course.ts` reads the same file to write the Firestore `courses/{courseId}` doc (`npm run seed`). There's no admin UI; this script is the only way courses get created right now.

## Checkout & accounts
- Guest checkout: an unauthenticated visitor is never redirected to sign up. `CheckoutButton` (`src/components/course/checkout-button.tsx`) captures just an email inline, and Razorpay's popup opens immediately — no confirm-order step.
- Both guest and logged-in purchases are the same code path, keyed by **email**, not by whether an account already existed: `grantCourseAccess` (`src/lib/razorpay/grant-access.ts`) does `getUserByEmail` → create-if-missing → write the enrollment doc. Called from `/api/razorpay/verify` (signature-verified, client-triggered right after payment) and the webhook (idempotent fallback, same signature verification). Both are equally trustworthy — what's still banned is trusting an *unverified* "payment succeeded" message with no signature check.
- The buyer types their own email, so it proves nothing about who they are. `grantCourseAccess` therefore returns `claimable` — true only for an account nobody has ever signed into (no provider, `metadata.lastSignInTime` null). Only then does `/api/razorpay/verify` return a custom token (`createCustomToken` → `signInWithCustomToken`) for instant first access. Any other account (returning customer, or someone paying with a stranger's email) gets `signInRequired` and the client sends an emailed sign-in link instead. **Never mint a token for a non-claimable account** — that is an account takeover.
- Firebase's public password sign-up cannot be disabled, so an attacker can pre-register a victim's email with a password. `grantCourseAccess` strips the password provider and revokes sessions on any account with a password and an unverified email. Real accounts never have a password.
- Returning on a new device uses "email me a sign-in link" on `/login` (`sendSignInLinkToEmail`/`signInWithEmailLink`, Firebase's own email delivery). `?redirect=` is sanitised by `safeRedirectPath` — keep using it.

## Multi-course readiness
- Everything above (Firestore layout, `/dashboard`, `/dashboard/courses/[courseId]`, checkout) already works for N courses.
- What's still single-course-specific: the marketing page lives at `/` and renders exactly one `CourseContent` object; `/dashboard` redirects straight to the one course when there's only one (falls back to a real list once there's more than one).
- Adding course #2: add `src/content/courses/{slug}.ts`, re-run `npm run seed` (or extend it), and give it its own route reusing the existing marketing section components — at that point turn `/` into a catalog and move this course's page to `/courses/geo-blueprint`. Don't build the catalog page before there's a second course.

## Rules
- Never expose `RAZORPAY_KEY_SECRET`, `FIREBASE_PRIVATE_KEY`, `MUX_TOKEN_SECRET`, or `MUX_SIGNING_KEY_PRIVATE` to the client — server-only env vars, no `NEXT_PUBLIC_` prefix.
- Never grant course access from an unverified client message — only from a signature-verified path (`/api/razorpay/verify` or the webhook), per "Checkout & accounts" above.
- Every new Mux asset must set `playback_policy: "signed"` and pass `passthrough: "<courseId>:<lessonId>"` so the webhook can locate the Firestore doc to update.
- Firestore security rules must deny direct client reads of `lessons.muxPlaybackId`/`muxAssetId` for non-enrolled users — playback IDs are only ever handed out via the signed API route.
- `/api/test/simulate-payment` grants access with no payment: it needs `NODE_ENV !== "production"` or `ENABLE_TEST_PAYMENTS=true`, and is dead once Razorpay is configured. Never set `ENABLE_TEST_PAYMENTS` on the live site.
- No `git push` — this repo is set up for the user to push manually. Tell them when a push is ready; do not run it yourself.

