import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_PRIVATE_KEY?.trim()
  );
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured (FIREBASE_* env vars missing)");
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Escaped newlines in env vars must be restored before use.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, "\n"),
    }),
  });
}

// Initialized on first use, not at import — so a deploy without env vars
// still builds and serves the public pages; only routes that actually touch
// Firebase Admin fail (and they already catch/return errors).
function lazy<T extends object>(factory: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_, prop) {
      instance ??= factory();
      const value = Reflect.get(instance, prop, instance);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

export const adminAuth: Auth = lazy(() => getAuth(getAdminApp()));
export const adminDb: Firestore = lazy(() => getFirestore(getAdminApp()));
