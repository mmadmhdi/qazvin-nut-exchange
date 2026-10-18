import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { useStore, computeChange } from "@/lib/store";
import { PriceCard } from "@/components/site/PriceCard";
import { ProductCard } from "@/components/site/ProductCard";
import { MarketChart } from "@/components/site/MarketChart";
import { Button } from "@/components/ui/button";
import growers from "@/assets/pistachio-growers.jpg";
import { useTranslation } from "@/lib/i18n-provider";
import { localizeProduct } from "@/lib/product-i18n";
import { homeCopy } from "@/lib/public-copy";

import { formatPercent, formatPrice } from "@/lib/format";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
        <div className="experience-copy">
          <h1 id="experience-title" className="text-scene-text">{brandName}</h1>
          <p className="mt-2 text-xl font-light leading-9 text-scene-text sm:text-2xl">{heroTitle}</p>
          <p className="mt-5 max-w-md text-sm font-light leading-7 text-scene-muted">{heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Button asChild className="experience-enter"><Link to="/market">{t("cta.liveMarket")}<Arrow /></Link></Button>
            <Button asChild variant="link" className="p-0 text-scene-text"><Link to="/origin">{t("nav.origin")}<Arrow /></Link></Button>
          </div>
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
          <h2 className="font-display text-3xl sm:text-4xl text-scene-text mt-3">{copy.wholesale}</h2>
          <p className="text-scene-muted max-w-2xl mx-auto leading-8 text-sm sm:text-base mt-5">
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
