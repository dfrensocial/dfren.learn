import { SectionCta } from "@/components/marketing/section-cta";
import Image from "next/image";
import type { CourseContent } from "@/content/courses/geo-blueprint";

const BONUS_IMAGES = ["/images/geo/questionnaire-document.webp", "/images/geo/prompt-pack-terminal.webp"];

export function Bonus({ bonus }: { bonus: CourseContent["bonus"] }) {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-6 pb-16 sm:pb-24">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{bonus.heading}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {bonus.items.map((item, i) => (
            <div key={item.title} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <Image
                src={BONUS_IMAGES[i] ?? BONUS_IMAGES[0]}
                alt=""
                width={1200}
                height={900}
                sizes="(min-width: 640px) 400px, 100vw"
                className="h-auto w-full"
              />
              <div className="p-6">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <SectionCta
          location="bonus"
          label="Get the course and the working files"
          note="Checklist, client questionnaire and prompt pack included · incl. GST"
        />
      </div>
    </section>
  );
}
