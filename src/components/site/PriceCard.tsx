import { Link } from "@tanstack/react-router";
import { computeChange, type Product } from "@/lib/store";
import { formatPercent, formatPrice, formatJalali } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";
import { localizeProduct } from "@/lib/product-i18n";

export function PriceCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const { t, locale } = useTranslation();
  const l = localizeProduct(product, locale);
  const { pct } = computeChange(product.history);
  const trend = pct > 0.001 ? "up" : pct < -0.001 ? "down" : "flat";
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={`card-paper block rounded-sm p-4 sm:p-5 hover:-translate-y-0.5 ${
        featured ? "md:col-span-2 border-brass/60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.25em] uppercase text-brass-dark">
            {l.category}
          </div>
          <div className={`font-display text-olive-deep mt-1 truncate ${featured ? "text-2xl" : "text-lg"}`}>
            {l.name}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
             {t("meta.updated")}: {formatJalali(new Date(product.updatedAt))}
          </div>
        </div>
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
      </div>
      <div className="mt-5 flex items-baseline gap-2 border-t border-border/70 pt-4">
        <span className={`font-display num-fa text-olive-deep ${featured ? "text-4xl" : "text-2xl"}`}>
          {formatPrice(product.price)}
        </span>
        <span className="text-xs text-muted-foreground">{l.unit}</span>
      </div>
    </Link>
  );
}
