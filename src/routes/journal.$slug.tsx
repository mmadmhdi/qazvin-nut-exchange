import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { articleBySlug, categoryLabel, relatedArticles } from "@/lib/articles";
import { useStore } from "@/lib/store";

import { formatJalali, toFaDigits } from "@/lib/format";
import { seoLinks, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/journal/$slug")({
  head: ({ params }) => {
    const a = articleBySlug(params.slug);
    const url = `${SITE_URL}/journal/${params.slug}`;
    const title = a ? `${a.title} — دفتر سبز` : "مقاله — دفتر سبز";
    const desc = a?.dek ?? "مقالات درج سبز قزوین درباره بازار و تولید خشکبار.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(a ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: seoLinks(`/journal/${params.slug}`),
      scripts: a
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: a.title,
                description: a.dek,
                datePublished: a.date,
                dateModified: a.date,
                inLanguage: "fa-IR",
                mainEntityOfPage: { "@type": "WebPage", "@id": url },
                articleSection: categoryLabel(a.category),
                author: { "@type": "Organization", name: "درج سبز قزوین" },
                publisher: {
                  "@type": "Organization",
                  name: "درج سبز قزوین",
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/images/dorjesabz-logo.jpg`,
                  },
                },
              }),
            },
          ]
        : undefined,
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { articles: custom } = useStore();
  const article = articleBySlug(slug) ?? custom.find((a) => a.slug === slug);
  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-olive-deep">مقاله یافت نشد</h1>
        <p className="mt-3 text-muted-foreground">این نوشته در دفتر سبز موجود نیست یا حذف شده است.</p>
        <Link to="/journal" className="mt-6 inline-block text-brass-dark hover:text-olive-deep">
          بازگشت به دفتر سبز ←
        </Link>
      </div>
    );
  }
  const related = relatedArticles(article, 3);


  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-6 sm:py-14">
      <Link to="/journal" className="inline-flex min-h-10 items-center text-xs text-cocoa hover:text-olive-deep sm:min-h-0 sm:tracking-widest">
        → دفتر سبز
      </Link>
      <header className="mt-3 border-b border-olive-deep/15 pb-7 sm:mt-6 sm:border-0 sm:pb-0">
        <div className="inline-flex rounded-full bg-cream px-3 py-1 text-[10px] text-brass-dark sm:bg-transparent sm:p-0 sm:tracking-[0.3em] sm:uppercase">
          {categoryLabel(article.category)}
        </div>
        <h1 className="mt-3 font-display text-[1.8rem] leading-[1.45] text-olive-deep sm:mt-2 sm:text-4xl sm:leading-tight">
          {article.title}
        </h1>
        <p className="mt-3 text-[13px] leading-7 text-cocoa sm:text-base sm:leading-8">{article.dek}</p>
        <div className="mt-5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-olive-deep font-display text-sm text-paper" aria-hidden="true">د</div>
          <div className="min-w-0">
            <div className="font-medium text-cocoa">تحریریه دفتر سبز</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span>{formatJalali(article.date)}</span>
              <span>·</span>
              <span className="num-fa">{toFaDigits(article.minutes)} دقیقه مطالعه</span>
            </div>
          </div>
        </div>
      </header>
      <div className="gold-rule my-7 hidden sm:block" />

      <article className="mt-7 space-y-6 text-[15px] leading-[2.15] text-cocoa sm:mt-0 sm:space-y-5 sm:text-base sm:leading-9">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      <div className="mt-9 flex flex-wrap gap-2">
        {article.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-cream px-3 py-1.5 text-[11px] text-cocoa sm:rounded-sm sm:border sm:border-olive-deep/20 sm:bg-transparent sm:px-2.5 sm:py-1"
          >
            {t}
          </span>
        ))}
      </div>

      {related.length > 0 && (
        <section className="mt-12 hairline-t pt-8">
          <h2 className="font-display text-2xl text-olive-deep">خواندنی‌های مرتبط</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {related.map((a) => (
              <Link
                key={a.slug}
                to="/journal/$slug"
                params={{ slug: a.slug }}
                className="card-paper rounded-md p-4 transition-transform active:scale-[0.99] sm:rounded-sm sm:hover:-translate-y-0.5"
              >
                <div className="text-[10px] tracking-[0.25em] uppercase text-brass-dark">
                  {categoryLabel(a.category)}
                </div>
                <div className="mt-1.5 font-display text-base leading-7 text-olive-deep">
                  {a.title}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <div className="h-14" />
    </div>
  );
}
