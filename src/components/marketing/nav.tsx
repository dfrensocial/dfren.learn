"use client";

import { useState } from "react";
import Link from "next/link";

export function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          dfren<span className="text-neutral-400">Learn</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="#curriculum" className="hidden sm:inline hover:underline">
            Curriculum
          </Link>
          <Link href="#faq" className="hidden sm:inline hover:underline">
            FAQ
          </Link>
          <Link href="/login" className="hidden sm:inline hover:underline">
            Log in
          </Link>
          <Link
            href="#pricing"
            className="rounded-full bg-black px-5 py-2 text-white transition hover:bg-neutral-800"
          >
            Enroll now
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 border border-black sm:hidden"
          >
            <span
              className={`block h-0.5 w-4 bg-black transition-transform ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-4 bg-black transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-4 bg-black transition-transform ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </nav>
      </div>
      {menuOpen && (
        <div className="flex flex-col border-t border-black bg-white sm:hidden">
          <Link
            href="#curriculum"
            onClick={() => setMenuOpen(false)}
            className="border-b border-black px-6 py-4 text-sm font-medium"
          >
            Curriculum
          </Link>
          <Link
            href="#faq"
            onClick={() => setMenuOpen(false)}
            className="border-b border-black px-6 py-4 text-sm font-medium"
          >
            FAQ
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-sm font-medium"
          >
            Log in
          </Link>
        </div>
      )}
    </header>
  );
}
