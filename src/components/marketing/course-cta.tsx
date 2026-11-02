"use client";

import Link from "next/link";
import { useEnrollment } from "@/lib/firebase/use-enrollment";

/**
 * A call-to-action that points at the pricing section for visitors, but at the
 * course itself for someone who already owns it -- no "Enroll" for a buyer.
 */
export function CourseCta({
  courseId,
  label,
  className,
}: {
  courseId: string;
  label: string;
  className: string;
}) {
  const { enrolled } = useEnrollment(courseId);

  if (enrolled) {
    return (
      <Link href={`/dashboard/courses/${courseId}`} className={className}>
        Continue learning
      </Link>
    );
  }
  return (
    <Link href="#pricing" className={className}>
      {label}
    </Link>
  );
}
