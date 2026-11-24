import type { ReactNode } from "react";
import Image from "next/image";

/**
 * A wide infographic that never scrolls sideways and never gets cropped.
 *
 * From `sm` up it is the picture, scaled to the column. On a phone the picture's baked-in text would be
 * far too small, so the caller picks one of:
 *  - `mobile`: a native HTML version of the same content, shown instead of the picture on phones;
 *  - `hideOnMobile`: skip it on phones (use when the same facts are already in text right next to it);
 *  - neither: the picture just scales down to the screen width.
 */
export function WideImage({
  src,
  alt,
  width,
  height,
  sizes,
  className = "",
  mobile,
  hideOnMobile = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  mobile?: ReactNode;
  hideOnMobile?: boolean;
  /** Kept so existing callers still compile; no longer used. */
  dark?: boolean;
  /** Kept so existing callers still compile; no longer used. */
  minWidth?: string;
}) {
  // The caller's top margin belongs to the wrapper, the rest of the classes to the image.
  const margin = className.split(/\s+/).filter((c) => /^mt-/.test(c)).join(" ");
  const imageClasses = className.split(/\s+/).filter((c) => c && !/^mt-/.test(c)).join(" ");
  const swapped = Boolean(mobile) || hideOnMobile;
  return (
    <div className={`min-w-0 max-w-full ${margin} ${hideOnMobile ? "hidden sm:block" : ""}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={`${imageClasses} h-auto w-full max-w-full ${swapped ? "hidden sm:block" : ""}`}
      />
      {mobile && <div className="sm:hidden">{mobile}</div>}
    </div>
  );
}
