import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Product, PricePoint } from "@/lib/store";
import { formatPrice, formatJalaliShort, toFaDigits } from "@/lib/format";
import {
  bollinger,
  ema,
  heikinAshi,
  macd as calcMacd,
  rsi as calcRsi,
  sma,
  atr as calcAtr,
  stochastic,
  vwap as calcVwap,
  fibonacciLevels,
  type OHLC,
} from "@/lib/indicators";
import {
  BarChart3,
  CandlestickChart,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
  Activity,
  Waves,
  Layers,
  GitBranch,
  Zap,
} from "lucide-react";

type Range = "1w" | "1m" | "3m" | "6m" | "1y" | "all";
const RANGES: { key: Range; label: string; days: number }[] = [
  { key: "1w", label: "۱ه", days: 7 },
  { key: "1m", label: "۱م", days: 30 },
  { key: "3m", label: "۳م", days: 90 },
  { key: "6m", label: "۶م", days: 180 },
  { key: "1y", label: "۱س", days: 365 },
  { key: "all", label: "کل", days: 9999 },
];

type Style = "candle" | "line" | "area" | "ha";

type Overlays = {
  ma20: boolean;
  ma50: boolean;
  ema50: boolean;
  bb: boolean;
  vwap: boolean;
  fib: boolean;
};
type SubPanel = "volume" | "rsi" | "macd" | "stoch";

// ─────────────────────────── Candle shape ───────────────────────────
function Candle(props: any) {
  const { x, y, width, height, payload } = props;
  if (!payload || payload.open == null) return null;
  const { open, close, high, low } = payload;
  const cx = x + width / 2;
  const up = close >= open;
  const color = up ? "var(--bull)" : "var(--bear)";
  const range = high - low || 1;
  const yFromValue = (v: number) => y + ((high - v) / range) * height;
  const bodyTop = yFromValue(Math.max(open, close));
  const bodyBottom = yFromValue(Math.min(open, close));
  const bodyH = Math.max(1, bodyBottom - bodyTop);
  const bodyW = Math.max(2, width * 0.62);
  return (
    <g>
      <line x1={cx} x2={cx} y1={y} y2={y + height} stroke={color} strokeWidth={1} />
      <rect
        x={cx - bodyW / 2}
        y={bodyTop}
        width={bodyW}
        height={bodyH}
        fill={color}
        stroke={color}
      />
    </g>
  );
}

