import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, computeChange } from "@/lib/store";
import { PriceCard } from "@/components/site/PriceCard";
import { ProductCard } from "@/components/site/ProductCard";
import { MarketChart } from "@/components/site/MarketChart";
import { MiniSparkline } from "@/components/site/MiniSparkline";
import { formatPercent, formatPrice, toFaDigits } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, ShieldCheck, Leaf, Boxes, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "درج سبز قزوین — تابلوی قیمت خلال پسته" },
      { name: "description", content: "درج سبز قزوین: تابلوی رسمی قیمت روز خلال پسته قزوین و بویین با نمودار حرفه‌ای، اندیکاتورها و تحلیل بازار." },
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
      {/* Ticker strip (mobile-scroll friendly) */}
      <div className="ticker-strip">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6 sm:gap-8 text-xs whitespace-nowrap">
            {active.map((p) => {
              const ch = computeChange(p.history).pct;
              const up = ch >= 0;
              return (
                <div key={p.id} className="flex items-center gap-2 shrink-0">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-20 grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-10 items-center">
          <div className="min-w-0">
            <div className="text-[10px] tracking-[0.4em] uppercase text-brass-dark mb-4 sm:mb-6">
              {settings.brandLatin} · Est. ۱۳۴۸
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl leading-[1.05] text-olive-deep">
              {settings.heroTitle}
            </h1>
            <div className="mt-5 sm:mt-6 max-w-2xl">
              <div className="gold-rule mb-4 sm:mb-6" />
              <p className="text-sm sm:text-base md:text-lg text-cocoa leading-8 sm:leading-9">
                {settings.heroSubtitle}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/market"
                className="inline-flex items-center gap-2 rounded-sm bg-olive-deep px-5 sm:px-6 py-3 text-xs sm:text-sm tracking-widest text-paper hover:bg-olive transition-colors"
              >
                تابلوی زنده بازار
              </Link>
              <Link
                to="/analysis"
                className="inline-flex items-center gap-2 rounded-sm border border-olive-deep/40 px-5 sm:px-6 py-3 text-xs sm:text-sm tracking-widest text-olive-deep hover:bg-cream transition-colors"
              >
                تحلیل بازار
              </Link>
            </div>
            <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat label="محصول پایش‌شده" value={toFaDigits(active.length)} />
              <Stat label="نسل تجربه" value="۴" />
              <Stat label="سال فعالیت" value="۷۷+" />
            </div>
          </div>
          <div className="min-w-0">
            {featured[0] && <MarketChart product={featured[0]} compact />}
          </div>
        </div>
      </section>

      {/* Ticker preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="hairline-t hairline-b py-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-6">
            <div className="min-w-0">
              <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">تابلوی قیمت امروز</div>
              <h2 className="font-display text-2xl sm:text-3xl text-olive-deep mt-1">بازار خشکبار</h2>
            </div>
            <Link to="/market" className="text-xs sm:text-sm tracking-widest text-cocoa hover:text-olive-deep shrink-0">
              همه‌ی قیمت‌ها ←
            </Link>
          </div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((p) => (
              <PriceCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-16">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ValueProp icon={<Leaf className="h-4 w-4" />} title="اصالت باغی" desc="از باغ‌های اصیل قزوین و بویین‌زهرا." />
          <ValueProp icon={<ShieldCheck className="h-4 w-4" />} title="کنترل کیفیت" desc="سه‌مرحله رنگ، رطوبت و اندازه." />
          <ValueProp icon={<BarChart3 className="h-4 w-4" />} title="قیمت شفاف" desc="تابلوی زنده با تاریخچه و اندیکاتور." />
          <ValueProp icon={<Boxes className="h-4 w-4" />} title="عمده و صادرات" desc="بسته‌بندی صادراتی و برند شخصی." />
        </div>
      </section>

      {/* Movers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-16">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end mb-6 gap-3">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">حرکات بازار</div>
            <h2 className="font-display text-2xl sm:text-3xl text-olive-deep mt-1">پرشتاب‌ترین‌های امروز</h2>
          </div>
          <Link to="/analysis" className="text-xs sm:text-sm tracking-widest text-cocoa hover:text-olive-deep shrink-0">
            تحلیل کامل ←
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...active]
            .map((p) => ({ p, ch: computeChange(p.history).pct }))
            .sort((a, b) => Math.abs(b.ch) - Math.abs(a.ch))
            .slice(0, 6)
            .map(({ p, ch }) => {
              const up = ch >= 0;
              return (
                <Link
                  key={p.id}
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="card-paper rounded-sm p-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 hover:-translate-y-0.5 transition-transform"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-widest uppercase text-brass-dark truncate">{p.origin}</div>
                    <div className="font-display text-olive-deep truncate mt-0.5">{p.name}</div>
                    <div className="num-fa text-sm text-cocoa mt-1">{formatPrice(p.price)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <MiniSparkline history={p.history} up={up} width={80} height={22} />
                    <span className={`num-fa text-xs px-1.5 py-0.5 rounded-sm border ${up ? "text-bull border-bull/40 bg-bull/5" : "text-bear border-bear/40 bg-bear/5"}`}>
                      {formatPercent(ch)}
                    </span>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Featured pistachio */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">محصولات ممتاز</div>
          <h2 className="font-display text-3xl sm:text-4xl text-olive-deep mt-2">خلال پسته، افتخار خانه</h2>
          <div className="gold-rule my-6" />
          <p className="text-sm sm:text-base text-cocoa leading-8">
            دو نگین اصلی بازار ما، برگرفته از باغ‌های قزوین و بویین‌زهرا؛ محصولاتی که سال‌ها اعتبار تجارت خانوادگی درج سبز بر آن استوار است.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mt-10">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} size="lg" />
          ))}
        </div>
      </section>

      {/* Others */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end mb-6 sm:mb-8 gap-3">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">سایر محصولات</div>
            <h2 className="font-display text-2xl sm:text-3xl text-olive-deep mt-1">مکمل‌های سفره خشکبار</h2>
          </div>
          <Link to="/products" className="text-xs sm:text-sm tracking-widest text-cocoa hover:text-olive-deep shrink-0">
            همه محصولات ←
          </Link>
        </div>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <div className="card-paper rounded-sm p-8 sm:p-10 md:p-14 text-center bg-gradient-to-br from-cream/60 to-background">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">فروش عمده و صادراتی</div>
          <h2 className="font-display text-3xl sm:text-4xl text-olive-deep mt-3">شریک تجاری قابل اعتماد</h2>
          <div className="gold-rule my-5" />
          <p className="text-cocoa max-w-2xl mx-auto leading-8 text-sm sm:text-base">
            برای قنادان، صنایع غذایی و صادرکنندگان؛ شرایط اختصاصی خرید عمده، تضمین کیفیت و قرارداد سالانه.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/wholesale" className="rounded-sm bg-olive-deep px-6 py-3 text-sm text-paper hover:bg-olive tracking-widest">شرایط فروش عمده</Link>
            <Link to="/contact" className="rounded-sm border border-olive-deep/40 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest">تماس با ما</Link>
          </div>
        </div>
      </section>

      <div className="h-16 sm:h-24" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl sm:text-3xl text-olive-deep num-fa">{value}</div>
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ValueProp({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card-paper rounded-sm p-5">
      <div className="flex items-center gap-2 text-brass-dark text-[10px] tracking-[0.3em] uppercase">
        {icon}
        {title}
      </div>
      <p className="text-sm text-cocoa mt-3 leading-7">{desc}</p>
    </div>
  );
}
