"use client";

import { useState } from "react";
import { LEGAL } from "@/content/legal";

/**
 * "Request account deletion" with a clear warning first. Deleting an account ends
 * the "lifetime" access, so we ask for an explicit tick before the mail draft
 * opens. The request itself is handled by hand (scripts/erase-user.ts).
 */
export function DeleteRequest({ email, className }: { email?: string | null; className?: string }) {
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const subject = encodeURIComponent("Delete my dfrenLearn account");
  const body = encodeURIComponent(
    `Please delete my dfrenLearn account${email ? ` (${email})` : ""} and my data.\n\nI understand that I will lose access to the course and that the payment is not refunded.`,
  );
  const href = `mailto:${LEGAL.contactEmail}?subject=${subject}&body=${body}`;

  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} className={className} aria-expanded={open}>
        Request account deletion
      </button>
      {open && (
        <div className="mt-3 w-full basis-full border border-black bg-neutral-50 p-4 text-sm text-neutral-800">
          <p className="font-semibold">Before you delete your account</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You will lose access to the course. This applies even though it was sold as lifetime access.</li>
            <li>Your progress and sign-in are removed. We can&apos;t restore them later without a new purchase.</li>
            <li>The payment is not refunded.</li>
            <li>We keep only what the law requires, such as payment and tax records.</li>
          </ul>
          <label className="mt-3 flex items-start gap-2">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-1" />
            <span>I understand I will lose access to the course.</span>
          </label>
          {understood ? (
            <a href={href} className="mt-3 inline-block bg-black px-4 py-2 font-semibold text-white">
              Email my deletion request
            </a>
          ) : (
            <span className="mt-3 inline-block cursor-not-allowed bg-neutral-300 px-4 py-2 font-semibold text-white" aria-disabled="true">
              Email my deletion request
            </span>
          )}
          <p className="mt-2 text-xs text-neutral-600">
            Send it from the email on your account. We reply within {LEGAL.grievanceAckHours} hours and confirm with you before we delete anything.
          </p>
        </div>
      )}
    </>
  );
}
