<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# dfrenLearn — Project Rules

Course platform: landing page → paid signup → protected video lessons.

## Tech Stack
- **Next.js 15** (App Router, TypeScript, Tailwind, `src/` dir)
- **Firebase**: Auth (email/password + Google), Firestore (courses/lessons/users/enrollments), Storage (thumbnails/assets)
- **Mux**: video hosting/streaming. Assets created with `playback_policy: "signed"` — never `"public"`. Playback always goes through a short-lived signed token issued server-side (`/api/mux/playback-token`), never a raw playback ID shipped to the client.
- **Razorpay**: payments. Orders created server-side (`/api/razorpay/create-order`), verified via signature on both the checkout handler and the webhook (`/api/razorpay/webhook`). Enrollment is only ever granted from the verified webhook, never from the client-side success callback alone.

## Architecture
- `src/lib/firebase/client.ts` — browser SDK, safe for client components.
- `src/lib/firebase/admin.ts` — service-account SDK, server-only (API routes, RSCs). Never import into a client component.
- `src/lib/mux/` — server SDK + signed-playback-token helper.
- `src/lib/razorpay/` — server SDK + signature verification helpers.
- Auth: Firebase ID token (client) → exchanged for an httpOnly session cookie via `/api/auth/session` → `middleware.ts` gates `/dashboard/*` on cookie presence → server routes/RSCs do the real `adminAuth.verifySessionCookie` check.
- Firestore layout: `courses/{courseId}`, `courses/{courseId}/lessons/{lessonId}`, `users/{uid}/enrollments/{courseId}`.

## Rules
- Never expose `RAZORPAY_KEY_SECRET`, `FIREBASE_PRIVATE_KEY`, `MUX_TOKEN_SECRET`, or `MUX_SIGNING_KEY_PRIVATE` to the client — server-only env vars, no `NEXT_PUBLIC_` prefix.
- Never grant course access from a client-reported "payment succeeded" event — only from the verified Razorpay webhook.
- Every new Mux asset must set `playback_policy: "signed"` and pass `passthrough: "<courseId>:<lessonId>"` so the webhook can locate the Firestore doc to update.
- Firestore security rules must deny direct client reads of `lessons.muxPlaybackId`/`muxAssetId` for non-enrolled users — playback IDs are only ever handed out via the signed API route.
- No `git push` — this repo is set up for the user to push manually. Tell them when a push is ready; do not run it yourself.

