import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, computeChange } from "@/lib/store";
import { MarketChart } from "@/components/site/MarketChart";
import { MarketSnowflake } from "@/components/site/MarketSnowflake";
import { PriceHistoryTable } from "@/components/site/PriceHistoryTable";
import { getPassport, passportRows } from "@/lib/passport";
import { formatPrice, formatJalali, formatPercent } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const title = `${params.slug} — قیمت، نمودار و شناسنامه | درج سبز قزوین`;
    const desc = "قیمت روز، نمودار تکنیکال و شناسنامه دیجیتال محصول خشکبار در تابلوی درج سبز قزوین.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { products, settings } = useStore();
  const product = products.find((p) => p.slug === slug || p.id === slug);
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-olive-deep">محصول یافت نشد</h1>
        <p className="mt-3 text-muted-foreground">این محصول در فهرست ما موجود نیست.</p>
        <Link to="/products" className="mt-6 inline-block text-brass-dark hover:text-olive-deep">بازگشت به محصولات ←</Link>
      </div>
    );
  }
  const { pct } = computeChange(product.history);
  const up = pct >= 0;

  const closes = product.history.map((h) => h.close ?? h.price);
  const hi52 = Math.max(...closes);
  const lo52 = Math.min(...closes);
  const first = closes[0];
  const yr = ((closes[closes.length - 1] - first) / first) * 100;
  const inRange = ((product.price - lo52) / (hi52 - lo52 || 1)) * 100;

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
      <Link to="/products" className="text-xs tracking-widest text-muted-foreground hover:text-olive-deep">
        ← بازگشت به کاتالوگ
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">
            {product.category} · {product.grade}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-olive-deep mt-2 leading-tight">{product.name}</h1>
          <div className="gold-rule my-6" />
          <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
            <div className="font-display num-fa text-4xl sm:text-5xl text-olive-deep">
              {formatPrice(product.price)}
            </div>
            <div className="text-sm text-muted-foreground">{product.unit}</div>
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-sm border ${up ? "text-bull border-bull/40" : "text-bear border-bear/40"}`}>
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span className="num-fa">{formatPercent(pct)}</span>
            </div>
          </div>
          <p className="mt-6 text-cocoa leading-8">{product.description}</p>

          {/* Key stats grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat k="بالاترین دوره" v={formatPrice(hi52)} />
            <Stat k="پایین‌ترین دوره" v={formatPrice(lo52)} />
            <Stat k="بازدهی دوره" v={formatPercent(yr)} accent={yr >= 0 ? "bull" : "bear"} />
            <Stat k="موقعیت در دامنه" v={`${Math.round(inRange)}٪`} bar={inRange} />
          </div>

          {/* Chart */}
          <div className="mt-8">
            <MarketChart product={product} />
          </div>

          {/* Fundamentals */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Meta k="منشأ" v={product.origin} />
            <Meta k="درجه کیفی" v={product.grade} />
            <Meta k="آخرین به‌روزرسانی" v={formatJalali(new Date(product.updatedAt))} />
          </div>

          {/* Pistachio Passport */}
          <div className="mt-10 card-paper rounded-sm p-5 sm:p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Pistachio Passport</div>
                <h2 className="mt-1 font-display text-2xl text-olive-deep">شناسنامه محصول</h2>
              </div>
              <BadgeCheck className="h-5 w-5 shrink-0 text-brass-dark" />
            </div>
            <div className="gold-rule my-4" />
            <dl className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {passportRows(getPassport(product)).map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[minmax(0,110px)_minmax(0,1fr)] gap-3 border-b border-border/50 py-2 text-sm"
                >
                  <dt className="text-xs text-muted-foreground">{r.label}</dt>
                  <dd className="min-w-0 text-cocoa">{r.value}</dd>
                </div>
              ))}
            </dl>
            <Link to="/origin" className="mt-4 inline-block text-xs tracking-widest text-brass-dark hover:text-olive-deep">
              مسیر از باغ تا بسته ←
            </Link>
          </div>



          <div className="mt-10 flex flex-wrap gap-3">
            <a href={`tel:${settings.contactPhone}`} className="inline-flex items-center rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive">
              تماس برای استعلام
            </a>
            <Link to="/wholesale" className="inline-flex items-center rounded-sm border border-olive-deep/40 px-6 py-3 text-sm tracking-widest text-olive-deep hover:bg-cream">
              شرایط عمده
            </Link>
          </div>
        </div>
        <div className="space-y-6 min-w-0">
          <MarketSnowflake product={product} />
          <PriceHistoryTable history={product.history} />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">محصولات مشابه</div>
          <h2 className="font-display text-2xl text-olive-deep mt-1 mb-6">از همین دسته</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => {
              const c = computeChange(r.history).pct;
              const u = c >= 0;
              return (
                <Link
                  key={r.id}
                  to="/products/$slug"
                  params={{ slug: r.slug }}
                  className="card-paper rounded-sm p-4 hover:-translate-y-0.5 transition-transform block"
                >
                  <div className="text-[10px] tracking-widest uppercase text-brass-dark">{r.origin}</div>
                  <div className="font-display text-lg text-olive-deep mt-1 truncate">{r.name}</div>
                  <div className="flex items-baseline justify-between mt-3">
                    <div className="num-fa text-olive-deep font-display">{formatPrice(r.price)}</div>
                    <div className={`num-fa text-xs ${u ? "text-bull" : "text-bear"}`}>
                      {u ? "+" : "−"}{Math.abs(c).toFixed(1)}٪
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="hairline-t pt-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-cocoa mt-1">{v}</div>
    </div>
  );
}

function Stat({ k, v, accent, bar }: { k: string; v: string; accent?: "bull" | "bear"; bar?: number }) {
  return (
    <div className="card-paper rounded-sm p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className={`num-fa mt-1 font-display text-lg truncate ${accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-olive-deep"}`}>
        {v}
      </div>
      {bar != null && (
        <div className="mt-2 h-1 rounded-full bg-border/50 overflow-hidden">
          <div className="h-full bg-brass" style={{ width: `${Math.max(0, Math.min(100, bar))}%` }} />
        </div>
      )}
    </div>
  );
}
