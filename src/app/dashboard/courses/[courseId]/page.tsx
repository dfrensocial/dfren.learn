"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";
import { SecureVideoPlayer } from "@/components/course/secure-video-player";
import { CheckoutButton } from "@/components/course/checkout-button";
import type { Course, Lesson } from "@/types/course";

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="h-4 w-4 flex-shrink-0 fill-none stroke-current stroke-[1.5]"
    >
      <rect x="4" y="9" width="12" height="8" rx="1" />
      <path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  );
}

export default function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Suspense>
      <CourseView params={params} />
    </Suspense>
  );
}

function CourseView({ params }: { params: Promise<{ courseId: string }> }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const justPurchased = searchParams.get("purchased") === "1";

  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    // Deferred to a microtask so every setState here runs from a callback,
    // not directly in the effect body.
    Promise.resolve().then(() => {
      if (cancelled) return;

      // Reset every piece of course-scoped state up front — Next.js reuses
      // this component across navigations between two values of the same
      // dynamic route segment, so without this a previous course's data
      // (including `enrolled`) would stay visible under the new courseId
      // until the new fetches resolve.
      setCourse(null);
      setLessons([]);
      setActiveLessonId(null);
      setEnrolled(false);
      setLoadError(false);

      getDoc(doc(db, "courses", courseId))
        .then((snap) => {
          if (cancelled) return;
          if (snap.exists()) setCourse({ id: snap.id, ...snap.data() } as Course);
          else setLoadError(true);
        })
        .catch(() => !cancelled && setLoadError(true));

      getDocs(query(collection(db, "courses", courseId, "lessons"), orderBy("order")))
        .then((snap) => {
          if (cancelled) return;
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson);
          setLessons(list);
          if (list[0]) setActiveLessonId(list[0].id);
        })
        .catch(() => !cancelled && setLoadError(true));
    });

    return () => {
      cancelled = true;
    };
  }, [courseId, retryKey]);

  useEffect(() => {
    if (!user || !courseId) return;
    let cancelled = false;
    getDoc(doc(db, "users", user.uid, "enrollments", courseId))
      .then((snap) => !cancelled && setEnrolled(snap.exists()))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
    // Checkout success navigates here with ?purchased=1 via router.push — if
    // we were already mounted on this exact route (enrolled-first-then-buy),
    // that's a query-only change, not a remount, so re-run this check on it
    // or the just-granted enrollment never gets picked up.
  }, [user, courseId, justPurchased]);

  if (loadError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 border border-black bg-neutral-50 text-center">
        <p className="text-sm text-neutral-600">Couldn&apos;t load this course.</p>
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          className="text-sm font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!course || !courseId) {
    return <div className="h-64 animate-pulse bg-neutral-100" />;
  }

  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  return (
    <div>
      {justPurchased && (
        <div className="mb-6 border border-black bg-neutral-50 px-4 py-3 text-sm font-medium">
          You&apos;re enrolled — welcome in.
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
      <p className="mt-1 text-neutral-600">{course.description}</p>

      {!enrolled && (
        <div className="mt-6 max-w-xs">
          <CheckoutButton courseId={courseId} courseTitle={course.title} />
        </div>
      )}

      {enrolled && activeLessonId && (
        <div className="mt-6">
          {activeLesson && (
            <p className="mb-2 text-sm font-medium text-neutral-500">
              Now playing: {activeLesson.title}
            </p>
          )}
          <SecureVideoPlayer courseId={courseId} lessonId={activeLessonId} />
        </div>
      )}

      {lessons.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">Lessons coming soon.</p>
      )}

      {lessons.length > 0 && (
        <ol className="mt-6 divide-y divide-black border border-black">
          {lessons.map((lesson, i) => {
            const isActive = enrolled && lesson.id === activeLessonId;
            return (
              <li key={lesson.id}>
                <button
                  disabled={!enrolled}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                    isActive ? "bg-black text-white" : "disabled:text-neutral-400"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isActive ? "text-neutral-400" : "text-neutral-300"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">{lesson.title}</span>
                  {!enrolled && <LockIcon />}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