// ─────────────────────────── Component ───────────────────────────
export function MarketChart({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [range, setRange] = useState<Range>("3m");
  const [style, setStyle] = useState<Style>("candle");
  const [overlays, setOverlays] = useState<Overlays>({ ma20: true, ma50: false, ema50: false, bb: false, vwap: false, fib: false });
  const [panels, setPanels] = useState<Record<SubPanel, boolean>>({ volume: true, rsi: false, macd: false, stoch: false });
  const [hover, setHover] = useState<any | null>(null);

  const { data, stats, meta } = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    let raw: PricePoint[] = product.history.slice(-days);
    const asOHLC: OHLC[] = raw.map((p) => ({
      date: p.date,
      open: p.open ?? p.price,
      high: p.high ?? p.price,
      low: p.low ?? p.price,
      close: p.close ?? p.price,
      volume: p.volume ?? 0,
    }));
    const rows = style === "ha" ? heikinAshi(asOHLC) : asOHLC;
    const closes = rows.map((r) => r.close);

    const ma20 = sma(closes, Math.min(20, Math.max(5, Math.floor(rows.length / 6))));
    const ma50 = sma(closes, Math.min(50, Math.max(10, Math.floor(rows.length / 3))));
    const em50 = ema(closes, Math.min(50, Math.max(10, Math.floor(rows.length / 3))));
    const bb = bollinger(closes, Math.min(20, Math.max(6, Math.floor(rows.length / 5))), 2);
    const r14 = calcRsi(closes, 14);
    const m = calcMacd(closes, 12, 26, 9);
    const at = calcAtr(rows, 14);

    const chartRows = rows.map((r, i) => ({
      date: r.date,
      label: formatJalaliShort(new Date(r.date)),
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: r.volume ?? 0,
      base: r.low,
      range: r.high - r.low,
      ma20: ma20[i],
      ma50: ma50[i],
      ema50: em50[i],
      bbU: bb.upper[i],
      bbM: bb.mid[i],
      bbL: bb.lower[i],
      rsi: r14[i],
      macd: m.macd[i],
      macdSignal: m.signal[i],
      macdHist: m.hist[i],
      up: r.close >= r.open,
    }));

    const first = chartRows[0];
    const last = chartRows[chartRows.length - 1];
    const hi = Math.max(...chartRows.map((r) => r.high));
    const lo = Math.min(...chartRows.map((r) => r.low));
    const chg = last ? last.close - (first?.close ?? last.close) : 0;
    const chgPct = first?.close ? (chg / first.close) * 100 : 0;
    const avgVol =
      chartRows.reduce((s, r) => s + r.volume, 0) / Math.max(1, chartRows.length);
    const atrLast = at[at.length - 1] ?? 0;

    return {
      data: chartRows,
      stats: { last, first, hi, lo, chg, chgPct },
      meta: { avgVol, atrLast, bars: chartRows.length },
    };
  }, [product.history, range, style]);

  const min = stats.lo;
  const max = stats.hi;
  const pad = (max - min) * 0.12 || max * 0.03;
  const domain: [number, number] = [min - pad, max + pad];
  const current = hover ?? stats.last;

  const priceHeight = compact ? "h-64" : "h-72 md:h-96";

  return (
    <div className="tv-panel rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 md:px-4 py-3 border-b border-tv-border bg-tv-headband">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass">DARJ · MARKET</div>
          <div className="font-display text-tv-text text-base md:text-lg mt-0.5 truncate">{product.name}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <SegGroup>
            {(["candle", "ha", "line", "area"] as Style[]).map((s) => (
              <SegBtn key={s} on={style === s} onClick={() => setStyle(s)} title={styleLabel(s)}>
                {styleIcon(s)}
              </SegBtn>
            ))}
          </SegGroup>
          <SegGroup>
            {RANGES.map((r) => (
              <SegBtn key={r.key} on={range === r.key} onClick={() => setRange(r.key)}>
                <span className="text-[11px] px-0.5">{r.label}</span>
              </SegBtn>
            ))}
          </SegGroup>
        </div>
      </div>

      {/* OHLC + indicator toggles */}
      <div className="px-3 md:px-4 py-2 border-b border-tv-border bg-tv-bg">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
          {current && (
            <>
              <OHLCStat k="O" v={current.open} />
              <OHLCStat k="H" v={current.high} />
              <OHLCStat k="L" v={current.low} />
              <OHLCStat k="C" v={current.close} accent />
              <div className={`num-fa ${stats.chg >= 0 ? "text-bull" : "text-bear"}`}>
                {stats.chg >= 0 ? "+" : "−"}
                {toFaDigits(Math.abs(stats.chgPct).toFixed(2))}٪
              </div>
              <div className="text-tv-muted">
                <span className="mx-1">V</span>
                <span className="num-fa text-tv-text">{toFaDigits(current.volume ?? 0)}</span>
              </div>
              <div className="text-tv-muted mr-auto hidden sm:block">{product.unit}</div>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <ToggleChip on={overlays.ma20} onClick={() => setOverlays({ ...overlays, ma20: !overlays.ma20 })}>
            MA20
          </ToggleChip>
          <ToggleChip on={overlays.ma50} onClick={() => setOverlays({ ...overlays, ma50: !overlays.ma50 })}>
            MA50
          </ToggleChip>
          <ToggleChip on={overlays.ema50} onClick={() => setOverlays({ ...overlays, ema50: !overlays.ema50 })}>
            EMA50
          </ToggleChip>
          <ToggleChip on={overlays.bb} onClick={() => setOverlays({ ...overlays, bb: !overlays.bb })}>
            <Waves className="h-3 w-3" /> BB
          </ToggleChip>
          <span className="mx-2 h-4 w-px bg-tv-border" />
          <ToggleChip on={panels.volume} onClick={() => setPanels({ ...panels, volume: !panels.volume })}>
            <BarChart3 className="h-3 w-3" /> Vol
          </ToggleChip>
          <ToggleChip on={panels.rsi} onClick={() => setPanels({ ...panels, rsi: !panels.rsi })}>
            <Activity className="h-3 w-3" /> RSI
          </ToggleChip>
          <ToggleChip on={panels.macd} onClick={() => setPanels({ ...panels, macd: !panels.macd })}>
            <Layers className="h-3 w-3" /> MACD
          </ToggleChip>
        </div>
      </div>

      {/* Price panel */}
      <div className={`${priceHeight} bg-tv-bg px-1`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 46, left: 4, bottom: 0 }}
            onMouseMove={(s: any) => s?.activePayload && setHover(s.activePayload[0]?.payload)}
            onMouseLeave={() => setHover(null)}
          >
            <XAxis
              dataKey="label"
              reversed
              tick={{ fill: "var(--tv-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--tv-border)" }}
              minTickGap={30}
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
            <ReferenceLine y={stats.last?.close} stroke="var(--brass)" strokeDasharray="2 3" strokeOpacity={0.5} />
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
                const map: Record<string, string> = {
                  open: "باز", high: "بالا", low: "پایین", close: "بسته",
                  ma20: "MA20", ma50: "MA50", ema50: "EMA50",
                  bbU: "BB بالا", bbM: "BB میانه", bbL: "BB پایین",
                };
                if (["range", "base", "volume", "rsi", "macd", "macdSignal", "macdHist", "up"].includes(key))
                  return [null as any, null as any];
                return [formatPrice(v), map[key] ?? key];
              }}
            />
            {overlays.bb && (
              <>
                <Area type="monotone" dataKey="bbU" stroke="var(--olive)" strokeOpacity={0.5} fill="color-mix(in oklab, var(--olive) 12%, transparent)" isAnimationActive={false} />
                <Line type="monotone" dataKey="bbL" stroke="var(--olive)" strokeOpacity={0.5} strokeWidth={1} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="bbM" stroke="var(--olive)" strokeOpacity={0.7} strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              </>
            )}
            {style === "candle" || style === "ha" ? (
              <>
                <Bar dataKey="range" stackId="candle" shape={<Candle />} isAnimationActive={false} />
                <Bar dataKey="base" stackId="candle" fill="transparent" isAnimationActive={false} />
              </>
            ) : style === "area" ? (
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--brass)"
                strokeWidth={1.75}
                fill="color-mix(in oklab, var(--brass) 22%, transparent)"
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
            {overlays.ma20 && (
              <Line type="monotone" dataKey="ma20" stroke="var(--olive)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
            )}
            {overlays.ma50 && (
              <Line type="monotone" dataKey="ma50" stroke="var(--cocoa)" strokeWidth={1.2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            )}
            {overlays.ema50 && (
              <Line type="monotone" dataKey="ema50" stroke="var(--brass-dark)" strokeWidth={1.2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume panel */}
      {panels.volume && (
        <div className="h-20 bg-tv-bg border-t border-tv-border">
          <PanelLabel>حجم معاملات</PanelLabel>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 46, left: 4, bottom: 4 }}>
              <XAxis dataKey="label" reversed hide />
              <YAxis orientation="right" width={44} hide />
              <Tooltip
                cursor={{ stroke: "var(--brass)", strokeOpacity: 0.3 }}
                contentStyle={{ background: "var(--tv-bg)", border: "1px solid var(--tv-border)", fontSize: 11, color: "var(--tv-text)" }}
                formatter={(v: any) => [toFaDigits(v), "حجم"]}
                labelFormatter={(l) => `تاریخ: ${l}`}
              />
              <Bar dataKey="volume" isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.up
                      ? "color-mix(in oklab, var(--bull) 55%, transparent)"
                      : "color-mix(in oklab, var(--bear) 55%, transparent)"}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* RSI panel */}
      {panels.rsi && (
        <div className="h-24 bg-tv-bg border-t border-tv-border">
          <PanelLabel>RSI ۱۴</PanelLabel>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 46, left: 4, bottom: 4 }}>
              <XAxis dataKey="label" reversed hide />
              <YAxis orientation="right" domain={[0, 100]} width={44} tick={{ fill: "var(--tv-muted)", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "var(--tv-border)" }} ticks={[30, 50, 70]} />
              <ReferenceLine y={70} stroke="var(--bear)" strokeOpacity={0.4} strokeDasharray="2 3" />
              <ReferenceLine y={30} stroke="var(--bull)" strokeOpacity={0.4} strokeDasharray="2 3" />
              <ReferenceLine y={50} stroke="var(--tv-border)" strokeDasharray="1 3" />
              <Tooltip
                cursor={{ stroke: "var(--brass)", strokeOpacity: 0.3 }}
                contentStyle={{ background: "var(--tv-bg)", border: "1px solid var(--tv-border)", fontSize: 11, color: "var(--tv-text)" }}
                formatter={(v: any) => [typeof v === "number" ? toFaDigits(v.toFixed(1)) : v, "RSI"]}
                labelFormatter={(l) => `تاریخ: ${l}`}
              />
              <Line type="monotone" dataKey="rsi" stroke="var(--brass)" strokeWidth={1.4} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD panel */}
      {panels.macd && (
        <div className="h-24 bg-tv-bg border-t border-tv-border">
          <PanelLabel>MACD ۱۲ ۲۶ ۹</PanelLabel>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 46, left: 4, bottom: 4 }}>
              <XAxis dataKey="label" reversed hide />
              <YAxis orientation="right" width={44} tick={{ fill: "var(--tv-muted)", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "var(--tv-border)" }} />
              <ReferenceLine y={0} stroke="var(--tv-border)" />
              <Tooltip
                cursor={{ stroke: "var(--brass)", strokeOpacity: 0.3 }}
                contentStyle={{ background: "var(--tv-bg)", border: "1px solid var(--tv-border)", fontSize: 11, color: "var(--tv-text)" }}
                labelFormatter={(l) => `تاریخ: ${l}`}
                formatter={(v: any, k: string) => {
                  const map: Record<string, string> = { macd: "MACD", macdSignal: "Signal", macdHist: "Hist" };
                  return [typeof v === "number" ? toFaDigits(v.toFixed(0)) : v, map[k] ?? k];
                }}
              />
              <Bar dataKey="macdHist" isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={(d.macdHist ?? 0) >= 0
                      ? "color-mix(in oklab, var(--bull) 55%, transparent)"
                      : "color-mix(in oklab, var(--bear) 55%, transparent)"}
                  />
                ))}
              </Bar>
              <Line type="monotone" dataKey="macd" stroke="var(--brass)" strokeWidth={1.3} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="macdSignal" stroke="var(--olive)" strokeWidth={1.2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer key stats */}
      <div className="px-3 md:px-4 py-2 border-t border-tv-border bg-tv-headband text-[10px] text-tv-muted grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
        <Kv k="بالاترین" v={formatPrice(stats.hi)} />
        <Kv k="پایین‌ترین" v={formatPrice(stats.lo)} />
        <Kv k="میانگین حجم" v={toFaDigits(Math.round(meta.avgVol))} />
        <Kv k="ATR ۱۴" v={formatPrice(Math.round(meta.atrLast))} />
      </div>
    </div>
  );
}

