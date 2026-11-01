import Link from "next/link";
import { LEGAL } from "@/content/legal";

export function MarketingFooter() {
  return (
    <footer className="bg-black text-neutral-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-xs sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} dfrenLearn.</span>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/refund-policy" className="hover:text-white">Refunds</Link>
        </nav>
        <span>Contact: {LEGAL.contactEmail}</span>
      </div>
    </footer>
  );
}
