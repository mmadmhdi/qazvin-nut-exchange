import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { useStore, computeChange } from "@/lib/store";
import { PriceCard } from "@/components/site/PriceCard";
import { ProductCard } from "@/components/site/ProductCard";
import { MarketChart } from "@/components/site/MarketChart";
import { MiniSparkline } from "@/components/site/MiniSparkline";
import { Button } from "@/components/ui/button";
import growers from "@/assets/pistachio-growers.jpg";
import orchard from "@/assets/pistachio-orchard.jpg";
import slivers from "@/assets/pistachio-slivers.jpg";
import { useTranslation } from "@/lib/i18n-provider";
import { localizeProduct } from "@/lib/product-i18n";
import { homeCopy } from "@/lib/public-copy";

import { formatPercent, formatPrice } from "@/lib/format";
import { ShieldCheck, Leaf, Boxes, BarChart3, ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      ...seoMeta("/"),
      { title: "درج سبز قزوین — تابلوی قیمت خلال پسته" },
      { name: "description", content: "درج سبز قزوین: تابلوی رسمی قیمت روز خلال پسته قزوین و بویین با نمودار حرفه‌ای، اندیکاتورها و تحلیل بازار." },
      { property: "og:title", content: "درج سبز قزوین — تابلوی قیمت خلال پسته" },
      { property: "og:description", content: "قیمت زنده، نمودار شمعی و تحلیل بازار خلال پسته قزوین." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: seoLinks("/"),
  }),
  component: Home,
});

