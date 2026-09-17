"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Course } from "@/types/course";

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    getDocs(collection(db, "courses")).then((snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course));
    });
  }, []);

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
