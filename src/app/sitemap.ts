import type { MetadataRoute } from "next";
import { LEGAL } from "@/content/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${LEGAL.website}`;
  return ["", "/terms", "/privacy", "/refund-policy"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path ? "yearly" : "monthly",
  }));
}
