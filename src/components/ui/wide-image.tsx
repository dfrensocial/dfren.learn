import Image from "next/image";

/**
 * A wide infographic that stays readable on a phone: below the `sm` breakpoint it keeps a minimum
 * width and the visitor swipes sideways inside the rounded frame; from `sm` up it simply fits the column.
 * (`min-w-0` on every wrapper stops the minimum width from stretching a grid/flex parent and the page.)
 */
export function WideImage({
  src,
  alt,
  width,
  height,
  sizes,
  className = "",
  dark = false,
  minWidth = "min-w-[640px]",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  /** Hint text colour for black sections. */
  dark?: boolean;
  minWidth?: string;
}) {
  // The caller's top margin belongs to the wrapper, the rest of the classes to the image.
  const margin = className.split(/\s+/).filter((c) => /^mt-/.test(c)).join(" ");
  const imageClasses = className.split(/\s+/).filter((c) => c && !/^mt-/.test(c)).join(" ");
  return (
    <div className={`min-w-0 max-w-full ${margin}`}>
      <div className="min-w-0 overflow-x-auto rounded-2xl sm:overflow-visible">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={`${imageClasses} h-auto w-full max-w-none ${minWidth} sm:min-w-0 sm:max-w-full`}
        />
      </div>
      <p className={`mt-1.5 text-center text-[11px] sm:hidden ${dark ? "text-neutral-500" : "text-neutral-400"}`}>
        Swipe to see the full picture →
      </p>
    </div>
  );
}
