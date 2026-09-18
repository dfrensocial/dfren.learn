"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Course } from "@/types/course";

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    // Firestore rules gate reads on `published == true`; an unfiltered list
    // query can't satisfy that per-document, so the query itself must filter
    // on it too, or Firestore rejects the whole list with a permissions error.
    const coursesQuery = query(collection(db, "courses"), where("published", "==", true));
    getDocs(coursesQuery).then((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course);
      // Single-course-site shortcut: skip the list, go straight to the course.
      // Once a second course exists this naturally falls through to the list below.
      if (list.length === 1) {
        router.replace(`/dashboard/courses/${list[0].id}`);
        return;
      }
      setCourses(list);
    });
  }, [router]);

  if (courses === null) {
    return <div className="h-24 animate-pulse bg-neutral-100" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Your courses</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <li key={course.id} className="border border-black p-4">
            <Link href={`/dashboard/courses/${course.id}`} className="font-semibold">
              {course.title}
            </Link>
            <p className="mt-1 text-sm text-neutral-600">{course.description}</p>
          </li>
        ))}
        {courses.length === 0 && (
          <p className="text-sm text-neutral-500">No courses published yet.</p>
        )}
      </ul>
    </div>
  );
}
