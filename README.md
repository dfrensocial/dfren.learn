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
4. Auto-generated English subtitles are now requested on every upload (`upload-lesson.ts`/`test-mux-lesson.ts`) — no extra setup, it's Mux's built-in speech-to-text and the tracks are served inside the same signed HLS manifest as the video, so the player's CC button just works once a track finishes processing (usually shortly after the asset itself goes `ready`).
5. **Not set up yet — Mux Data (viewer engagement/QoE analytics):** needs a Mux Data **Environment Key**, which is separate from the Video API tokens above. Get one from the Mux dashboard → **Data** → **Environments** (safe to expose client-side — it's an analytics key, not a secret) and add it as `NEXT_PUBLIC_MUX_ENV_KEY`. Once that exists, pass `envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}` and a `metadata={{ video_id: lessonId, video_title: ..., viewer_user_id: user.uid }}` prop to `MuxPlayer` in `secure-video-player.tsx` — that's the entire integration, mux-player-react handles the beaconing itself. Left undone here because it needs an env var only the account owner can create.

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

### Mux feature audit (2026-09-22)
Done in this pass:
- **Auto-captions**: `new_asset_settings.inputs[0].generated_subtitles` set on every upload (`scripts/upload-lesson.ts`, `scripts/test-mux-lesson.ts`) — Mux's built-in ASR, included on standard plans. No player change needed to *display* them — subtitle tracks ride inside the same signed HLS manifest already unlocked by the existing video token, so the CC button just appears once the track is `ready`.
- **Storyboard scrub-preview thumbnails**: `signMuxPlaybackToken(playbackId, "storyboard")` was already implemented in `signing.ts` but unused — now wired through `/api/mux/playback-token` (returns `storyboardToken`) and `secure-video-player.tsx` (`tokens.storyboard`). Same signed-token model as video/thumbnail, just a different JWT audience; `mux-player-react` derives the `storyboard.vtt` URL from the playback ID automatically once the token is present.
- **Playback rate control**: `playbackRates` prop set on `MuxPlayer` (0.75x–2x) — visible in the player's settings menu.
- **Resume from last position**: `secure-video-player.tsx` reads/writes `localStorage` (`mux-progress:<courseId>:<lessonId>`) on the viewer's own device, throttled to ~1 write/5s of playback, cleared on `ended`. Purely a per-device convenience — never sent anywhere, never used for access control.

Deliberately not implemented — needs something only the account owner can provide:
- **Mux Data analytics** (viewer engagement, rebuffering/QoE) — needs a `NEXT_PUBLIC_MUX_ENV_KEY` from Mux dashboard → Data → Environments. See the Mux setup section above for the exact wiring once that key exists.
- **Chapters** (`MuxPlayer.addChapters()` / the `chapterchange` event) — needs per-lesson timestamp/title data that doesn't exist yet (no schema field for it, no content authored). Worth adding once lesson content design decides chapter markers matter; would need a new Firestore field (e.g. `lessons/{id}.chapters`) fed into the player via `ref.current.addChapters(...)` after mount.
- **Shot/scene detection** (`generateShots`/`retrieveShots`) — evaluated and skipped: it's for finding *visual* cut points in raw footage, not a fit for narrated single-camera course lessons, and there's no chaptering UI to feed it into anyway (see Chapters above).
- **MP4 static renditions / downloads** — skipped on purpose: a downloadable MP4 needs its own signed-download flow to avoid becoming a plain public URL, which conflicts with the signed-only protection model this app is built around. Not implementing without an explicit "let students download lessons" product decision.

Mux CLI — evaluated, not adopted: it's a scaffolding/local-dev tool (spin up a demo player, quick asset CRUD from a terminal) aimed at projects with no existing SDK integration. This repo already drives everything through `@mux/mux-node` in typed, reviewable scripts (`upload-lesson.ts`, `test-mux-lesson.ts`) wired into the same Firebase writes the CLI knows nothing about — the CLI would just be a second, weaker way to do half of what those scripts already do. Not worth adding.