// ─────────────────────────── Helpers ───────────────────────────
function OHLCStat({ k, v, accent }: { k: string; v: number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-tv-muted">{k}</span>
      <span className={`num-fa ${accent ? "text-brass" : "text-tv-text"}`}>{formatPrice(v)}</span>
    </div>
  );
}
function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="tracking-widest uppercase">{k}</span>
      <span className="num-fa text-tv-text">{v}</span>
    </div>
  );
}
function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute pointer-events-none px-2 pt-1 text-[9px] tracking-widest uppercase text-tv-muted">
      {children}
    </div>
  );
}
function SegGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex rounded-sm border border-tv-border overflow-hidden">{children}</div>;
}
function SegBtn({
  on, onClick, children, title,
}: { on: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-1 transition-colors ${on ? "bg-brass/20 text-brass" : "text-tv-muted hover:text-tv-text"}`}
    >
      {children}
    </button>
  );
}
function ToggleChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] tracking-widest uppercase transition-colors ${
        on
          ? "border-brass/60 bg-brass/15 text-brass"
          : "border-tv-border text-tv-muted hover:text-tv-text"
      }`}
    >
      {children}
    </button>
  );
}
function styleIcon(s: Style) {
  if (s === "candle") return <CandlestickChart className="h-3.5 w-3.5" />;
  if (s === "ha") return <span className="text-[10px] font-bold px-0.5">HA</span>;
  if (s === "line") return <LineIcon className="h-3.5 w-3.5" />;
  return <AreaIcon className="h-3.5 w-3.5" />;
}
function styleLabel(s: Style) {
  return s === "candle" ? "شمعی" : s === "ha" ? "هیکن‌آشی" : s === "line" ? "خطی" : "ناحیه‌ای";
}
