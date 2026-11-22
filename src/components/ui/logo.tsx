import Image from "next/image";

/** Brand mark (dfren logo) with the dfrenLearn wordmark beside it. Used in the white page headers. */
export function Logo({ tone = "text-neutral-500" }: { tone?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/images/dfren-logo.webp" alt="dfren" width={160} height={158} priority className="h-10 w-auto" />
      <span className="text-lg font-bold tracking-tight">
        dfren<span className={tone}>Learn</span>
      </span>
    </span>
  );
}
