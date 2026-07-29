import { Link } from "@tanstack/react-router";
import { computeChange, type Product } from "@/lib/store";
import { formatPercent, formatPrice } from "@/lib/format";

export function Heatmap({ products }: { products: Product[] }) {
  const items = products.map((p) => ({ p, ch: computeChange(p.history).pct }));
  const max = Math.max(0.001, ...items.map((i) => Math.abs(i.ch)));

  const bg = (ch: number) => {
    const t = Math.min(1, Math.abs(ch) / max);
    const color = ch >= 0 ? "var(--bull)" : "var(--bear)";
    return `color-mix(in oklab, ${color} ${(15 + t * 55).toFixed(0)}%, var(--tv-bg))`;
  };
  // size by absolute price share (as a proxy for weight)
  const total = items.reduce((a, b) => a + b.p.price, 0);
  const weight = (p: Product) => Math.max(6, Math.round((p.price / total) * 40));

  return (
    <div className="tv-panel rounded-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-tv-border bg-tv-headband">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass">Heatmap · نقشه بازار</div>
          <div className="font-display text-lg text-tv-text mt-0.5">وزن قیمت و تغییرات روز</div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] text-tv-muted">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-4 rounded-sm" style={{ background: "var(--bear)" }} /> نزول</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-4 rounded-sm" style={{ background: "var(--bull)" }} /> صعود</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 p-1 bg-tv-bg">
        {items
          .sort((a, b) => b.p.price - a.p.price)
          .map(({ p, ch }) => (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="relative rounded-sm p-3 transition-transform hover:scale-[1.02]"
              style={{
                background: bg(ch),
                gridRow: `span ${Math.min(2, weight(p) > 12 ? 2 : 1)}`,
              }}
            >
              <div className="text-[10px] uppercase tracking-widest text-tv-muted">{p.origin}</div>
              <div className="font-display text-tv-text text-sm mt-0.5 leading-tight line-clamp-2">
                {p.name}
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className={`num-fa text-xs ${ch >= 0 ? "text-bull" : "text-bear"}`}>
                  {formatPercent(ch)}
                </div>
                <div className="num-fa text-[10px] text-tv-muted">{formatPrice(p.price)}</div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
