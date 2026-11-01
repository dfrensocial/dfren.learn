"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";
import { LEGAL } from "@/content/legal";
import { ResourceList } from "@/components/course/resource-list";
import type { Course, CourseProgress } from "@/types/course";

type PurchasedCourse = {
  course: Course;
  purchasedAt: string | null;
  paymentId: string | null;
  lessonCount: number;
  percent: number;
  completed: boolean;
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<PurchasedCourse[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    // Deferred to a microtask so every setState here runs from a callback,
    // not directly in the effect body.
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setLoadError(false);
      try {
        const enrollments = await getDocs(collection(db, "users", user.uid, "enrollments"));
        const rows = await Promise.all(
          enrollments.docs.map(async (e): Promise<PurchasedCourse | null> => {
            const courseSnap = await getDoc(doc(db, "courses", e.id));
            if (!courseSnap.exists()) return null;
            const [lessons, progressSnap] = await Promise.all([
              getDocs(collection(db, "courses", e.id, "lessons")),
              getDoc(doc(db, "users", user.uid, "progress", e.id)).catch(() => null),
            ]);
            const progress = (progressSnap?.data() ?? {}) as CourseProgress;
            // Average watched fraction across all lessons; unwatched lessons count as 0.
            const fractions = lessons.docs.map((l) => {
              const p = progress.lessons?.[l.id];
              if (!p) return 0;
              return p.completed ? 1 : Math.min(1, p.duration > 0 ? p.position / p.duration : 0);
            });
            const percent = fractions.length
              ? Math.round((fractions.reduce((a, b) => a + b, 0) / fractions.length) * 100)
              : 0;
            return {
              course: { id: courseSnap.id, ...courseSnap.data() } as Course,
              purchasedAt: (e.data().purchasedAt as string) ?? null,
              paymentId: (e.data().paymentId as string) ?? null,
              lessonCount: lessons.size,
              percent,
              completed: percent >= 100,
            };
          })
        );
        if (!cancelled) setItems(rows.filter((r): r is PurchasedCourse => r !== null));
      } catch {
        if (!cancelled) setLoadError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, retryKey]);

  if (!loading && !user) {
    return (
      <p className="text-sm text-neutral-600">
        Your session has ended.{" "}
        <Link href="/login?redirect=/dashboard" className="font-medium underline">
          Log in again
        </Link>
        .
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-24 flex-col items-center justify-center gap-2 border border-black bg-neutral-50 text-center">
        <p className="text-sm text-neutral-600">Couldn&apos;t load your courses.</p>
        <button onClick={() => setRetryKey((k) => k + 1)} className="text-sm font-medium underline">
          Try again
        </button>
      </div>
    );
  }

  if (items === null) {
    return <div className="h-40 animate-pulse bg-neutral-100" />;
  }

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">My courses</h1>

        {items.length === 0 ? (
          <div className="mt-6 border border-black p-6">
            <p className="font-medium">You haven&apos;t enrolled in a course yet.</p>
            <p className="mt-1 text-sm text-neutral-600">
              If you paid with a different email, log out and sign in with that one.
            </p>
            <Link
              href="/#pricing"
              className="mt-4 inline-block bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              See the course
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {items.map(({ course, purchasedAt, lessonCount, percent, completed }) => (
              <li key={course.id} className="flex flex-col border border-black">
                <div className="flex-1 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {completed ? "Completed" : percent > 0 ? "In progress" : "Ready to start"}
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">{course.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{course.description}</p>
                  <p className="mt-4 text-xs text-neutral-500">
                    {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                    {formatDate(purchasedAt) ? ` · Purchased ${formatDate(purchasedAt)}` : ""}
                  </p>

                  <div className="mt-4">
                    <div
                      className="h-1.5 w-full bg-neutral-200"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${course.title} progress`}
                    >
                      <div className="h-full bg-black" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-500">{percent}% watched</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="bg-black px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {completed ? "Watch again" : percent > 0 ? "Continue watching" : "Start the course"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {items.length > 0 && (
        <section>
          <h2 className="text-lg font-bold tracking-tight">Course materials</h2>
          <div className="mt-4 max-w-xl space-y-6">
            {items.map(({ course }) => (
              <ResourceList key={course.id} courseId={course.id} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold tracking-tight">Your account</h2>
        <dl className="mt-4 divide-y divide-black border border-black text-sm">
          <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between">
            <dt className="text-neutral-500">Signed in as</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          {items.map(({ course, paymentId }) =>
            paymentId ? (
              <div key={course.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between">
                <dt className="text-neutral-500">Payment ID — {course.title}</dt>
                <dd className="font-mono text-xs">{paymentId}</dd>
              </div>
            ) : null
          )}
          <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between">
            <dt className="text-neutral-500">Need help?</dt>
            <dd>
              <a className="font-medium underline" href={`mailto:${LEGAL.contactEmail}`}>
                {LEGAL.contactEmail}
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
