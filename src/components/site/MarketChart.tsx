import { useMemo, useState } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine,
} from "recharts";
import type { Product, PricePoint } from "@/lib/store";
import { formatPrice, formatJalaliShort, toFaDigits } from "@/lib/format";

type Range = "7d" | "1m" | "3m" | "6m" | "1y";
const RANGES: { key: Range; label: string; days: number }[] = [
  { key: "7d", label: "۷ روز", days: 7 },
  { key: "1m", label: "۱ ماه", days: 30 },
  { key: "3m", label: "۳ ماه", days: 90 },
  { key: "6m", label: "۶ ماه", days: 180 },
  { key: "1y", label: "۱ سال", days: 365 },
];

type Style = "candle" | "line";

// Custom candlestick shape for Recharts Bar
function Candle(props: any) {
  const { x, y, width, height, payload } = props;
  if (!payload || payload.open == null || payload.close == null) return null;
  const { open, close, high, low } = payload;
  const cx = x + width / 2;
  const up = close >= open;
  const color = up ? "var(--bull)" : "var(--bear)";
  // y and height cover [low..high] in pixel space. Convert to per-value.
  const range = high - low || 1;
  const yFromValue = (v: number) => y + ((high - v) / range) * height;
  const bodyTop = yFromValue(Math.max(open, close));
  const bodyBottom = yFromValue(Math.min(open, close));
  const bodyH = Math.max(1, bodyBottom - bodyTop);
  const bodyW = Math.max(2, width * 0.65);
  return (
    <g>
      <line x1={cx} x2={cx} y1={y} y2={y + height} stroke={color} strokeWidth={1} />
      <rect
        x={cx - bodyW / 2}
        y={bodyTop}
        width={bodyW}
        height={bodyH}
        fill={up ? color : color}
        stroke={color}
      />
    </g>
  );
}

function movingAverage(data: PricePoint[], win: number) {
  return data.map((_, i) => {
    if (i < win - 1) return null;
    let sum = 0;
    for (let j = i - win + 1; j <= i; j++) sum += data[j].close ?? data[j].price;
    return sum / win;
  });
}

