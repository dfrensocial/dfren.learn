# dfrenLearn

Course platform. Landing page → signup → Razorpay checkout → protected video lessons via Mux.

## Stack
Next.js 15 (App Router, TS, Tailwind) · Firebase (Auth, Firestore, Storage) · Mux (signed video playback) · Razorpay (payments)

Architecture and rules: see [AGENTS.md](./AGENTS.md).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in every value (see below for where each comes from).
3. `npm run dev`

### Firebase
1. Create a project at console.firebase.google.com.
2. **Authentication** → enable Email/Password (and Google, if wanted).
3. **Firestore** → create database → deploy `firestore.rules` (`firebase deploy --only firestore:rules`).
4. **Storage** → deploy `storage.rules` (`firebase deploy --only storage`).
5. Project settings → Web app → copy the config into the `NEXT_PUBLIC_FIREBASE_*` vars.
6. Project settings → Service accounts → Generate new private key → JSON download gives you `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (keep the `\n`s escaped when pasting into `.env.local`).

### Mux
1. Create an account at mux.com, get `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` from Settings → Access Tokens.
2. Settings → Signing Keys → create one → gives `MUX_SIGNING_KEY_ID` and the base64 private key (`MUX_SIGNING_KEY_PRIVATE`). This is what makes lesson playback un-guessable — every asset must be created with `playback_policy: "signed"`.
3. Settings → Webhooks → point at `https://<your-domain>/api/mux/webhook`, copy the signing secret into `MUX_WEBHOOK_SECRET`.

### Razorpay
1. Create an account at razorpay.com (test mode is fine to start).
2. API Keys → generate → `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (also set `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the same key id).
3. Webhooks → add `https://<your-domain>/api/razorpay/webhook`, subscribe to `payment.captured`, copy the secret into `RAZORPAY_WEBHOOK_SECRET`.

## What's scaffolded vs. what's still needed
Done: auth (login/signup/session cookie), landing page skeleton, dashboard course list/detail, secure video player, checkout button, both webhooks, Firestore/Storage rules.

Still needed before this is usable:
- Admin UI (or a script) to create courses/lessons in Firestore and upload video to Mux with `passthrough: "<courseId>:<lessonId>"`.
- Real landing page content/design and course marketing copy.
- Deploy target (Vercel recommended) + wiring the webhook URLs above to that domain.
- `middleware.ts` uses Next's now-deprecated middleware convention (proxy is the replacement) — fine functionally, worth migrating later with `npx @next/codemod@canary middleware-to-proxy .`.
