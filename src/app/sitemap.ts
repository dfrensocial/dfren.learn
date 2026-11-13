import type { MetadataRoute } from "next";
import { LEGAL } from "@/content/legal";
import { SITE_URL } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const pages = ["", "/about", "/contact", "/blog", "/terms", "/privacy", "/refund-policy"].map((path) => ({
    url: `${base}${path}`,
    lastModified: path === "" || path === "/blog" ? LEGAL.siteUpdatedISO : LEGAL.updatedISO,
    changeFrequency: (path === "" || path === "/blog" ? "monthly" : "yearly") as "monthly" | "yearly",
  }));
  const posts = getAllPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updated,
    changeFrequency: "monthly" as const,
  }));
  return [...pages, ...posts];
}
