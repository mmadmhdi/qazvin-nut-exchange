import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { useState } from "react";
import { ARTICLES, CATEGORIES, categoryLabel, type ArticleCategoryId } from "@/lib/articles";
import { useStore } from "@/lib/store";
import { BookOpen, Search } from "lucide-react";

import { formatJalali, localizedDigits } from "@/lib/format";
import { useTranslation } from "@/lib/i18n-provider";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      ...seoMeta("/journal"),
      { title: "قیمت پسته، خرید عمده و صادرات | مجله درج سبز" },
      {
        name: "description",
        content:
          "مقالات تخصصی درباره قیمت پسته، خرید عمده پسته، صادرات پسته ایرانی، مدیریت باغ، فرآوری مغز و خلال پسته و کنترل کیفیت خشکبار.",
      },
      { name: "keywords", content: "قیمت پسته، خرید عمده پسته، صادرات پسته، بازار پسته، فرآوری پسته، مقالات پسته" },
      { property: "og:title", content: "قیمت پسته، خرید عمده و صادرات | مجله درج سبز" },
      { property: "og:description", content: "راهنمای تخصصی بازار، خرید عمده، تولید، فرآوری و صادرات پسته ایرانی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: seoLinks("/journal"),
  }),
  component: Journal,
});

function Journal() {
  const { locale, t } = useTranslation();
  const copy = locale === "fa" ? { title: "دفتر سبز", intro: `هرچه در چهار نسل تجارت خشکبار آموخته‌ایم، اینجا مکتوب است: از سازوکار قیمت خلال پسته تا مدیریت آب باغ، کنترل کیفیت و مسیر صادرات. مجموعاً ${localizedDigits(ARTICLES.length)} مقاله.`, search: "جست‌وجو در مقالات…", results: "نتیجه", all: "همه", empty: "مقاله‌ای با این عنوان یافت نشد.", minutes: "دقیقه" } : locale === "ar" ? { title: "المجلة الخضراء", intro: `مقالاتنا المتخصصة متاحة حالياً بالفارسية. تضم المكتبة ${localizedDigits(ARTICLES.length)} مقالاً عن السوق والبساتين والجودة والتصدير.`, search: "البحث في المقالات الفارسية…", results: "نتيجة", all: "الكل", empty: "لم يتم العثور على مقال بهذا العنوان.", minutes: "دقائق" } : { title: "The Green Journal", intro: `Our specialist articles are currently available in Persian. The library contains ${ARTICLES.length} articles on markets, orchards, quality and export.`, search: "Search Persian articles…", results: "results", all: "All", empty: "No article matched this title.", minutes: "min read" };
  const { articles: custom } = useStore();
  const [cat, setCat] = useState<ArticleCategoryId | "all">("all");
  const [q, setQ] = useState("");
  const all = [...custom, ...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
  const list = all.filter(
    (a) =>
      (cat === "all" || a.category === cat) &&
      (q.trim() === "" ||
        a.title.includes(q.trim()) ||
        a.dek.includes(q.trim()) ||
        a.tags.some((t) => t.includes(q.trim()))),
  );


  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-14">
      <header className="border-b border-olive-deep/15 pb-6 sm:border-0 sm:pb-0">
        <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">The Green Journal</div>
         <h1 className="mt-2 font-display text-[2rem] leading-tight text-olive-deep sm:text-5xl">{copy.title}</h1>
        <div className="gold-rule my-5 hidden sm:block" />
        <p className="max-w-2xl text-[13px] leading-7 text-cocoa sm:text-base sm:leading-8">
         {copy.intro}
        </p>
      </header>

      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
             placeholder={copy.search}
             aria-label={copy.search}
            className="h-12 w-full rounded-md border border-input bg-card pe-11 ps-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 sm:h-auto sm:rounded-sm sm:bg-background sm:px-3 sm:py-2"
          />
        </label>
        <div className="text-xs text-muted-foreground num-fa">
           {localizedDigits(list.length)} {copy.results}
        </div>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:mt-4 sm:px-0 sm:pb-1">
        <Chip on={cat === "all"} onClick={() => setCat("all")}>
           {copy.all}
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>
             {locale === "fa" ? c.label : c.id}
          </Chip>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <Link
            key={a.slug}
            to="/journal/$slug"
            params={{ slug: a.slug }}
            className="card-paper grid min-h-[136px] grid-cols-[4.75rem_minmax(0,1fr)] gap-4 rounded-md p-4 transition-transform active:scale-[0.99] sm:block sm:min-h-0 sm:rounded-sm sm:p-5 sm:hover:-translate-y-0.5"
          >
            <div className="grid h-[4.75rem] w-[4.75rem] shrink-0 place-items-center self-start rounded-md bg-cream text-olive-deep sm:hidden" aria-hidden="true">
              <BookOpen className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="text-[10px] tracking-[0.12em] uppercase text-brass-dark sm:tracking-[0.25em]">
                {categoryLabel(a.category)}
              </div>
              <h2 className="mt-1.5 line-clamp-2 font-display text-[17px] leading-7 text-olive-deep sm:mt-2 sm:text-xl sm:leading-8">{a.title}</h2>
              <p className="mt-2 hidden text-xs leading-6 text-cocoa line-clamp-3 sm:block">{a.dek}</p>
              <div className="mt-auto flex items-center gap-2 pt-3 text-[10px] text-muted-foreground sm:mt-4 sm:justify-between sm:pt-0 sm:text-[11px]">
                <span>{formatJalali(a.date)}</span>
                <span className="h-1 w-1 rounded-full bg-border sm:hidden" aria-hidden="true" />
                 <span className="num-fa">{localizedDigits(a.minutes)} {copy.minutes}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && (
         <div className="mt-10 text-sm text-muted-foreground">{copy.empty}</div>
      )}
      <div className="h-8 sm:h-16" />
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-10 shrink-0 rounded-sm border px-4 py-2 text-xs whitespace-nowrap sm:min-h-0 sm:px-3 sm:py-1.5 ${
        on
          ? "border-olive-deep bg-olive-deep text-paper"
          : "border-olive-deep/25 text-cocoa hover:bg-cream"
      }`}
    >
      {children}
    </button>
  );
}
