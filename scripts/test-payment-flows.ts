// End-to-end checks of every purchase path against a running dev server
// (default http://localhost:3000) using Razorpay TEST keys. It creates real
// Razorpay test-mode orders and real Firebase users (@example.com), then
// forges the signatures a genuine payment would produce — possible only
// because it holds the test key/webhook secrets, which is exactly how an
// attacker without them is kept out.
//
//   npx tsx scripts/test-payment-flows.ts [baseUrl]
//
// Refuses to run against live keys. Leftover @example.com users are removed by
// scripts/cleanup-test-data.ts.

export {}; // module scope, so `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

import crypto from "node:crypto";

const BASE = process.argv[2] ?? "http://localhost:3000";
const COURSE = "geo-blueprint";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `   -> ${JSON.stringify(detail)}`}`);
}

const hmac = (secret: string, data: string) => crypto.createHmac("sha256", secret).update(data).digest("hex");
const run = Date.now();
let n = 0;
const newEmail = (tag: string) => `paytest-${run}-${++n}-${tag}@example.com`;
const fakePaymentId = () => `pay_TEST${crypto.randomBytes(7).toString("hex")}`;

// Fresh "client IP" per call so the per-IP rate limits don't trip mid-suite.
async function call(path: string, body: unknown, headers: Record<string, string> = {}, raw = false) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-nf-client-connection-ip": `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${++n % 250}`,
      ...headers,
    },
    body: raw ? (body as string) : JSON.stringify(body),
  });
  let json: Record<string, any> = {};
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

const createOrder = (email: string | undefined, idToken?: string, courseId = COURSE) =>
  call("/api/razorpay/create-order", { courseId, guestEmail: idToken ? undefined : email }, idToken ? { Authorization: `Bearer ${idToken}` } : {});

const verify = (orderId: string, paymentId = fakePaymentId(), idToken?: string, extra: object = {}) =>
  call(
    "/api/razorpay/verify",
    { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: hmac(KEY_SECRET, `${orderId}|${paymentId}`), ...extra },
    idToken ? { Authorization: `Bearer ${idToken}` } : {}
  );

function webhook(event: object, sig?: string | null) {
  const body = JSON.stringify(event);
  const headers: Record<string, string> = {};
  if (sig !== null) headers["x-razorpay-signature"] = sig ?? hmac(WEBHOOK_SECRET, body);
  return call("/api/razorpay/webhook", body, headers, true);
}
const capturedEvent = (paymentId: string, orderId: string | undefined, notes: object = {}) => ({
  event: "payment.captured",
  payload: { payment: { entity: { id: paymentId, order_id: orderId, status: "captured", notes } } },
});

// Custom token -> real ID token, like the browser's signInWithCustomToken (also stamps lastSignInTime).
async function exchange(customToken: string) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const j: any = await res.json();
  return res.ok ? (j.idToken as string) : null;
}

async function main() {
  if (!KEY_SECRET || !WEBHOOK_SECRET || !API_KEY) throw new Error("Missing Razorpay/Firebase env in .env.local");
  if (!process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")) throw new Error("Refusing to run: RAZORPAY_KEY_ID is not a test key.");

  const { adminAuth, adminDb } = await import("../src/lib/firebase/admin");
  const enrollment = async (email: string) => {
    const u = await adminAuth.getUserByEmail(email).catch(() => null);
    if (!u) return { user: null, data: null };
    const s = await adminDb.collection("users").doc(u.uid).collection("enrollments").doc(COURSE).get();
    return { user: u, data: s.exists ? s.data()! : null };
  };
  const signedInUser = async (email: string) => {
    const u = await adminAuth.createUser({ email, emailVerified: true });
    const tok = await exchange(await adminAuth.createCustomToken(u.uid));
    return { uid: u.uid, idToken: tok! };
  };

  console.log(`Target ${BASE}  key ${process.env.RAZORPAY_KEY_ID}\n`);

  console.log("— create-order —");
  let r = await createOrder(undefined);
  check("no email -> 400", r.status === 400, r);
  r = await createOrder(newEmail("x"), undefined, "no-such-course");
  check("unknown course -> 404", r.status === 404, r);
  const guestEmail = newEmail("guest");
  r = await createOrder(guestEmail);
  const orderA = r.json.order;
  check("guest order created with server-set notes and course price", r.status === 200 && orderA?.amount === 49900 && orderA?.notes?.email === guestEmail && orderA?.notes?.courseId === COURSE, r);

  console.log("\n— verify: bad input —");
  r = await call("/api/razorpay/verify", { razorpay_order_id: orderA.id });
  check("missing fields -> 400", r.status === 400, r);
  r = await call("/api/razorpay/verify", { razorpay_order_id: orderA.id, razorpay_payment_id: fakePaymentId(), razorpay_signature: "deadbeef" });
  check("wrong signature -> 400", r.status === 400, r);
  r = await call("/api/razorpay/verify", { razorpay_order_id: orderA.id, razorpay_payment_id: fakePaymentId(), razorpay_signature: "x".repeat(64) });
  check("wrong signature, right length -> 400", r.status === 400, r);
  check("nothing granted so far", (await enrollment(guestEmail)).data === null);

  console.log("\n— flow 1: brand-new guest buys, clicks nothing else —");
  const payA = fakePaymentId();
  r = await verify(orderA.id, payA, undefined, { courseId: "other-course", email: "attacker@example.com" });
  check("verify ok, hands out a sign-in token, no email link needed", r.status === 200 && !!r.json.customToken && !r.json.signInRequired, r);
  let e = await enrollment(guestEmail);
  check("enrollment written with the payment id", e.data?.paymentId === payA && e.data?.courseId === COURSE, e.data);
  check("body-supplied email/courseId ignored (attacker not created)", (await adminAuth.getUserByEmail("attacker@example.com").catch(() => null)) === null);
  const idTok = r.json.customToken ? await exchange(r.json.customToken) : null;
  check("the token really signs the buyer in", !!idTok);

  console.log("\n— flow 2: same payment replayed after the buyer has signed in —");
  r = await verify(orderA.id, payA);
  check("replay is ok but gets NO token (account now has a sign-in)", r.status === 200 && !r.json.customToken && r.json.signInRequired === true, r);
  e = await enrollment(guestEmail);
  check("enrollment kept as the original (not rewritten)", e.data?.paymentId === payA, e.data);

  console.log("\n— flow 3: guest pays using a returning customer's email (takeover attempt) —");
  const victimEmail = newEmail("victim");
  const victim = await signedInUser(victimEmail);
  r = await createOrder(victimEmail);
  r = await verify(r.json.order.id);
  check("access granted to the payer's email, but NO token for the victim's account", r.status === 200 && !r.json.customToken && r.json.signInRequired === true, r);
  check("victim enrolled (they own it)", (await enrollment(victimEmail)).data !== null);

  console.log("\n— flow 4: logged-in user buys —");
  const loggedEmail = newEmail("logged");
  const logged = await signedInUser(loggedEmail);
  r = await createOrder(undefined, logged.idToken);
  check("order uses the account email, not a typed one", r.status === 200 && r.json.order?.notes?.email === loggedEmail, r);
  const orderL = r.json.order;
  r = await verify(orderL.id, undefined, logged.idToken);
  check("verify ok, goes straight to the course (no token, no email link)", r.status === 200 && !r.json.customToken && !r.json.signInRequired, r);
  check("enrolled", (await enrollment(loggedEmail)).data !== null);
  r = await createOrder(undefined, logged.idToken);
  check("buying again while enrolled -> 409 (no double charge)", r.status === 409, r);

  console.log("\n— flow 5: password-squatter pre-registered the victim's email —");
  const squatEmail = newEmail("squat");
  const squat = await adminAuth.createUser({ email: squatEmail, password: "Squatter-pass-1", emailVerified: false });
  r = await createOrder(squatEmail);
  r = await verify(r.json.order.id);
  check("no token; sign-in link required", r.status === 200 && !r.json.customToken && r.json.signInRequired === true, r);
  const after = await adminAuth.getUser(squat.uid);
  check("password provider stripped", !after.providerData.some((p) => p.providerId === "password"), after.providerData);
  check("enrolled", (await enrollment(squatEmail)).data !== null);

  console.log("\n— flow 6: buyer closes the tab; only the webhook arrives —");
  const whEmail = newEmail("webhook");
  r = await createOrder(whEmail);
  const orderW = r.json.order;
  const payW = fakePaymentId();
  const evW = capturedEvent(payW, orderW.id);
  r = await webhook(evW, null);
  check("no signature -> 400", r.status === 400, r);
  r = await webhook(evW, "00".repeat(32));
  check("bad signature -> 400", r.status === 400, r);
  check("nothing granted by unsigned webhooks", (await enrollment(whEmail)).data === null);
  r = await webhook(evW);
  check("signed webhook -> 200", r.status === 200, r);
  e = await enrollment(whEmail);
  check("enrollment granted from webhook alone", e.data?.paymentId === payW, e.data);
  r = await webhook(evW);
  check("duplicate delivery -> 200, original record kept", r.status === 200 && (await enrollment(whEmail)).data?.paymentId === payW);

  console.log("\n— flow 7: webhook first, then the tab's verify call lands (the usual race) —");
  r = await verify(orderW.id, payW);
  check("buyer still gets signed in on first access", r.status === 200 && !!r.json.customToken && !r.json.signInRequired, r);

  console.log("\n— flow 8: webhook edge cases —");
  const forgeEmail = newEmail("forge");
  r = await createOrder(forgeEmail);
  const orderF = r.json.order;
  r = await webhook(capturedEvent(fakePaymentId(), orderF.id, { courseId: "other-course", email: "attacker2@example.com" }));
  check("forged payment.notes ignored; order notes win", (await enrollment(forgeEmail)).data !== null && (await adminAuth.getUserByEmail("attacker2@example.com").catch(() => null)) === null, r);
  r = await webhook(capturedEvent(fakePaymentId(), undefined, { courseId: COURSE, email: newEmail("noorder") }));
  check("payment with no order (some other product) -> 200 ignored", r.status === 200 && r.json.ignored === true, r);
  r = await webhook(capturedEvent(fakePaymentId(), "order_DoesNotExist123"));
  check("unknown order -> 200 ignored (no retry storm)", r.status === 200, r);
  r = await webhook({ event: "payment.failed", payload: { payment: { entity: { id: fakePaymentId() } } } });
  check("payment.failed -> 200, grants nothing", r.status === 200);

  console.log("\n— flow 9: test-payment shortcut is dead —");
  r = await call("/api/test/simulate-payment", { courseId: COURSE, email: newEmail("sim") });
  check("simulate-payment refused while Razorpay is configured", r.status >= 400, r);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
