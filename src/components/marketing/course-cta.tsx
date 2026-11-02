"use client";

import Link from "next/link";
import { useEnrollment } from "@/lib/firebase/use-enrollment";
import { track } from "@/lib/analytics";

/**
 * A call-to-action that points at the pricing section for visitors, but at the
 * course itself for someone who already owns it -- no "Enroll" for a buyer.
 */
export function CourseCta({
  courseId,
  label,
  className,
  location = "other",
}: {
  courseId: string;
  label: string;
  className: string;
  /** Where on the page this CTA sits, for analytics (hero / final). */
  location?: string;
}) {
  const { enrolled } = useEnrollment(courseId);

  if (enrolled) {
    return (
      <Link
        href={`/dashboard/courses/${courseId}`}
        className={className}
        onClick={() => track("cta_click", { cta_location: location, cta_label: "continue_learning" })}
      >
        Continue learning
      </Link>
    );
  }
  return (
    <Link
      href="#pricing"
      className={className}
      onClick={() => track("cta_click", { cta_location: location, cta_label: "enroll" })}
    >
      {label}
    </Link>
  );
}
