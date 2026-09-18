# dfrenLearn

Course platform. Landing page → guest checkout → protected video lessons via Mux.

## Stack
Next.js 15 (App Router, TS, Tailwind) · Firebase (Auth, Firestore) · Mux (signed video playback) · Razorpay (payments)

Architecture and rules: see [AGENTS.md](./AGENTS.md).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in every value (see below for where each comes from).
3. `npm run dev`

### Firebase
1. Create a project at console.firebase.google.com.
2. **Authentication** → enable Email/Password.
3. **Firestore** → create database.
4. Project settings → Web app → copy the config into the `NEXT_PUBLIC_FIREBASE_*` vars.
5. Project settings → Service accounts → Generate new private key → JSON download gives you `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. **Never commit this file** — extract the three values into `.env.local` and delete it.
6. Deploy security rules once linked (`firebase.json`/`.firebaserc` are already set up): `firebase deploy --only firestore`.

### Mux
1. Create an account at mux.com, get `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` from Settings → Access Tokens.
2. Settings → Signing Keys → create one → gives `MUX_SIGNING_KEY_ID` and the base64 private key (`MUX_SIGNING_KEY_PRIVATE`). This is what makes lesson playback un-guessable — every asset must be created with `playback_policy: "signed"`.
3. Settings → Webhooks → point at `https://<your-domain>/api/mux/webhook`, copy the signing secret into `MUX_WEBHOOK_SECRET`.

### Razorpay
1. Create an account at razorpay.com (test mode is fine to start).
2. API Keys → generate → `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (also set `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the same key id).
3. Webhooks → add `https://<your-domain>/api/razorpay/webhook`, subscribe to `payment.captured`, copy the secret into `RAZORPAY_WEBHOOK_SECRET`.
4. Until these are set, the site runs in **test-payment mode** automatically (see below) — no code change needed when you do add them.

## Adding course content (no admin UI yet)

There's no admin dashboard — courses/lessons are managed with scripts against Firestore/Mux directly:

- **Course copy + price**: edit `src/content/courses/geo-blueprint.ts`, then `npm run seed` to push it to Firestore.
- **Lesson video**: drop the video file anywhere in the repo (the root is fine — `*.mp4`/`.mov`/`.mkv`/`.webm` are gitignored so it can never get committed), then:
  ```
  npm run upload-lesson -- <videoFile> <lessonId> <order> "<title>"
  ```
  This uploads to Mux with `playback_policy: "signed"` (a manual Mux dashboard upload defaults to **public**, which would bypass the entire protection scheme — always use this script instead) and writes the lesson doc. **Delete the local video file once it's uploaded** — Mux is its permanent home; the file should never be deployed with the app or sitting in the repo.
- **Instructor photo / other marketing images**: belong in `public/images/`, referenced as `/images/whatever.jpg`. That's the only place static assets should live — never the repo root.

## Test-payment mode

`CheckoutButton` auto-detects whether `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set. While it's blank:
- Clicking Enroll opens a "Test mode" modal instead of real Razorpay, with **Simulate successful payment** / **Simulate failed payment** buttons.
- Simulating success calls `/api/test/simulate-payment`, which grants course access exactly like a real payment would (creates/signs in a guest account, etc.) — so the entire post-purchase flow (dashboard, video playback) is testable end to end without Razorpay.
- That test endpoint hard-refuses to run the moment `RAZORPAY_KEY_ID` is set server-side, so it can't be a backdoor once payments are live.

Once real Razorpay keys are added, this flips to the real checkout automatically — nothing else to change.

## What's scaffolded vs. what's still needed

Done: guest checkout, login/signup (cross-linked, both work), session cookies, dashboard, secure video playback (verified end-to-end against a real Mux asset), Firestore rules (deployed), landing page content, test-payment mode.

Still needed:
- Real Razorpay keys (see above) — the only thing blocking real payments.
- Firebase Storage isn't provisioned on the project yet (one-time manual step in the console: Storage → Get Started) — not urgent, nothing depends on it yet.
- Real testimonials (currently placeholder quotes).
- Legal pages (Terms, Privacy, Refund policy) — Razorpay requires these live on the site before approving the account for real payments.
- Deploy target (Vercel recommended) + wiring the Mux/Razorpay webhook URLs to that domain.
- `middleware.ts` uses Next's now-deprecated middleware convention (proxy is the replacement) — fine functionally, worth migrating later with `npx @next/codemod@canary middleware-to-proxy .`.

### Deferred from the 2026-09-18 UX/security review (next up)
Everything critical from that review is already fixed (see git log). These are the lower-priority items from the same three-agent audit that were explicitly deferred, not forgotten:
- No mobile hamburger menu on the marketing nav — "Log in" and the anchor links (`Curriculum`/`FAQ`) are `hidden sm:inline` with no fallback, so they're unreachable from the nav on phones.
- No rate-limiting/abuse controls on guest-facing endpoints (`create-order`, `verify`, `simulate-payment`) — all accept unauthenticated requests keyed only by a client-supplied email.
- `courseId` isn't existence-checked in `/api/razorpay/verify`, the webhook, or `/api/test/simulate-payment` (only `create-order` checks it) — low impact today (single course), worth hardening before multi-course.
- `firestore.rules` `allow list: if true` on lessons returns full lesson docs (including `muxPlaybackId`/`muxAssetId`) to any unauthenticated client via a collection query. Currently safe only because Mux assets are signed-policy, so the ID alone doesn't unlock playback — but it's a fragile backstop. Consider moving those fields off the publicly-listable doc.
- `/api/auth/session` has no CSRF protection (no origin check, `sameSite: "lax"`) — low real impact since nothing sensitive is currently authorized by the session cookie itself (see AGENTS.md's note that RSCs don't actually verify it — everything protected goes through Firestore rules or ID-token checks instead), but worth an origin check for defense-in-depth.
- General UX pass: anything else from a fresh look at the full user flow (marketing → signup/login → checkout → dashboard → video) that reads as unpolished or inconsistent, now that the functional bugs are fixed.

### Mux feature audit (next up)
Only signed playback + basic thumbnail tokens are wired up right now. Mux's free/included tier has a lot more that isn't being used — do a proper audit and integrate what's worth it for course-video delivery quality:
- Auto-generated captions/subtitles (`mux.video.assets.generateSubtitles` — seen in the SDK's method list, unused so far).
- Mux Data analytics (viewer engagement, playback quality/rebuffering stats) — currently only using Mux Video, not Mux Data.
- Storyboards/animated GIF previews for scrubbing (`createStaticRendition`, GIF endpoints).
- Scene/shot detection (`retrieveShots`/`generateShots`) if useful for chaptering lessons.
- Mux CLI for local dev/asset management workflows, instead of only the Node SDK via scripts.
- Richer `@mux/mux-player-react` features beyond the bare signed player currently used (chapters, playback rate control, better poster/loading states, resumption/watch-progress).
- MP4 static renditions if a downloadable option is ever wanted (weigh against the signed-only protection model — would need its own signed-download flow, not a plain public MP4).
