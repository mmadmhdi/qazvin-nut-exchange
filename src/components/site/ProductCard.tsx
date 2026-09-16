import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { useTranslation } from "@/lib/i18n-provider";
import { localizeProduct } from "@/lib/product-i18n";

export function ProductCard({ product, size = "sm" }: { product: Product; size?: "sm" | "lg" }) {
  const { t, locale } = useTranslation();
  const l = localizeProduct(product, locale);
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={`card-paper block rounded-sm ${size === "lg" ? "p-4 sm:p-8" : "p-4 sm:p-5"} group`}
    >
      <div className="text-[10px] tracking-[0.2em] uppercase text-brass-dark">
        {l.category} · {l.grade}
      </div>
      <h3
        className={`font-display text-olive-deep mt-1.5 ${
          size === "lg" ? "text-xl sm:text-3xl" : "text-lg"
        }`}
      >
        {l.name}
      </h3>
      <p
        className={`mt-2 text-muted-foreground line-clamp-2 ${
          size === "lg" ? "text-xs leading-6 sm:text-sm sm:leading-7 sm:line-clamp-none" : "text-xs leading-6"
        }`}
      >
        {l.description}
      </p>
      <div className="mt-3 sm:mt-5 flex items-end justify-between gap-3 hairline-t pt-3 sm:pt-4">
        <div className="min-w-0">
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
            {t("products.todayPrice")}
          </div>
          <div
            className={`font-display num-fa text-olive-deep leading-tight ${
              size === "lg" ? "text-xl sm:text-3xl" : "text-lg sm:text-xl"
            }`}
          >
            {formatPrice(product.price)}
            <span className="text-[10px] text-muted-foreground mx-1.5">{l.unit}</span>
          </div>
        </div>
        <span className="shrink-0 text-[11px] text-brass-dark tracking-widest uppercase group-hover:text-olive-deep transition-colors">
          {t("products.view")}
        </span>
      </div>
    </Link>
  );
}
