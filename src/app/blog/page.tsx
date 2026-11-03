import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell } from "@/components/blog/blog-shell";
import { formatDate, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "GEO guides for learners in India | dfrenLearn blog",
  description: "Plain guides on learning GEO, AI SEO and AEO in India: courses compared by price, what the research says, and what to charge.",
  alternates: { canonical: "https://learn.dfren.in/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <BlogShell>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Guides on learning GEO in India</h1>
        <p className="mt-3 max-w-xl text-neutral-600">
          Short, sourced answers about GEO, AI SEO and AEO: what they mean, where to learn them and what each option costs. Every price and
          number links to where we found it.
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
