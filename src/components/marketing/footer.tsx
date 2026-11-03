import Link from "next/link";
import { LEGAL } from "@/content/legal";
import { PrivacySettingsLink } from "@/components/consent/privacy-settings-link";

export function MarketingFooter() {
  return (
    <footer className="bg-black text-neutral-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-xs sm:flex-row sm:justify-between">
        <span>
          Made with <span aria-label="love">❤️</span> by{" "}
          <a href="https://aivirex.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            AiVirex
          </a>
        </span>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/blog" className="hover:text-white">Blog</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/refund-policy" className="hover:text-white">Refunds</Link>
          <PrivacySettingsLink className="hover:text-white" />
        </nav>
        <span>Contact: {LEGAL.contactEmail}</span>
      </div>
      <div className="mx-auto max-w-5xl px-6 pb-8 text-center text-xs text-neutral-400 sm:text-left">
        <p>
          dfrenLearn (Dfren) is run by {LEGAL.entity}, {LEGAL.entityType} in Tambaram, Chennai, Tamil Nadu. Courses and
          tools are by AiVirex Innovations. Page last updated{" "}
          <time dateTime={LEGAL.siteUpdatedISO}>4 November 2026</time>.
        </p>
      </div>
    </footer>
  );
}
