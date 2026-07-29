import { Link } from "@tanstack/react-router";
import { computeChange, type Product } from "@/lib/store";
import { formatPercent, formatPrice, formatJalali } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function PriceCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const hasPrice = product.history.length > 0 && product.price > 0;
  const { pct } = computeChange(product.history);
  const trend = pct > 0.001 ? "up" : pct < -0.001 ? "down" : "flat";
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={`card-paper block rounded-sm p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)] ${
        featured ? "md:col-span-2 border-brass/60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.25em] uppercase text-brass-dark">
            {product.category}
          </div>
          <div className={`font-display text-olive-deep mt-1 truncate ${featured ? "text-2xl" : "text-lg"}`}>
            {product.name}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {hasPrice ? `به‌روزرسانی: ${formatJalali(new Date(product.updatedAt))}` : "در انتظار ثبت قیمت"}
          </div>
        </div>
        {hasPrice && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-sm border ${
              trend === "up"
                ? "text-bull border-bull/40 bg-bull/5"
                : trend === "down"
                  ? "text-bear border-bear/40 bg-bear/5"
                  : "text-muted-foreground border-border"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : trend === "down" ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span className="num-fa">{formatPercent(pct)}</span>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        {hasPrice ? (
          <>
            <span className={`font-display num-fa text-olive-deep ${featured ? "text-4xl" : "text-2xl"}`}>
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">{product.unit}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">هنوز قیمت ثبت نشده است.</span>
        )}
      </div>
    </Link>
  );
}
