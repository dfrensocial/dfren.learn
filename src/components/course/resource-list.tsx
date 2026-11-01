"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";
import type { Resource } from "@/types/course";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatKind(contentType: string) {
  if (contentType === "application/pdf") return "PDF";
  if (contentType.includes("presentation")) return "Slides";
  if (contentType.includes("wordprocessing")) return "Doc";
  if (contentType.includes("spreadsheet")) return "Sheet";
  if (contentType.includes("zip")) return "ZIP";
  return "File";
}

/**
 * Downloadable materials for a course. Renders nothing when there are none
 * (or the viewer isn't enrolled — Firestore rules refuse the read), so it can
 * be dropped anywhere without a conditional.
 */
export function ResourceList({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // Deferred to a microtask so every setState here runs from a callback,
    // not directly in the effect body.
    Promise.resolve().then(() => {
      getDocs(query(collection(db, "courses", courseId, "resources"), orderBy("order")))
        .then((snap) => {
          if (!cancelled) setResources(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Resource));
        })
        .catch(() => !cancelled && setResources([]));
    });
    return () => {
      cancelled = true;
    };
  }, [user, courseId]);

  if (resources.length === 0) return null;

  return (
    <div className="border border-black">
      <h2 className="border-b border-black px-4 py-3 text-sm font-semibold">Downloads</h2>
      <ul className="divide-y divide-neutral-200">
        {resources.map((r) => (
          <li key={r.id}>
            <a
              href={`/api/resources/${courseId}/${r.id}`}
              download={r.filename}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
            >
              <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 flex-shrink-0 fill-none stroke-current stroke-[1.5]">
                <path d="M10 3v9m0 0-3.5-3.5M10 12l3.5-3.5M4 15v1.5h12V15" />
              </svg>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{r.title}</span>
                {r.description && <span className="mt-0.5 block text-xs text-neutral-500">{r.description}</span>}
                <span className="mt-1 block text-[11px] uppercase tracking-wide text-neutral-400">
                  {formatKind(r.contentType)} · {formatSize(r.size)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
