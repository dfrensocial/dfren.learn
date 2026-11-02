"use client";

import Link from "next/link";

/**
 * The required box at login and checkout. Unticked unless this person already
 * ticked it for the current documents. Covers the Terms + Privacy Policy and
 * the 18+ declaration -- NOT analytics (that is a separate, optional choice).
 */
export function AcceptTerms({
  id,
  checked,
  onChange,
  className = "",
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label htmlFor={id} className={`flex cursor-pointer items-start gap-2 text-left text-xs leading-relaxed text-neutral-700 ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-black"
      />
      <span>
        I&apos;m 18 or older, I agree to the{" "}
        <Link href="/terms" target="_blank" className="underline">
          Terms
        </Link>{" "}
        and I&apos;ve read the{" "}
        <Link href="/privacy" target="_blank" className="underline">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}
