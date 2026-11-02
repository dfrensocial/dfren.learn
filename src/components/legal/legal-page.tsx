import Link from "next/link";
import { LEGAL } from "@/content/legal";
import { AccountLinks } from "@/components/marketing/account-links";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-black px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            dfren<span className="text-neutral-400">Learn</span>
          </Link>
          <nav className="flex items-center gap-6">
            <AccountLinks showEnroll />
          </nav>
        </div>
      </header>
      <article className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-neutral-800">
        <h1 className="text-3xl font-bold tracking-tight text-black">{title}</h1>
        <p className="mt-2 text-neutral-500">
          dfrenLearn is operated by {LEGAL.entity}. Last updated {LEGAL.updated}.
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
      </article>
    </main>
  );
}
