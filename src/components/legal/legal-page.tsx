import Link from "next/link";
import { LEGAL } from "@/content/legal";
import { SITE_URL } from "@/lib/site";
import { AccountLinks } from "@/components/marketing/account-links";
import { PrivacySettingsLink } from "@/components/consent/privacy-settings-link";
import { Logo } from "@/components/ui/logo";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    inLanguage: "en-IN",
    datePublished: LEGAL.publishedISO,
    dateModified: LEGAL.updatedISO,
    publisher: { "@type": "Organization", name: LEGAL.entity, url: SITE_URL },
    author: { "@type": "Organization", name: `${LEGAL.brand} team`, url: SITE_URL },
  };
  return (
    <main className="min-h-screen bg-white text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-black px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
          <Logo />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/about" className="hidden sm:inline hover:underline">
              About
            </Link>
            <Link href="/blog" className="hidden sm:inline hover:underline">
              Blog
            </Link>
            <AccountLinks showEnroll />
          </nav>
        </div>
      </header>
      <article className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-neutral-800">
        <h1 className="text-3xl font-bold tracking-tight text-black">{title}</h1>
        <p className="mt-2 text-neutral-500">
          By the dfrenLearn team at {LEGAL.entity}. Published{" "}
          <time dateTime={LEGAL.publishedISO}>2 November 2026</time>. Last updated{" "}
          <time dateTime={LEGAL.updatedISO}>{LEGAL.updated}</time>.
        </p>
        <div className="mt-8 space-y-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-black [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1">
          {children}
        </div>
        <p className="mt-12 border-t border-black pt-6 text-neutral-600">
          Questions about this page? Email{" "}
          <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </a>
          .
        </p>
        <p className="mt-3 text-xs text-neutral-600">
          Official sources:{" "}
          <a
            href="https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Digital Personal Data Protection Act, 2023
          </a>
          {" · "}
          <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">
            Razorpay (our payment processor)
          </a>
          .
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          <Link href="/terms" className="underline">Terms</Link> ·{" "}
          <Link href="/privacy" className="underline">Privacy</Link> ·{" "}
          <Link href="/refund-policy" className="underline">Refunds</Link> ·{" "}
          <PrivacySettingsLink />
        </p>
      </article>
    </main>
  );
}
