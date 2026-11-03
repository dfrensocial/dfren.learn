import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

// Blog posts live as markdown files in src/content/blog. They are read at build
// time only (the pages are statically generated), never at request time.

const DIR = path.join(process.cwd(), "src", "content", "blog");

export type Post = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  updated: string;
  author: string;
  authorRole: string;
  tag: string;
  related: string[];
  html: string; // article body up to "Sources"
  sourcesHtml: string; // the "Sources" section (rendered after the call to action)
  words: number;
};

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const text = raw.replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: text };
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: text.slice(m[0].length) };
}

function enhance(html: string): string {
  return html
    // wide tables scroll sideways on phones instead of breaking the layout
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>")
    // outside links open in a new tab
    .replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
}

function load(file: string): Post {
  const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(DIR, file), "utf8"));
  // The first H1 is rendered by the page, so drop it from the body if present.
  const cleaned = body.replace(/^\s*# .*\n/, "");
  const idx = cleaned.search(/^## Sources\s*$/m);
  const main = idx >= 0 ? cleaned.slice(0, idx) : cleaned;
  const sources = idx >= 0 ? cleaned.slice(idx) : "";
  const render = (s: string) => enhance(marked.parse(s, { async: false, gfm: true }) as string);
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title ?? file,
    seoTitle: meta.seoTitle ?? meta.title ?? file,
    description: meta.description ?? "",
    date: meta.date ?? "",
    updated: meta.updated ?? meta.date ?? "",
    author: meta.author ?? "",
    authorRole: meta.authorRole ?? "",
    tag: meta.tag ?? "",
    related: (meta.related ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    html: render(main),
    sourcesHtml: sources ? render(sources) : "",
    words: cleaned.split(/\s+/).filter(Boolean).length,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(load)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