function Home() {
  const { products, settings } = useStore();
  const { t, locale } = useTranslation();
  const copy = homeCopy(locale);
  const heroTitle = locale === "fa" ? settings.heroTitle : t("hero.title");
  const heroSubtitle = locale === "fa" ? settings.heroSubtitle : t("hero.subtitle");
  const active = products.filter((p) => p.active).sort((a, b) => b.priority - a.priority);
  const featured = active.filter((p) => p.featured);
  const others = active.filter((p) => !p.featured);
  const top = active.slice(0, 4);

  const Arrow = locale === "en" ? ArrowRight : ArrowLeft;
  const brandName = locale === "fa" ? settings.brandName : settings.brandLatin;
  return (
    <div className="experience-home">
      <section className="experience-scene" aria-labelledby="experience-title">
        <img src={growers} alt={locale === "fa" ? "تصویر هنری باغداران و مغز پسته" : locale === "ar" ? "صورة فنية للمزارعين والفستق" : "Illustrative pistachio growers and kernels"} width={1920} height={1024} fetchPriority="high" className="experience-scene-image" />
        <div className="experience-grid" aria-hidden="true">{Array.from({length: 5}, (_, i) => <span key={i} />)}</div>
        <div className="experience-copy">
          <div className="mb-5 flex items-center gap-3 text-[10px] text-scene-muted"><span className="h-px w-8 bg-signal" />{settings.brandLatin} · {copy.est}</div>
          <h1 id="experience-title" className="text-scene-text">{brandName}</h1>
          <p className="mt-2 text-xl font-light leading-9 text-scene-text sm:text-2xl">{heroTitle}</p>
          <p className="mt-5 max-w-md text-sm font-light leading-7 text-scene-muted">{heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Button asChild className="experience-enter"><Link to="/market">{t("cta.liveMarket")}<Arrow /></Link></Button>
            <Button asChild variant="link" className="p-0 text-scene-text"><Link to="/origin">{t("nav.origin")}<Arrow /></Link></Button>
          </div>
        </div>
        <div className="absolute inset-x-5 bottom-6 flex items-center justify-between border-t border-scene-line pt-4 text-[10px] text-scene-muted sm:inset-x-10">
          <span dir="ltr">01 / 04 — DORJESABZ</span>
          <Button variant="ghost" size="icon" aria-label={t("home.todayBoard")} className="text-scene-text hover:bg-scene-panel" onClick={() => document.getElementById("daily-market")?.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"})}><ArrowDown /></Button>
        </div>
      </section>
      <div className="border-y border-scene-line bg-scene-panel">
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 py-4 scrollbar-none">
          <div className="flex items-center gap-8 whitespace-nowrap text-xs">
            {active.map(p => { const ch = computeChange(p.history).pct; return <Link key={p.id} to="/products/$slug" params={{slug:p.slug}} className="flex shrink-0 items-center gap-3"><span className="text-scene-muted">{localizeProduct(p,locale).name}</span><span className="num-fa text-scene-text">{formatPrice(p.price)}</span><span className={ch >= 0 ? "text-bull" : "text-bear"}>{formatPercent(ch)}</span></Link>; })}
          </div>
        </div>
      </div>
      {/* Ticker preview */}
      <section id="daily-market" className="mx-auto max-w-7xl scroll-mt-24 px-5 sm:px-10">
        <div className="hairline-b py-8 sm:py-10">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-6">
            <div className="min-w-0">
              <div className="section-kicker">{t("home.todayBoard")}</div>
              <h2 className="font-display text-2xl sm:text-3xl text-olive-deep mt-1">{t("home.nutMarket")}</h2>
            </div>
            <Link to="/market" className="text-xs sm:text-sm tracking-widest text-cocoa hover:text-olive-deep shrink-0">
              {t("cta.allPrices")}
            </Link>
          </div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((p) => (
              <PriceCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="text-2xl font-light">{t("cta.analysis")}</h2><Button asChild variant="link" className="text-signal"><Link to="/analysis">{copy.fullAnalysis}</Link></Button></div>
        {featured[0] && <MarketChart product={featured[0]} compact />}
      </section>
      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ValueProp icon={<Leaf className="h-4 w-4" />} title={copy.values[0][0]} desc={copy.values[0][1]} />
          <ValueProp icon={<ShieldCheck className="h-4 w-4" />} title={copy.values[1][0]} desc={copy.values[1][1]} />
          <ValueProp icon={<BarChart3 className="h-4 w-4" />} title={copy.values[2][0]} desc={copy.values[2][1]} />
          <ValueProp icon={<Boxes className="h-4 w-4" />} title={copy.values[3][0]} desc={copy.values[3][1]} />
        </div>
      </section>

      <section className="experience-scene secondary mt-14">
        <img src={orchard} alt={locale === "fa" ? "تصویر هنری باغ پسته" : locale === "ar" ? "صورة فنية لبستان الفستق" : "Illustrative pistachio orchard"} width={1920} height={1024} loading="lazy" className="experience-scene-image" />
        <div className="experience-grid" aria-hidden="true">{Array.from({length:5},(_,i)=><span key={i}/>)}</div>
        <div className="experience-copy"><div className="mb-4 text-[10px] text-signal">02 — {t("nav.origin")}</div><h2>{copy.values[0][0]}</h2><p className="mt-4 max-w-sm text-sm leading-8 text-scene-muted">{copy.values[0][1]}</p><div className="mt-8"><Button asChild className="experience-enter"><Link to="/origin">{t("nav.origin")}<Arrow /></Link></Button></div></div>
      </section>
      {/* Movers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-10 sm:mt-16">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end mb-6 gap-3">
          <div>
            <div className="section-kicker">{copy.moversK}</div>
            <h2 className="font-display text-2xl sm:text-3xl text-olive-deep mt-1">{copy.movers}</h2>
          </div>
          <Link to="/analysis" className="text-xs sm:text-sm tracking-widest text-cocoa hover:text-olive-deep shrink-0">
            {copy.fullAnalysis}
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
                     <div className="text-[10px] tracking-widest uppercase text-brass-dark truncate">{localizeProduct(p, locale).origin}</div>
                     <div className="font-display text-olive-deep truncate mt-0.5">{localizeProduct(p, locale).name}</div>
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

      <section className="experience-scene secondary mt-16">
        <img src={slivers} alt={locale === "fa" ? "تصویر هنری مغز و خلال پسته" : locale === "ar" ? "صورة فنية لحبات وشرائح الفستق" : "Illustrative pistachio kernels and slivers"} width={1920} height={1024} loading="lazy" className="experience-scene-image" />
        <div className="experience-grid" aria-hidden="true">{Array.from({length:5},(_,i)=><span key={i}/>)}</div>
        <div className="experience-copy"><div className="mb-4 text-[10px] text-signal">03 — {copy.premiumK}</div><h2>{copy.premium}</h2><p className="mt-4 max-w-md text-sm leading-8 text-scene-muted">{copy.premiumBody}</p><div className="mt-8"><Button asChild className="experience-enter"><Link to="/products">{t("nav.products")}<Arrow /></Link></Button></div></div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-10">
        <div className="grid gap-4 md:grid-cols-2">{featured.map(p=><ProductCard key={p.id} product={p} size="lg" />)}</div>
      </section>
      {/* Others */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-12 sm:mt-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end mb-6 sm:mb-8 gap-3">
          <div>
            <div className="section-kicker">{copy.othersK}</div>
            <h2 className="font-display text-2xl sm:text-3xl text-olive-deep mt-1">{copy.others}</h2>
          </div>
          <Link to="/products" className="text-xs sm:text-sm tracking-widest text-cocoa hover:text-olive-deep shrink-0">
            {copy.allProducts}
          </Link>
        </div>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-12 sm:mt-20">
        <div className="border-t border-scene-line py-12 sm:py-20 text-center text-scene-text">
          <div className="text-[10px] text-signal">04 — {copy.wholesaleK}</div>
          <h2 className="font-display text-3xl sm:text-4xl text-scene-text mt-3">{copy.wholesale}</h2>
          <div className="gold-rule my-5" />
          <p className="text-scene-muted max-w-2xl mx-auto leading-8 text-sm sm:text-base">
            {copy.wholesaleBody}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild className="experience-enter"><Link to="/wholesale">{copy.terms}<Arrow /></Link></Button>
            <Button asChild variant="link" className="text-scene-text"><Link to="/contact">{copy.contact}<Arrow /></Link></Button>
          </div>
        </div>
      </section>

      <div className="h-16 sm:h-24" />
    </div>
  );
}


function ValueProp({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="border-t border-olive-deep/20 py-5">
      <div className="flex items-center gap-2 text-brass-dark text-[10px] tracking-[0.22em] uppercase">
        {icon}
        {title}
      </div>
      <p className="text-sm text-cocoa mt-3 leading-7">{desc}</p>
    </div>
  );
}
