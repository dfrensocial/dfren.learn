import Image from "next/image";
import Link from "next/link";
import type { CourseContent } from "@/content/courses/geo-blueprint";

export function Instructor({
  instructor,
}: {
  instructor: CourseContent["instructor"];
}) {
  return (
    <section className="border-b border-black">
      <div className="mx-auto grid max-w-4xl gap-8 px-6 py-16 sm:grid-cols-[200px_1fr] sm:py-20">
        <div className="mx-auto aspect-square w-40 overflow-hidden rounded-full sm:mx-0 sm:w-full">
          <Image
            src="/images/instructor.jpg"
            alt={instructor.name}
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your instructor</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {instructor.name} — {instructor.title}
          </p>
          <p className="mt-3 text-neutral-700">{instructor.bio}</p>
          <Link
            href={instructor.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium underline"
          >
            LinkedIn ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
