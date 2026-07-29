import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, computeChange } from "@/lib/store";
import { PriceCard } from "@/components/site/PriceCard";
import { ProductCard } from "@/components/site/ProductCard";
import { MarketChart } from "@/components/site/MarketChart";
import { formatPercent, formatPrice, toFaDigits } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "درج سبز قزوین — تابلوی قیمت خلال پسته" },
      { name: "description", content: "درج سبز قزوین: تابلوی رسمی قیمت روز خلال پسته قزوین و بویین با نمودار حرفه‌ای و تحلیل بازار." },
      { property: "og:title", content: "درج سبز قزوین — تابلوی قیمت خلال پسته" },
      { property: "og:description", content: "قیمت زنده، نمودار شمعی و تحلیل بازار خلال پسته قزوین." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { products, settings } = useStore();
  const active = products.filter((p) => p.active).sort((a, b) => b.priority - a.priority);
  const featured = active.filter((p) => p.featured);
  const others = active.filter((p) => !p.featured);
  const top = active.slice(0, 4);

  return (
    <div>
      {/* Ticker strip */}
      <div className="ticker-strip">
        <div className="mx-auto max-w-7xl px-6 py-2.5 overflow-hidden">
          <div className="flex items-center gap-8 text-xs whitespace-nowrap animate-[ticker_45s_linear_infinite]" style={{animation:"none"}}>
            {active.map((p) => {
              const ch = computeChange(p.history).pct;
              const up = ch >= 0;
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-brass/80 tracking-widest text-[10px] uppercase">{p.origin}</span>
                  <span className="text-paper/90">{p.name}</span>
                  <span className="num-fa text-brass">{formatPrice(p.price)}</span>
                  <span className={`num-fa flex items-center gap-0.5 ${up ? "text-bull" : "text-bear"}`}>
                    {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {formatPercent(ch)}
                  </span>
                  <span className="text-paper/20">|</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream/70 via-background to-background" />
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-16 md:pt-24 md:pb-20 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase text-brass-dark mb-6">
              {settings.brandLatin} · Est. ۱۳۴۸
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-olive-deep">
              {settings.heroTitle}
            </h1>
            <div className="mt-6 max-w-2xl">
              <div className="gold-rule mb-6" />
              <p className="text-base md:text-lg text-cocoa leading-9">
                {settings.heroSubtitle}
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/market"
                className="inline-flex items-center gap-2 rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive transition-colors"
              >
                تابلوی زنده بازار
              </Link>
              <Link
                to="/analysis"
                className="inline-flex items-center gap-2 rounded-sm border border-olive-deep/40 px-6 py-3 text-sm tracking-widest text-olive-deep hover:bg-cream transition-colors"
              >
                تحلیل بازار
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat label="محصول پایش‌شده" value={toFaDigits(active.length)} />
              <Stat label="نسل تجربه" value="۴" />
              <Stat label="سال فعالیت" value="۷۷+" />
            </div>
          </div>
          <div className="hidden lg:block">
            {featured[0] && <MarketChart product={featured[0]} />}
          </div>
        </div>
      </section>

      {/* Ticker preview */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="hairline-t hairline-b py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">تابلوی قیمت امروز</div>
              <h2 className="font-display text-3xl text-olive-deep mt-1">بازار خشکبار</h2>
            </div>
            <Link to="/market" className="text-sm tracking-widest text-cocoa hover:text-olive-deep">
              همه‌ی قیمت‌ها ←
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {top.map((p) => (
              <PriceCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile featured chart */}
      {featured[0] && (
        <section className="lg:hidden mx-auto max-w-7xl px-6 mt-16">
          <MarketChart product={featured[0]} />
        </section>
      )}

      {/* Featured pistachio */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">محصولات ممتاز</div>
          <h2 className="font-display text-4xl text-olive-deep mt-2">خلال پسته، افتخار خانه</h2>
          <div className="gold-rule my-6" />
          <p className="text-cocoa leading-8">
            دو نگین اصلی بازار ما، برگرفته از باغ‌های قزوین و بویین‌زهرا؛ محصولاتی که سال‌ها اعتبار تجارت خانوادگی درج سبز بر آن استوار است.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 mt-12">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} size="lg" />
          ))}
        </div>
      </section>

      {/* Other products */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">سایر محصولات</div>
            <h2 className="font-display text-3xl text-olive-deep mt-1">مکمل‌های سفره خشکبار</h2>
          </div>
          <Link to="/products" className="text-sm tracking-widest text-cocoa hover:text-olive-deep">
            همه محصولات ←
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="card-paper rounded-sm p-10 md:p-14 text-center bg-gradient-to-br from-cream/60 to-background">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">فروش عمده و صادراتی</div>
          <h2 className="font-display text-4xl text-olive-deep mt-3">شریک تجاری قابل اعتماد</h2>
          <div className="gold-rule my-5" />
          <p className="text-cocoa max-w-2xl mx-auto leading-8">
            برای قنادان، صنایع غذایی و صادرکنندگان؛ شرایط اختصاصی خرید عمده، تضمین کیفیت و قرارداد سالانه.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/wholesale" className="rounded-sm bg-olive-deep px-6 py-3 text-sm text-paper hover:bg-olive tracking-widest">شرایط فروش عمده</Link>
            <Link to="/contact" className="rounded-sm border border-olive-deep/40 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest">تماس با ما</Link>
          </div>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-olive-deep num-fa">{value}</div>
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
