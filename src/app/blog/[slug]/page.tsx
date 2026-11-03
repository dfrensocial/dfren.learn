import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogShell } from "@/components/blog/blog-shell";
import { ArticleCta } from "@/components/blog/article-cta";
import { formatDate, getAllPosts, getPost } from "@/lib/blog";
import { geoBlueprintCourse } from "@/content/courses/geo-blueprint";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `https://learn.dfren.in/blog/${post.slug}`;
  return {
    title: post.seoTitle,
    description: post.description,
    alternates: { canonical: url },
    authors: [{ name: post.author }],
    openGraph: {
      title: post.seoTitle,
      description: post.description,
      type: "article",
      url,
      siteName: "dfrenLearn",
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const related = post.related.map((s) => all.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated,
    author: { "@type": "Person", name: post.author, jobTitle: post.authorRole, sameAs: [geoBlueprintCourse.instructor.linkedinUrl] },
    publisher: { "@type": "Organization", name: "dfrenLearn", url: "https://learn.dfren.in" },
    mainEntityOfPage: `https://learn.dfren.in/blog/${post.slug}`,
  };

  return (
    <BlogShell>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <p className="text-sm">
          <Link href="/blog" className="text-neutral-500 hover:text-black hover:underline">
            ← All guides
          </Link>
        </p>
        <article className="mt-6">
          {post.tag && <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{post.tag}</p>}
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-sm text-neutral-600">
            By{" "}
            <a href={geoBlueprintCourse.instructor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-black underline underline-offset-2">
              {post.author}
            </a>
            , {post.authorRole} · Published {formatDate(post.date)} · Updated {formatDate(post.updated)} ·{" "}
            {Math.max(1, Math.round(post.words / 220))} min read
          </p>
          <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />
          <ArticleCta />
          {post.sourcesHtml && <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.sourcesHtml }} />}
        </article>

        {related.length > 0 && (
          <section className="mt-14 border-t border-black pt-8">
            <h2 className="text-lg font-bold tracking-tight">Keep reading</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="block h-full border border-black p-4 text-sm hover:bg-neutral-50">
                    <span className="font-semibold">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </BlogShell>
  );
}
