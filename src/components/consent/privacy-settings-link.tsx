"use client";

import { openPrivacySettings } from "@/lib/consent";

/** Reopens the privacy choices panel. Put it wherever a policy or footer is shown. */
export function PrivacySettingsLink({
  className = "underline",
  children = "Privacy settings",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openPrivacySettings} className={className}>
      {children}
    </button>
  );
}
