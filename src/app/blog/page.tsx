import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import { BlogShell } from "@/components/blog/blog-shell";
import { formatDate, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "GEO guides for learners in India | dfrenLearn blog",
  description: "Plain guides on learning GEO, AI SEO and AEO in India: courses compared by price, what the research says, and what to charge.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: { title: "GEO guides for learners in India", description: "Plain guides on learning GEO, AI SEO and AEO in India.", url: `${SITE_URL}/blog`, type: "website", siteName: "dfrenLearn", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn" }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const latest = posts.reduce((m, p) => (p.updated > m ? p.updated : m), posts[0]?.updated ?? "2026-11-04");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/blog#collection`,
    url: `${SITE_URL}/blog`,
    name: "Guides on learning GEO in India",
    description: "Sourced guides on GEO, AI SEO and AEO: where to learn them, what they cost and how to track results.",
    inLanguage: "en-IN",
    datePublished: "2026-11-03",
    dateModified: latest,
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 50).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };
  return (
    <BlogShell>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <h1 className="text-3xl font-bold tracking-tight">Guides on learning GEO in India</h1>
        <p className="mt-3 max-w-xl text-neutral-600">
          Short, sourced answers about GEO, AI SEO and AEO: what they mean, where to learn them and what each option costs. Every price and
          number links to where we found it.
        </p>
        <p className="mt-3 max-w-xl text-sm text-neutral-600">
          Written by the dfrenLearn, AiVirex and Litmus teams. {posts.length} guides, last updated{" "}
          <time dateTime={latest}>{formatDate(latest)}</time>. We cite sources such as{" "}
          <a href="https://developers.google.com/search/docs/appearance/ai-features" target="_blank" rel="noopener noreferrer" className="underline">
            Google Search Central
          </a>
          ,{" "}
          <a href="https://developers.openai.com/api/docs/bots" target="_blank" rel="noopener noreferrer" className="underline">
            OpenAI
          </a>{" "}
          and{" "}
          <a href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/" target="_blank" rel="noopener noreferrer" className="underline">
            Pew Research
          </a>
          .
        </p>
        <ul className="mt-10 divide-y divide-black border-y border-black">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="block py-6 hover:bg-neutral-50">
                {p.tag && <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{p.tag}</p>}
                <h2 className="mt-1 text-xl font-bold tracking-tight">{p.title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{p.description}</p>
                <p className="mt-2 text-xs text-neutral-500">Updated {formatDate(p.updated)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </BlogShell>
  );
}
