import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://peste.es";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/market", changefreq: "daily", priority: "0.9" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/compare", changefreq: "weekly", priority: "0.7" },
  { path: "/analysis", changefreq: "weekly", priority: "0.7" },
  { path: "/taste", changefreq: "monthly", priority: "0.6" },
  { path: "/origin", changefreq: "monthly", priority: "0.6" },
  { path: "/news", changefreq: "weekly", priority: "0.7" },
  { path: "/journal", changefreq: "weekly", priority: "0.8" },
  { path: "/wholesale", changefreq: "monthly", priority: "0.8" },
  { path: "/licenses", changefreq: "yearly", priority: "0.5" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC_ENTRIES];

        try {
          const { readSiteData } = await import("@/lib/site-data.server");
          const data = await readSiteData();
          for (const p of data.products.filter((p) => p.active)) {
            entries.push({ path: `/products/${p.slug}`, changefreq: "daily", priority: "0.8" });
          }
          for (const a of data.articles) {
            entries.push({ path: `/journal/${a.slug}`, changefreq: "monthly", priority: "0.6" });
          }
        } catch {
          // database unavailable — keep static routes
        }

        const { ARTICLES } = await import("@/lib/articles");
        for (const a of ARTICLES) {
          entries.push({ path: `/journal/${a.slug}`, changefreq: "monthly", priority: "0.6" });
        }

        const seen = new Set<string>();
        const urls = entries
          .filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)))
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
