import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { MarketChart } from "@/components/site/MarketChart";
import { PriceHistoryTable } from "@/components/site/PriceHistoryTable";
import { formatPrice, formatJalali, formatPercent } from "@/lib/format";
import { computeChange } from "@/lib/store";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({
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
  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <Link to="/products" className="text-xs tracking-widest text-muted-foreground hover:text-olive-deep">
        ← بازگشت به کاتالوگ
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">
            {product.category} · {product.grade}
          </div>
          <h1 className="font-display text-5xl text-olive-deep mt-2">{product.name}</h1>
          <div className="gold-rule my-6" />
          <div className="flex items-baseline gap-4">
            <div className="font-display num-fa text-5xl text-olive-deep">
              {formatPrice(product.price)}
            </div>
            <div className="text-sm text-muted-foreground">{product.unit}</div>
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-sm border ${up ? "text-bull border-bull/40" : "text-bear border-bear/40"}`}>
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span className="num-fa">{formatPercent(pct)}</span>
            </div>
          </div>
          <p className="mt-8 text-cocoa leading-8">{product.description}</p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 hairline-t pt-6">
            <Meta k="منشأ" v={product.origin} />
            <Meta k="درجه کیفی" v={product.grade} />
            <Meta k="دسته" v={product.category} />
            <Meta k="آخرین به‌روزرسانی" v={formatJalali(new Date(product.updatedAt))} />
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={`tel:${settings.contactPhone}`} className="inline-flex items-center rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive">
              تماس برای استعلام
            </a>
            <Link to="/contact" className="inline-flex items-center rounded-sm border border-olive-deep/40 px-6 py-3 text-sm tracking-widest text-olive-deep hover:bg-cream">
              ارسال درخواست
            </Link>
          </div>
        </div>
        <div className="space-y-6">
          <MarketChart product={product} />
          <PriceHistoryTable history={product.history} />
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-cocoa mt-1">{v}</div>
    </div>
  );
}
