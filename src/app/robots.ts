import type { MetadataRoute } from "next";
import { LEGAL } from "@/content/legal";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/", "/watermark", "/login"] },
    sitemap: `https://${LEGAL.website}/sitemap.xml`,
  };
}
