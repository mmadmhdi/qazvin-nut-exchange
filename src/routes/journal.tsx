import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ARTICLES, CATEGORIES, categoryLabel, type ArticleCategoryId } from "@/lib/articles";
import { formatJalali, toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "دفتر سبز — مقالات بازار، باغ و فرآوری پسته" },
      {
        name: "description",
        content:
          "آرشیو مقالات درج سبز قزوین: قیمت‌گذاری خلال پسته، مدیریت باغ، فرآوری، کنترل کیفیت و صادرات خشکبار.",
      },
      { property: "og:title", content: "دفتر سبز — مقالات درج سبز قزوین" },
      { property: "og:description", content: "دانش کاربردی بازار و تولید خشکبار، به زبان فارسی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Journal,
});

function Journal() {
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">The Green Journal</div>
      <h1 className="font-display text-3xl sm:text-5xl text-olive-deep mt-2">دفتر سبز</h1>
      <div className="gold-rule my-6" />
      <p className="max-w-2xl text-sm sm:text-base leading-8 text-cocoa">
        هرچه در چهار نسل تجارت خشکبار آموخته‌ایم، اینجا مکتوب است: از سازوکار قیمت خلال پسته تا
        مدیریت آب باغ، کنترل کیفیت و مسیر صادرات. مجموعاً {toFaDigits(ARTICLES.length)} مقاله.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جست‌وجو در مقالات…"
          className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
        />
        <div className="text-xs text-muted-foreground num-fa">
          {toFaDigits(list.length)} نتیجه
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <Chip on={cat === "all"} onClick={() => setCat("all")}>
          همه
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <Link
            key={a.slug}
            to="/journal/$slug"
            params={{ slug: a.slug }}
            className="card-paper rounded-sm p-5 transition-transform hover:-translate-y-0.5"
          >
            <div className="text-[10px] tracking-[0.25em] uppercase text-brass-dark">
              {categoryLabel(a.category)}
            </div>
            <h2 className="mt-2 font-display text-xl leading-8 text-olive-deep">{a.title}</h2>
            <p className="mt-2 text-xs leading-6 text-cocoa line-clamp-3">{a.dek}</p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{formatJalali(a.date)}</span>
              <span className="num-fa">{toFaDigits(a.minutes)} دقیقه</span>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && (
        <div className="mt-10 text-sm text-muted-foreground">مقاله‌ای با این عنوان یافت نشد.</div>
      )}
      <div className="h-16" />
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
      className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs whitespace-nowrap ${
        on
          ? "border-olive-deep bg-olive-deep text-paper"
          : "border-olive-deep/25 text-cocoa hover:bg-cream"
      }`}
    >
      {children}
    </button>
  );
}
