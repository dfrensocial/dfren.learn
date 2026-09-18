"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Course } from "@/types/course";

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    getDocs(collection(db, "courses")).then((snap) => {
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

  if (courses === null) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Your courses</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <li key={course.id} className="rounded-lg border border-neutral-200 p-4">
            <Link href={`/dashboard/courses/${course.id}`} className="font-medium">
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
