import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Product } from "@/lib/store";
import { formatPrice, formatJalaliShort, toFaDigits } from "@/lib/format";

type Range = "7d" | "1m" | "3m" | "1y";
const RANGES: { key: Range; label: string; days: number }[] = [
  { key: "7d", label: "۷ روز", days: 7 },
  { key: "1m", label: "۱ ماه", days: 30 },
  { key: "3m", label: "۳ ماه", days: 90 },
  { key: "1y", label: "۱ سال", days: 365 },
];

export function MarketChart({ product }: { product: Product }) {
  const [range, setRange] = useState<Range>("3m");
  const data = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    const slice = product.history.slice(-days);
    return slice.map((p) => ({
      date: p.date,
      price: p.price,
      label: formatJalaliShort(new Date(p.date)),
    }));
  }, [product.history, range]);

  const min = Math.min(...data.map((d) => d.price));
  const max = Math.max(...data.map((d) => d.price));
  const pad = (max - min) * 0.15 || max * 0.05;

  return (
    <div className="card-paper rounded-sm p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">نمودار قیمت</div>
          <div className="font-display text-olive-deep text-xl mt-1">{product.name}</div>
        </div>
        <div className="flex rounded-sm border border-border overflow-hidden text-xs">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 transition-colors ${
                range === r.key
                  ? "bg-olive-deep text-paper"
                  : "bg-transparent text-cocoa hover:bg-cream"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="olv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--olive-deep)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--olive-deep)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="color-mix(in oklab, var(--olive-deep) 10%, transparent)" strokeDasharray="2 4" />
            <XAxis
              dataKey="label"
              reversed
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              minTickGap={24}
            />
            <YAxis
              orientation="right"
              domain={[min - pad, max + pad]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(v) => toFaDigits(Math.round(v / 1_000_000)) + "م"}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--foreground)",
              }}
              labelFormatter={(l) => `تاریخ: ${l}`}
              formatter={(v: number) => [formatPrice(v) + " " + product.unit, "قیمت"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--olive-deep)"
              strokeWidth={1.75}
              fill="url(#olv)"
              activeDot={{ r: 4, fill: "var(--brass-dark)", stroke: "var(--olive-deep)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