export function MarketChart({ product }: { product: Product }) {
  const [range, setRange] = useState<Range>("3m");
  const [style, setStyle] = useState<Style>("candle");

  const { data, stats } = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    const slice = product.history.slice(-days);
    const ma20 = movingAverage(slice, Math.min(20, Math.max(3, Math.floor(days / 6))));
    const rows = slice.map((p, i) => {
      const close = p.close ?? p.price;
      const open = p.open ?? close;
      const high = p.high ?? Math.max(open, close);
      const low = p.low ?? Math.min(open, close);
      return {
        date: p.date,
        label: formatJalaliShort(new Date(p.date)),
        open, high, low, close,
        volume: p.volume ?? 0,
        // For candlestick Bar we plot the [low..high] range using a stacked
        // approach: base (transparent) low, then range as candle-drawn Bar.
        base: low,
        range: high - low,
        ma: ma20[i],
        upVolume: (close >= open) ? p.volume ?? 0 : 0,
        dnVolume: (close < open) ? p.volume ?? 0 : 0,
      };
    });
    const first = rows[0];
    const last = rows[rows.length - 1];
    const hi = Math.max(...rows.map((r) => r.high));
    const lo = Math.min(...rows.map((r) => r.low));
    const chg = last ? last.close - (first?.close ?? last.close) : 0;
    const chgPct = first?.close ? (chg / first.close) * 100 : 0;
    return { data: rows, stats: { last, hi, lo, chg, chgPct } };
  }, [product.history, range]);

  const min = stats.lo;
  const max = stats.hi;
  const pad = (max - min) * 0.12 || max * 0.03;
  const domain: [number, number] = [min - pad, max + pad];

  return (
    <div className="tv-panel rounded-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-tv-border bg-tv-headband">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass">DARJ · MARKET</div>
          <div className="font-display text-tv-text text-lg mt-0.5 truncate">{product.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-sm border border-tv-border overflow-hidden text-[11px]">
            {(["candle","line"] as Style[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-2.5 py-1 transition-colors ${style===s?"bg-brass/20 text-brass":"text-tv-muted hover:text-tv-text"}`}
              >{s === "candle" ? "شمعی" : "خطی"}</button>
            ))}
          </div>
          <div className="flex rounded-sm border border-tv-border overflow-hidden text-[11px]">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-2.5 py-1 transition-colors ${
                  range === r.key ? "bg-brass/20 text-brass" : "text-tv-muted hover:text-tv-text"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OHLC strip */}
      {stats.last && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 border-b border-tv-border text-[11px] bg-tv-bg">
          <Stat k="O" v={stats.last.open} />
          <Stat k="H" v={stats.last.high} />
          <Stat k="L" v={stats.last.low} />
          <Stat k="C" v={stats.last.close} accent />
          <div className={`num-fa ${stats.chg >= 0 ? "text-bull" : "text-bear"}`}>
            {stats.chg >= 0 ? "+" : "−"}
            {toFaDigits(Math.abs(stats.chgPct).toFixed(2))}٪
          </div>
          <div className="text-tv-muted mr-auto">{product.unit}</div>
        </div>
      )}

      {/* Price chart */}
      <div className="h-64 bg-tv-bg px-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 42, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="label"
              reversed
              tick={{ fill: "var(--tv-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--tv-border)" }}
              minTickGap={28}
              hide
            />
            <YAxis
              orientation="right"
              domain={domain}
              tick={{ fill: "var(--tv-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--tv-border)" }}
              tickFormatter={(v) => toFaDigits(Math.round(v / 1_000_000)) + "م"}
              width={44}
            />
            <ReferenceLine
              y={stats.last?.close}
              stroke="var(--brass)"
              strokeDasharray="2 3"
              strokeOpacity={0.5}
            />
            <Tooltip
              cursor={{ stroke: "var(--brass)", strokeOpacity: 0.4, strokeDasharray: "2 3" }}
              contentStyle={{
                background: "var(--tv-bg)",
                border: "1px solid var(--tv-border)",
                borderRadius: 4,
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                color: "var(--tv-text)",
              }}
              labelFormatter={(l) => `تاریخ: ${l}`}
              formatter={(v: any, key: string) => {
                if (typeof v !== "number") return [v, key];
                const map: Record<string, string> = { open: "باز", high: "بالا", low: "پایین", close: "بسته", ma: "میانگین", range: "دامنه" };
                if (key === "range" || key === "base" || key === "upVolume" || key === "dnVolume" || key === "volume") return [null as any, null as any];
                return [formatPrice(v), map[key] ?? key];
              }}
            />
            {style === "candle" ? (
              <Bar
                dataKey="range"
                // stacked from `base` so bar's y..y+height maps to [low..high]
                stackId="candle"
                shape={<Candle />}
                isAnimationActive={false}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="close"
                stroke="var(--brass)"
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="ma"
              stroke="var(--olive)"
              strokeWidth={1.25}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
            {style === "candle" && (
              <Bar dataKey="base" stackId="candle" fill="transparent" isAnimationActive={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume panel */}
      <div className="h-16 bg-tv-bg border-t border-tv-border">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 42, left: 4, bottom: 4 }}>
            <XAxis
              dataKey="label"
              reversed
              tick={{ fill: "var(--tv-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--tv-border)" }}
              minTickGap={40}
            />
            <YAxis
              orientation="right"
              tick={{ fill: "var(--tv-muted)", fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: "var(--tv-border)" }}
              width={44}
              hide
            />
            <Bar dataKey="volume" isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.close >= d.open ? "color-mix(in oklab, var(--bull) 55%, transparent)" : "color-mix(in oklab, var(--bear) 55%, transparent)"} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="px-4 py-2 border-t border-tv-border bg-tv-headband text-[10px] text-tv-muted flex items-center justify-between">
        <span>MA · میانگین متحرک</span>
        <span className="tracking-widest">DARJ SABZ · CHART</span>
      </div>
    </div>
  );
}

function Stat({ k, v, accent }: { k: string; v: number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-tv-muted">{k}</span>
      <span className={`num-fa ${accent ? "text-brass" : "text-tv-text"}`}>{formatPrice(v)}</span>
    </div>
  );
}
