import Link from "next/link";
import { CourseCta } from "@/components/marketing/course-cta";
import { geoBlueprintCourse } from "@/content/courses/geo-blueprint";
import { rupeesFromPaise } from "@/lib/gst";

const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition hover:bg-accent-dark";
const OUTLINE =
  "inline-flex items-center justify-center rounded-xl border-2 border-accent px-7 py-3.5 text-base font-semibold text-accent transition hover:bg-accent hover:text-white";

/**
 * Buy prompt dropped at the end of a section. One visual hierarchy across the page:
 *  - "primary": solid accent, used where the reader has just seen proof or value and is ready to decide.
 *  - "secondary": outlined accent, a lighter nudge earlier in the story.
 *  - "soft": plain link that moves the reader to the next piece of persuasion instead of asking for money.
 * Each placement gets benefit-led copy and a one-line reassurance that matches what the reader just read.
 */
export function SectionCta({
  location,
  label,
  note,
  variant = "primary",
  href,
}: {
  location: string;
  label?: string;
  note?: string;
  variant?: "primary" | "secondary" | "soft";
  /** Only for variant="soft": where the link goes. */
  href?: string;
}) {
  const price = rupeesFromPaise(geoBlueprintCourse.pricing.priceInPaise);

  if (variant === "soft") {
    return (
      <div className="mt-12 text-center">
        <Link
          href={href ?? "#curriculum"}
          className="text-base font-semibold text-accent underline underline-offset-4 hover:text-accent-dark"
        >
          {label ?? "See what's inside the course"} ↓
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 flex flex-col items-center gap-3 text-center">
      <CourseCta
        courseId={geoBlueprintCourse.id}
        label={label ?? `Get the course for ₹${price}`}
        location={location}
        className={variant === "primary" ? PRIMARY : OUTLINE}
      />
      <p className="text-xs text-neutral-500">{note ?? "One-time payment · incl. GST · instant access"}</p>
    </div>
  );
}
