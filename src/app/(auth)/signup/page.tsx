"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { syncSessionCookie } from "@/lib/firebase/auth-context";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await syncSessionCookie(user);
      router.push(searchParams.get("redirect") ?? "/dashboard");
    } catch {
      setError("Could not create account. Try a different email.");
    } finally {
      setSubmitting(false);
    }
  }

  const redirect = searchParams.get("redirect");
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login";

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-6 text-black">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 text-lg font-bold tracking-tight">
          dfren<span className="text-neutral-400">Learn</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Buying the course? You don&apos;t need this — just click Enroll and pay,
          an account is created for you automatically.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-black px-3 py-2"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-black px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-black px-4 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
