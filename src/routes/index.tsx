import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PriceCard } from "@/components/site/PriceCard";
import { ProductCard } from "@/components/site/ProductCard";
import { MarketChart } from "@/components/site/MarketChart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "خانه پسته قزوین — میراث خانوادگی خلال پسته" },
      { name: "description", content: "قیمت شفاف خلال پسته قزوین و بویین، در تابلویی باوقار برای تجارت اصیل خشکبار." },
      { property: "og:title", content: "خانه پسته قزوین" },
      { property: "og:description", content: "بازار روز خلال پسته، اصالت و اعتماد در تجارت خانوادگی." },
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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream/60 via-background to-background" />
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl">
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
                مشاهده بازار امروز
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-sm border border-olive-deep/40 px-6 py-3 text-sm tracking-widest text-olive-deep hover:bg-cream transition-colors"
              >
                داستان ما
              </Link>
            </div>
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
          <div className="grid gap-4 md:grid-cols-3">
            {top.map((p, i) => (
              <PriceCard key={p.id} product={p} featured={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured pistachio */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">محصولات ممتاز</div>
          <h2 className="font-display text-4xl text-olive-deep mt-2">خلال پسته، افتخار خانه</h2>
          <div className="gold-rule my-6" />
          <p className="text-cocoa leading-8">
            دو نگین اصلی بازار ما، برگرفته از باغ‌های قزوین و بویین‌زهرا؛ محصولاتی که سال‌ها اعتبار تجارت خانوادگی ما بر آن استوار است.
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

      <div className="h-24" />
    </div>
  );
}
