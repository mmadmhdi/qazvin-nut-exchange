import { useMemo } from "react";
import type { Product } from "@/lib/store";
import {
  trendScore, momentumScore, volatilityScore, liquidityScore, qualityScore, valueScore,
} from "@/lib/indicators";
import type { OHLC } from "@/lib/indicators";
import { localizedDigits } from "@/lib/format";
import { useTranslation } from "@/lib/i18n-provider";
import { marketCopy } from "@/lib/public-copy";

export function MarketSnowflake({ product, size = 220 }: { product: Product; size?: number }) {
  const { locale } = useTranslation();
  const copy = marketCopy(locale);
  const rows: OHLC[] = useMemo(
    () =>
      product.history.map((p) => ({
        date: p.date,
        open: p.open ?? p.price,
        high: p.high ?? p.price,
        low: p.low ?? p.price,
        close: p.close ?? p.price,
        volume: p.volume,
      })),
    [product.history],
  );

  const scores = useMemo(
    () => [
       { k: copy.scores[0], v: trendScore(rows) },
       { k: copy.scores[1], v: momentumScore(rows) },
       { k: copy.scores[2], v: volatilityScore(rows) },
       { k: copy.scores[3], v: liquidityScore(rows) },
       { k: copy.scores[4], v: qualityScore(product.price) },
       { k: copy.scores[5], v: valueScore(rows) },
    ],
     [rows, product.price, copy],
  );

  const cx = size / 2, cy = size / 2;
  const R = size / 2 - 34;
  const n = scores.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPts = scores
    .map((s, i) => {
      const p = pt(i, R * (s.v / 100));
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  const avg = scores.reduce((a, b) => a + b.v, 0) / scores.length;

  return (
    <div className="tv-panel rounded-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
           <div className="text-[10px] tracking-[0.3em] uppercase text-brass">Health · {copy.health}</div>
           <div className="font-display text-lg text-tv-text mt-0.5">{copy.overall}</div>
        </div>
        <div className="text-right">
           <div className="num-fa font-display text-3xl text-brass">{localizedDigits(avg.toFixed(0))}</div>
           <div className="text-[10px] text-tv-muted tracking-widest">{copy.outOf}</div>
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
        <svg width={size} height={size} className="shrink-0">
          {rings.map((r, i) => {
            const pts = Array.from({ length: n }, (_, k) => pt(k, R * r))
              .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
              .join(" ");
            return (
              <polygon
                key={i}
                points={pts}
                fill="none"
                stroke="var(--tv-border)"
                strokeOpacity={0.6}
                strokeDasharray={i === rings.length - 1 ? undefined : "2 3"}
              />
            );
          })}
          {scores.map((_, i) => {
            const p = pt(i, R);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--tv-border)" strokeOpacity={0.4} />;
          })}
          <polygon
            points={dataPts}
            fill="color-mix(in oklab, var(--brass) 25%, transparent)"
            stroke="var(--brass)"
            strokeWidth={1.5}
          />
          {scores.map((s, i) => {
            const p = pt(i, R + 18);
            return (
              <text
                key={s.k}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="var(--tv-muted)"
                style={{ letterSpacing: "0.05em" }}
              >
                {s.k}
              </text>
            );
          })}
        </svg>
        <div className="space-y-2">
          {scores.map((s) => (
            <div key={s.k} className="text-[11px]">
              <div className="flex justify-between text-tv-muted">
                <span>{s.k}</span>
                 <span className="num-fa text-tv-text">{localizedDigits(s.v.toFixed(0))}</span>
              </div>
              <div className="h-1 rounded-full bg-tv-border/60 overflow-hidden mt-1">
                <div
                  className="h-full bg-brass"
                  style={{ width: `${s.v}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
