import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { getPassport, passportRows } from "@/lib/passport";
import { Search, Sprout, Scissors, Filter, Flame, ShieldCheck, Package, Truck, MapPin } from "lucide-react";

export const Route = createFileRoute("/origin")({
  head: () => ({
    meta: [
      { title: "اصالت باغ — از باغ تا بسته | درج سبز قزوین" },
      {
        name: "description",
        content:
          "مسیر هشت‌مرحله‌ای پسته درج سبز از باغ‌های قزوین تا بسته‌بندی، همراه با شناسنامه دیجیتال هر بچ تولید.",
      },
      { property: "og:title", content: "از باغ تا بسته — اصالت پسته درج سبز" },
      { property: "og:description", content: "هشت مرحله سفر پسته و شناسنامه دیجیتال هر بچ تولید." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OriginPage,
});

const STEPS = [
  { icon: Sprout, title: "باغ", desc: "باغ‌های اصیل قزوین و بویین‌زهرا؛ آبیاری کنترل‌شده و خاک آهکی." },
  { icon: Scissors, title: "برداشت", desc: "برداشت در پنجره‌ی رسیدگی کامل، حداکثر ۱۲ ساعت پیش از فرآوری." },
  { icon: Filter, title: "جداسازی", desc: "پوست‌گیری تازه، شست‌وشو و جداسازی دانه‌های نامرغوب." },
  { icon: Flame, title: "خشک و تفت", desc: "خشک‌کن ملایم برای تثبیت رنگ سبز و حفظ روغن طبیعی مغز." },
  { icon: ShieldCheck, title: "کنترل کیفیت", desc: "سه آزمون رنگ، رطوبت و اندازه؛ پایش آفلاتوکسین." },
  { icon: Package, title: "برش و درجه‌بندی", desc: "برش سرد خلال با ضخامت یکنواخت و سرند نوری." },
  { icon: Package, title: "بسته‌بندی", desc: "بسته‌بندی وکیوم یا کارتن صادراتی با درج شماره بچ." },
  { icon: Truck, title: "ارسال", desc: "بارگیری با مستندات کامل؛ داخلی و صادراتی." },
];

function OriginPage() {
  const { products, settings } = useStore();
  const [query, setQuery] = useState("");

  const passports = useMemo(
    () => products.filter((p) => p.active).map((p) => ({ p, pp: getPassport(p) })),
    [products],
  );

  const found = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return (
      passports.find(
        ({ p, pp }) =>
          pp.batch.toLowerCase() === q ||
          pp.batch.toLowerCase().includes(q) ||
          p.name.includes(query.trim()),
      ) ?? "none"
    );
  }, [query, passports]);

  return (
    <div>
      <section className="hairline-b bg-gradient-to-b from-cream/70 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-[10px] tracking-[0.4em] uppercase text-brass-dark">Origin</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl text-olive-deep">از باغ تا بسته</h1>
          <div className="gold-rule my-5 max-w-md" />
          <p className="max-w-2xl text-sm sm:text-base leading-8 text-cocoa">
            پسته‌ی شما هشت مرحله را پیش از رسیدن به دست شما طی می‌کند. مسیر را ببینید و با شماره‌ی بچ
            روی بسته، شناسنامه‌ی دقیق باغ و تاریخ برداشت را بخوانید.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-brass-dark" />
            {settings.contactAddress}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card-paper rounded-sm p-5">
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-brass/50 bg-cream text-olive-deep">
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="num-fa font-display text-2xl text-brass-dark/60">
                  {["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸"][i]}
                </span>
              </div>
              <div className="mt-3 font-display text-lg text-olive-deep">{s.title}</div>
              <p className="mt-1.5 text-xs leading-6 text-cocoa">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center font-display text-xl sm:text-2xl text-olive-deep">
          پسته‌ی شما ۸ مرحله را پیش از رسیدن به شما طی کرده است.
        </p>
      </section>

      {/* Passport lookup */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="card-paper rounded-sm p-5 sm:p-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Pistachio Passport</div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl text-olive-deep">شناسنامه محصول</h2>
          <div className="gold-rule my-5 max-w-xs" />
          <label className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 max-w-md">
            <span className="sr-only">شماره بچ یا نام محصول</span>
            <div className="relative min-w-0">
              <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="شماره بچ (مثلاً DS-04-123) یا نام محصول"
                className="w-full rounded-sm border border-input bg-background py-2.5 pr-9 pl-3 text-sm"
              />
            </div>
          </label>

          {found === "none" && (
            <p className="mt-4 text-sm text-bear">شناسنامه‌ای با این شماره یافت نشد.</p>
          )}

          {found && found !== "none" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-brass-dark">{found.p.origin}</div>
                <div className="mt-1 font-display text-2xl text-olive-deep">{found.p.name}</div>
                <p className="mt-3 text-sm leading-7 text-cocoa">{found.p.description}</p>
                <Link
                  to="/products/$slug"
                  params={{ slug: found.p.slug }}
                  className="mt-4 inline-flex rounded-sm bg-olive-deep px-4 py-2 text-xs tracking-widest text-paper hover:bg-olive"
                >
                  نمودار و قیمت ←
                </Link>
              </div>
              <dl className="grid gap-0 text-sm">
                {passportRows(found.pp).map((r) => (
                  <div
                    key={r.label}
                    className="grid grid-cols-[minmax(0,110px)_minmax(0,1fr)] gap-3 border-b border-border/60 py-2 last:border-0"
                  >
                    <dt className="text-xs text-muted-foreground">{r.label}</dt>
                    <dd className="min-w-0 text-cocoa">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {!query && (
            <div className="mt-6">
              <div className="mb-3 text-xs text-muted-foreground">شماره‌های فعال تولید:</div>
              <div className="flex flex-wrap gap-2">
                {passports.slice(0, 8).map(({ p, pp }) => (
                  <button
                    key={p.id}
                    onClick={() => setQuery(pp.batch)}
                    className="rounded-sm border border-olive-deep/25 px-3 py-1.5 text-xs text-olive-deep hover:bg-cream"
                    dir="ltr"
                  >
                    {pp.batch}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
