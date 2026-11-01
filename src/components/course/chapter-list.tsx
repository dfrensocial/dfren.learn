"use client";

import { useEffect, useRef } from "react";
import type { Chapter } from "@/types/course";

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function ChapterList({
  chapters,
  activeIndex,
  onSelect,
}: {
  chapters: Chapter[];
  activeIndex: number;
  onSelect: (startSeconds: number) => void;
}) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Keeps the playing chapter in view inside the list's own scroll area —
  // scrollIntoView would also scroll the whole page, which jumps the video
  // off-screen on small screens.
  useEffect(() => {
    const list = listRef.current;
    const active = activeRef.current;
    if (!list || !active) return;
    const top = active.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + active.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: top - list.clientHeight / 3, behavior: "smooth" });
    }
  }, [activeIndex]);

  return (
    <div className="border border-black">
      <h2 className="border-b border-black px-4 py-3 text-sm font-semibold">
        Chapters <span className="font-normal text-neutral-500">({chapters.length})</span>
      </h2>
      <ol ref={listRef} className="relative max-h-[420px] overflow-y-auto lg:max-h-[560px]">
        {chapters.map((chapter, i) => {
          const isActive = i === activeIndex;
          const showGroup = chapter.group && chapter.group !== chapters[i - 1]?.group;
          return (
            <li key={chapter.start}>
              {showGroup && (
                <p className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  {chapter.group}
                </p>
              )}
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(chapter.start)}
                aria-current={isActive ? "true" : undefined}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  isActive ? "bg-black text-white" : "hover:bg-neutral-50"
                }`}
              >
                <span
                  className={`mt-0.5 w-12 flex-shrink-0 font-mono text-xs ${
                    isActive ? "text-neutral-300" : "text-neutral-400"
                  }`}
                >
                  {formatTime(chapter.start)}
                </span>
                <span>{chapter.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
