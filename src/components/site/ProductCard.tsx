import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product, size = "sm" }: { product: Product; size?: "sm" | "lg" }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={`card-paper block rounded-sm ${size === "lg" ? "p-8" : "p-5"} group`}
    >
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">
        {product.category} · {product.grade}
      </div>
      <h3 className={`font-display text-olive-deep mt-2 ${size === "lg" ? "text-3xl" : "text-lg"}`}>
        {product.name}
      </h3>
      <p className={`mt-3 text-muted-foreground ${size === "lg" ? "text-sm leading-7" : "text-xs leading-6 line-clamp-2"}`}>
        {product.description}
      </p>
      <div className="mt-6 flex items-end justify-between hairline-t pt-4">
        <div>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground">قیمت روز</div>
          <div className={`font-display num-fa text-olive-deep ${size === "lg" ? "text-3xl" : "text-xl"}`}>
            {formatPrice(product.price)}
            <span className="text-xs text-muted-foreground mr-2">{product.unit}</span>
          </div>
        </div>
        <span className="text-xs text-brass-dark tracking-widest uppercase group-hover:text-olive-deep transition-colors">
          مشاهده →
        </span>
      </div>
    </Link>
  );
}
