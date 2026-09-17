"use client";

import { useEffect, useState } from "react";
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
  const { user } = useAuth();
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
  }, [user, courseId]);

  if (!course || !courseId) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">{course.title}</h1>
      <p className="mt-1 text-neutral-600">{course.description}</p>

      {!enrolled && (
        <div className="mt-6">
          <CheckoutButton
            courseId={courseId}
            amountInPaise={course.priceInPaise}
            courseTitle={course.title}
          />
        </div>
      )}

      {enrolled && activeLessonId && (
        <div className="mt-6">
          <SecureVideoPlayer courseId={courseId} lessonId={activeLessonId} />
        </div>
      )}

      <ul className="mt-6 divide-y divide-neutral-200">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="py-3">
            <button
              disabled={!enrolled}
              onClick={() => setActiveLessonId(lesson.id)}
              className="text-left disabled:text-neutral-400"
            >
              {lesson.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
