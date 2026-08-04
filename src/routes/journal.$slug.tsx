import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { articleBySlug, categoryLabel, relatedArticles } from "@/lib/articles";
import { useStore } from "@/lib/store";

import { formatJalali, toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/journal/$slug")({
  head: ({ params }) => {
    const a = articleBySlug(params.slug);
    const title = a ? `${a.title} — دفتر سبز` : "مقاله — دفتر سبز";
    const desc = a?.dek ?? "مقالات درج سبز قزوین درباره بازار و تولید خشکبار.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { articles: custom } = useStore();
  const article = articleBySlug(slug) ?? custom.find((a) => a.slug === slug);
  if (!article) throw notFound();
  const related = relatedArticles(article, 3);


  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <Link to="/journal" className="text-xs tracking-widest text-cocoa hover:text-olive-deep">
        → دفتر سبز
      </Link>
      <div className="mt-6 text-[10px] tracking-[0.3em] uppercase text-brass-dark">
        {categoryLabel(article.category)}
      </div>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl leading-tight text-olive-deep">
        {article.title}
      </h1>
      <p className="mt-3 text-sm sm:text-base leading-8 text-cocoa">{article.dek}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span>{formatJalali(article.date)}</span>
        <span>·</span>
        <span className="num-fa">{toFaDigits(article.minutes)} دقیقه مطالعه</span>
      </div>
      <div className="gold-rule my-7" />

      <article className="space-y-5 text-sm sm:text-base leading-9 text-cocoa">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      <div className="mt-8 flex flex-wrap gap-2">
        {article.tags.map((t) => (
          <span
            key={t}
            className="rounded-sm border border-olive-deep/20 px-2.5 py-1 text-[11px] text-cocoa"
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
                className="card-paper rounded-sm p-4 transition-transform hover:-translate-y-0.5"
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
