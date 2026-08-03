import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Coffee, Croissant, Salad, Cake, Wine, Check } from "lucide-react";

export const Route = createFileRoute("/taste")({
  head: () => ({
    meta: [
      { title: "آیین چشیدن — ترکیب‌ساز پسته | درج سبز قزوین" },
      {
        name: "description",
        content:
          "آیین شخصی چشیدن پسته بسازید: زمان روز، بافت، همراه و نوشیدنی؛ سپس محصول متناسب درج سبز را ببینید.",
      },
      { property: "og:title", content: "آیین چشیدن پسته — درج سبز قزوین" },
      { property: "og:description", content: "ترکیب‌ساز طعم و پیشنهاد محصول متناسب با ذائقه شما." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TastePage,
});

type Step = { key: string; title: string; options: { id: string; label: string; tag: string }[] };

const STEPS: Step[] = [
  {
    key: "time",
    title: "چه زمانی از روز؟",
    options: [
      { id: "morning", label: "صبح آرام", tag: "خلال" },
      { id: "afternoon", label: "عصرانه", tag: "مغز" },
      { id: "night", label: "شب‌نشینی", tag: "پسته" },
    ],
  },
  {
    key: "texture",
    title: "چه بافتی می‌پسندید؟",
    options: [
      { id: "crisp", label: "ترد و خشک", tag: "خلال" },
      { id: "creamy", label: "کره‌ای و نرم", tag: "کرم" },
      { id: "whole", label: "دانه کامل", tag: "پسته" },
    ],
  },
  {
    key: "pair",
    title: "همراه آن چیست؟",
    options: [
      { id: "bakery", label: "شیرینی و نان", tag: "خلال" },
      { id: "salad", label: "سالاد و غذا", tag: "مغز" },
      { id: "solo", label: "تنها، بدون همراه", tag: "پسته" },
    ],
  },
  {
    key: "drink",
    title: "نوشیدنی همراه؟",
    options: [
      { id: "espresso", label: "اسپرسو", tag: "خلال" },
      { id: "tea", label: "چای ایرانی", tag: "پسته" },
      { id: "cold", label: "نوشیدنی سرد", tag: "مغز" },
    ],
  },
];

const RITUAL_ICON: Record<string, React.ReactNode> = {
  espresso: <Coffee className="h-4 w-4" />,
  bakery: <Croissant className="h-4 w-4" />,
  salad: <Salad className="h-4 w-4" />,
  solo: <Cake className="h-4 w-4" />,
  cold: <Wine className="h-4 w-4" />,
};

function TastePage() {
  const { products } = useStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const done = STEPS.every((s) => answers[s.key]);

  const tags = useMemo(
    () =>
      STEPS.flatMap((s) => {
        const chosen = s.options.find((o) => o.id === answers[s.key]);
        return chosen ? [chosen.tag] : [];
      }),
    [answers],
  );

  const recommendation = useMemo(() => {
    const active = products.filter((p) => p.active);
    if (!done || active.length === 0) return null;
    const score = (name: string) => tags.filter((t) => name.includes(t)).length;
    return [...active].sort(
      (a, b) => score(b.name) - score(a.name) || b.priority - a.priority,
    )[0];
  }, [products, tags, done]);

  return (
    <div>
      <section className="hairline-b bg-gradient-to-b from-cream/70 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-[10px] tracking-[0.4em] uppercase text-brass-dark">Taste</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl text-olive-deep">آیین چشیدن</h1>
          <div className="gold-rule my-5 max-w-md" />
          <p className="max-w-2xl text-sm sm:text-base leading-8 text-cocoa">
            چهار پرسش کوتاه؛ سپس آیین شخصی شما و محصول متناسب با ذائقه‌تان ساخته می‌شود.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          {STEPS.map((s, i) => (
            <div key={s.key} className="card-paper rounded-sm p-5">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <span className="num-fa grid h-7 w-7 shrink-0 place-items-center rounded-full bg-olive-deep text-xs text-paper">
                  {["۱", "۲", "۳", "۴"][i]}
                </span>
                <h2 className="min-w-0 font-display text-lg text-olive-deep">{s.title}</h2>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {s.options.map((o) => {
                  const sel = answers[s.key] === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setAnswers((a) => ({ ...a, [s.key]: o.id }))}
                      className={`rounded-sm border px-3 py-2.5 text-sm transition-colors ${
                        sel
                          ? "border-olive-deep bg-olive-deep text-paper"
                          : "border-olive-deep/25 text-cocoa hover:bg-cream"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {sel && <Check className="h-3.5 w-3.5" />}
                        {o.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="card-paper rounded-sm p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Your Ritual</div>
            <h2 className="mt-2 font-display text-2xl text-olive-deep">آیین شما</h2>
            <div className="gold-rule my-4" />
            {!done ? (
              <p className="text-sm leading-7 text-muted-foreground">
                برای دیدن آیین پیشنهادی، هر چهار پرسش را پاسخ دهید.
              </p>
            ) : (
              <div className="animate-fade-in">
                <ul className="space-y-2 text-sm text-cocoa">
                  {STEPS.map((s) => {
                    const o = s.options.find((x) => x.id === answers[s.key])!;
                    return (
                      <li key={s.key} className="flex items-center gap-2">
                        <span className="text-brass-dark">{RITUAL_ICON[o.id] ?? <Check className="h-4 w-4" />}</span>
                        {o.label}
                      </li>
                    );
                  })}
                </ul>
                {recommendation && (
                  <div className="mt-6 border-t border-border pt-5">
                    <div className="text-[10px] tracking-widest uppercase text-brass-dark">
                      {recommendation.origin}
                    </div>
                    <div className="mt-1 font-display text-xl text-olive-deep">{recommendation.name}</div>
                    <p className="mt-2 text-xs leading-6 text-cocoa">{recommendation.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to="/products/$slug"
                        params={{ slug: recommendation.slug }}
                        className="rounded-sm bg-olive-deep px-4 py-2 text-xs tracking-widest text-paper hover:bg-olive"
                      >
                        مشاهده محصول
                      </Link>
                      <Link
                        to="/contact"
                        className="rounded-sm border border-olive-deep/40 px-4 py-2 text-xs tracking-widest text-olive-deep hover:bg-cream"
                      >
                        سفارش
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
