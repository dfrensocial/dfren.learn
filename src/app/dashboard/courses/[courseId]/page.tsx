"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";
import { SecureVideoPlayer } from "@/components/course/secure-video-player";
import { CheckoutButton } from "@/components/course/checkout-button";
import type { Course, Lesson } from "@/types/course";

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

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  useEffect(() => {
    if (!courseId) return;

    getDoc(doc(db, "courses", courseId)).then((snap) => {
      if (snap.exists()) setCourse({ id: snap.id, ...snap.data() } as Course);
    });

    getDocs(query(collection(db, "courses", courseId, "lessons"), orderBy("order"))).then(
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson);
        setLessons(list);
        if (list[0]) setActiveLessonId(list[0].id);
      }
    );
  }, [courseId]);

  useEffect(() => {
    if (!user || !courseId) return;
    getDoc(doc(db, "users", user.uid, "enrollments", courseId)).then((snap) =>
      setEnrolled(snap.exists())
    );
    // Checkout success navigates here with ?purchased=1 via router.push — if
    // we were already mounted on this exact route (enrolled-first-then-buy),
    // that's a query-only change, not a remount, so re-run this check on it
    // or the just-granted enrollment never gets picked up.
  }, [user, courseId, justPurchased]);

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
                {!enrolled && (
                  <span aria-hidden className="text-neutral-400">
                    🔒
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
