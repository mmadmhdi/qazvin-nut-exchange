import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { useStore } from "@/lib/store";
import { PriceCard } from "@/components/site/PriceCard";
import { ProductCard } from "@/components/site/ProductCard";
import { MarketChart } from "@/components/site/MarketChart";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n-provider";
import { homeCopy } from "@/lib/public-copy";

import { ArrowLeft, ArrowRight } from "lucide-react";
import heroImage from "@/assets/pistachio-noir-hero.jpg";
import orchardImage from "@/assets/pistachio-orchard.jpg";

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
  const active = products.filter((p) => p.active).sort((a, b) => b.priority - a.priority);
  const featured = active.filter((p) => p.featured);
  const others = active.filter((p) => !p.featured);
  const top = active.slice(0, 4);

  const Arrow = locale === "en" ? ArrowRight : ArrowLeft;
  const brandName = locale === "fa" ? settings.brandName : settings.brandLatin;
  return (
    <div className="experience-home">
      <section className="home-hero" aria-labelledby="experience-title">
        <img src={heroImage} alt={brandName} width={1920} height={1088} fetchPriority="high" />
        <div className="home-hero-content mx-auto w-full max-w-7xl px-6 sm:px-10">
          <div className="experience-copy max-w-xl">
            <p className="mb-8 text-xs text-scene-muted">{copy.est} <span className="mx-3 text-scene-line">/</span> <span dir="ltr">{settings.brandLatin}</span></p>
            <h1 id="experience-title" className="home-brand-title font-display text-scene-text">{brandName}</h1>
            <p className="mt-6 max-w-sm text-sm leading-8 text-scene-muted">{heroTitle}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button asChild size="lg" variant="ghost" className="luxury-link"><Link to="/products">{copy.allProducts.replace(/[←→]/g, "").trim()}<Arrow /></Link></Button>
              <Button asChild variant="link" className="px-0 text-xs text-scene-muted"><Link to="/market">{t("cta.liveMarket")}</Link></Button>
            </div>
          </div>
        </div>
        <div className="hero-footnote"><span dir="ltr">DORJESABZ</span><a href="#daily-market" aria-label={t("home.nutMarket")} className="hero-scroll"><span className="h-8 w-px bg-scene-muted" /></a><span>{copy.premiumK}</span></div>
      </section>

      <section id="daily-market" className="mx-auto max-w-7xl scroll-mt-24 px-5 sm:px-10">
        <div className="border-t border-scene-line py-14 sm:py-20">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-8">
            <div><p className="mb-3 text-[10px] text-scene-muted" dir="ltr">01 / MARKET</p><h2 className="font-display text-2xl sm:text-3xl text-scene-text">{t("home.nutMarket")}</h2></div>
            <Link to="/market" className="text-xs sm:text-sm tracking-widest text-scene-muted hover:text-signal shrink-0">
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

      <section className="provenance-scene" aria-labelledby="provenance-title">
        <img src={orchardImage} alt={t("nav.origin")} loading="lazy" width={1920} height={1024} />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="max-w-md">
            <p className="mb-6 text-[10px] text-scene-muted" dir="ltr">02 / PROVENANCE</p>
            <h2 id="provenance-title" className="font-display text-3xl leading-relaxed text-scene-text sm:text-4xl">{t("nav.origin")}</h2>
            <p className="mt-6 text-sm leading-8 text-scene-muted">{copy.premiumBody}</p>
            <Button asChild variant="ghost" className="luxury-link mt-8"><Link to="/origin">{t("nav.origin")}<Arrow /></Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="border-t border-scene-line py-10 sm:py-14">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl text-scene-text">{t("cta.analysis")}</h2>
            <Button asChild variant="link" className="text-signal"><Link to="/analysis">{copy.fullAnalysis}</Link></Button>
          </div>
          {featured[0] && <MarketChart product={featured[0]} compact />}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="border-t border-scene-line py-10 sm:py-14">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end mb-8 gap-3">
            <div><p className="mb-3 text-[10px] text-scene-muted" dir="ltr">03 / COLLECTION</p><h2 className="font-display text-2xl sm:text-3xl text-scene-text">{copy.premiumK}</h2></div>
            <Link to="/products" className="text-xs sm:text-sm tracking-widest text-scene-muted hover:text-signal shrink-0">
              {copy.allProducts}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">{featured.map(p=><ProductCard key={p.id} product={p} size="lg" />)}</div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-3 sm:mt-4">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="border-t border-scene-line py-14 sm:py-20 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-scene-text">{copy.wholesale}</h2>
          <p className="text-scene-muted max-w-xl mx-auto leading-8 text-sm mt-4">
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
