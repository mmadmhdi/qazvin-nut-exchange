import { ARTICLES_MARKET } from "./articles-market";
import { ARTICLES_ORCHARD } from "./articles-orchard";
import type { Article, ArticleCategoryId } from "./articles-types";

export type { Article, ArticleCategoryId } from "./articles-types";
export { CATEGORIES, categoryLabel } from "./articles-types";

export const ARTICLES: Article[] = [...ARTICLES_MARKET, ...ARTICLES_ORCHARD].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function articlesByCategory(id: ArticleCategoryId): Article[] {
  return ARTICLES.filter((a) => a.category === id);
}

/** Related by shared tags, then by category. */
export function relatedArticles(article: Article, count = 3): Article[] {
  const scored = ARTICLES.filter((a) => a.slug !== article.slug).map((a) => ({
    a,
    score:
      a.tags.filter((t) => article.tags.includes(t)).length * 2 +
      (a.category === article.category ? 1 : 0),
  }));
  return scored
    .sort((x, y) => y.score - x.score)
    .slice(0, count)
    .map((s) => s.a);
}

/** Articles matching any of the given tags/keywords — used to embed reading lists in pages. */
export function articlesForTopic(keywords: string[], count = 4): Article[] {
  const k = keywords.map((s) => s.trim());
  return ARTICLES.filter(
    (a) => a.tags.some((t) => k.includes(t)) || k.some((s) => a.title.includes(s)),
  ).slice(0, count);
}
