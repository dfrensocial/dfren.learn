import Image from "next/image";
import Link from "next/link";
import type { CourseContent } from "@/content/courses/geo-blueprint";

export function Instructor({ instructor }: { instructor: CourseContent["instructor"] }) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:py-24 md:grid-cols-[minmax(0,380px)_1fr]">
        <div className="mx-auto w-full max-w-xs md:max-w-none">
          <div className="aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
            <Image
              src="/images/instructor.jpg"
              alt={instructor.name}
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            Litmus <span className="font-normal text-neutral-400">by AiVirex</span>
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Your instructor</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{instructor.name}</h2>
          <p className="mt-1 text-sm text-neutral-500">{instructor.title}</p>
          <p className="mt-5 leading-relaxed text-neutral-700">{instructor.bio}</p>
          <Link
            href={instructor.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-black"
          >
            LinkedIn ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
