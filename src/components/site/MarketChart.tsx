import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  Cell,
  ComposedChart,
  Customized,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Product, PricePoint } from "@/lib/store";
import { formatPrice, formatJalali, formatJalaliShort, toFaDigits } from "@/lib/format";
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
  { key: "all", label: "کل", days: 99999 },
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

/** Right-side price axis width — shared by every panel so they stay aligned. */
const AXIS_W = 52;
const MARGIN = { top: 8, right: 4, left: 4, bottom: 0 } as const;

function compactPrice(v: number): string {
  const a = Math.abs(v);
  if (a >= 1_000_000_000) return toFaDigits((v / 1_000_000_000).toFixed(1)) + "میلیارد";
  if (a >= 1_000_000) return toFaDigits((v / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)) + "م";
  if (a >= 1_000) return toFaDigits(Math.round(v / 1_000)) + "هـ";
  return toFaDigits(Math.round(v));
}

function compactNum(v: number): string {
  const a = Math.abs(v);
  if (a >= 1_000_000) return toFaDigits((v / 1_000_000).toFixed(1)) + "م";
  if (a >= 1_000) return toFaDigits(Math.round(v / 1_000)) + "هـ";
  return toFaDigits(Math.round(v));
}

// ─────────────────── Candle layer (uses real chart scales) ───────────────────
function CandleLayer(props: any) {
  const { xAxisMap, yAxisMap, data } = props;
  const xAxis: any = xAxisMap && Object.values(xAxisMap)[0];
  const yAxis: any = yAxisMap && Object.values(yAxisMap)[0];
  if (!xAxis?.scale || !yAxis?.scale || !Array.isArray(data) || !data.length) return null;
  const xs = xAxis.scale;
  const ys = yAxis.scale;
  const band = typeof xs.bandwidth === "function" ? xs.bandwidth() : xAxis.width / data.length;
  const slot = Math.max(2, Math.abs(band) || xAxis.width / data.length);
  const bodyW = Math.max(1, Math.min(14, slot * 0.66));
  return (
    <g className="darj-candles">
      {data.map((d: any, i: number) => {
        if (d.open == null || d.close == null) return null;
        const cx = xs(d.date) + (typeof xs.bandwidth === "function" ? band / 2 : 0);
        if (!Number.isFinite(cx)) return null;
        const up = d.close >= d.open;
        const color = up ? "var(--bull)" : "var(--bear)";
        const yHigh = ys(d.high);
        const yLow = ys(d.low);
        const yTop = ys(Math.max(d.open, d.close));
        const yBottom = ys(Math.min(d.open, d.close));
        if (![yHigh, yLow, yTop, yBottom].every(Number.isFinite)) return null;
        const h = Math.max(1, yBottom - yTop);
        return (
          <g key={d.date ?? i}>
            <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
            <rect x={cx - bodyW / 2} y={yTop} width={bodyW} height={h} fill={color} stroke={color} />
          </g>
        );
      })}
    </g>
  );
}

type Row = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20: number | null;
  ma50: number | null;
  ema50: number | null;
  bbU: number | null;
  bbM: number | null;
  bbL: number | null;
  vwap: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  stochK: number | null;
  stochD: number | null;
  up: boolean;
};

// ─────────────────────────── Component ───────────────────────────
export function MarketChart({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [range, setRange] = useState<Range>("3m");
  const [style, setStyle] = useState<Style>("candle");
  const [overlays, setOverlays] = useState<Overlays>({
    ma20: true,
    ma50: false,
    ema50: false,
    bb: false,
    vwap: false,
    fib: false,
  });
  const [panels, setPanels] = useState<Record<SubPanel, boolean>>({
    volume: true,
    rsi: false,
    macd: false,
    stoch: false,
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const { data, stats, meta } = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    // De-duplicate by date and sort chronologically — admin edits can produce
    // out-of-order or repeated dates, which used to break the band scale.
    const byDate = new Map<string, PricePoint>();
    for (const p of product.history ?? []) {
      const d = String(p.date).slice(0, 10);
      if (!d) continue;
      byDate.set(d, { ...p, date: d });
    }
    const sortedAll = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    const raw = sortedAll.slice(-days);

    const asOHLC: OHLC[] = raw.map((p) => {
      const close = Number(p.close ?? p.price) || 0;
      const open = Number(p.open ?? close) || close;
      return {
        date: p.date,
        open,
        high: Math.max(Number(p.high ?? close) || close, open, close),
        low: Math.min(Number(p.low ?? close) || close, open, close),
        close,
        volume: Number(p.volume ?? 0) || 0,
      };
    });
    const rows = style === "ha" ? heikinAshi(asOHLC) : asOHLC;
    const closes = rows.map((r) => r.close);
    const n = rows.length;

    const ma20 = sma(closes, Math.min(20, Math.max(2, Math.floor(n / 4) || 2)));
    const ma50 = sma(closes, Math.min(50, Math.max(3, Math.floor(n / 2) || 3)));
    const em50 = ema(closes, Math.min(50, Math.max(3, Math.floor(n / 2) || 3)));
    const bb = bollinger(closes, Math.min(20, Math.max(3, Math.floor(n / 4) || 3)), 2);
    const r14 = calcRsi(closes, Math.min(14, Math.max(2, n - 1)));
    const m = calcMacd(closes, 12, 26, 9);
    const at = calcAtr(rows, Math.min(14, Math.max(2, n - 1)));
    const stoch = stochastic(rows, Math.min(14, Math.max(2, n - 1)), 3);
    const vw = calcVwap(rows);
    const fib = fibonacciLevels(rows);

    const chartRows: Row[] = rows.map((r, i) => ({
      date: r.date,
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: r.volume ?? 0,
      ma20: ma20[i],
      ma50: ma50[i],
      ema50: em50[i],
      bbU: bb.upper[i],
      bbM: bb.mid[i],
      bbL: bb.lower[i],
      vwap: vw[i],
      rsi: r14[i],
      macd: m.macd[i],
      macdSignal: m.signal[i],
      macdHist: m.hist[i],
      stochK: stoch.k[i],
      stochD: stoch.d[i],
      up: r.close >= r.open,
    }));

    const first = chartRows[0];
    const last = chartRows[chartRows.length - 1];
    const hi = chartRows.length ? Math.max(...chartRows.map((r) => r.high)) : 0;
    const lo = chartRows.length ? Math.min(...chartRows.map((r) => r.low)) : 0;
    const chg = last ? last.close - (first?.close ?? last.close) : 0;
    const chgPct = first?.close ? (chg / first.close) * 100 : 0;
    const avgVol = chartRows.length
      ? chartRows.reduce((s, r) => s + r.volume, 0) / chartRows.length
      : 0;
    const atrLast = at[at.length - 1] ?? 0;

    return {
      data: chartRows,
      stats: { last, first, hi, lo, chg, chgPct },
      meta: { avgVol, atrLast, bars: chartRows.length, fib },
    };
  }, [product.history, range, style]);

  const hasData = data.length > 0;
  const pad = (stats.hi - stats.lo) * 0.12 || stats.hi * 0.03 || 1;
  const domain: [number, number] = [stats.lo - pad, stats.hi + pad];
  const current = (hoverDate ? data.find((d) => d.date === hoverDate) : null) ?? stats.last;

  const priceHeight = compact ? "h-64" : "h-72 md:h-96";
  const openPanels = (["volume", "rsi", "macd", "stoch"] as SubPanel[]).filter((p) => panels[p]);
  const lastPanel = openPanels[openPanels.length - 1] ?? null;

  const dateTick = {
    dataKey: "date" as const,
    tickFormatter: (d: string) => formatJalaliShort(d),
    tick: { fill: "var(--tv-muted)", fontSize: 9 },
    tickLine: false,
    axisLine: { stroke: "var(--tv-border)" },
    interval: "preserveStartEnd" as const,
    minTickGap: 44,
    height: 22,
  };

  const hiddenAxis = { dataKey: "date" as const, hide: true };
  const mutedYAxis = {
    orientation: "right" as const,
    width: AXIS_W,
    tick: { fill: "var(--tv-muted)", fontSize: 9 },
    tickLine: false,
    axisLine: { stroke: "var(--tv-border)" },
  };

  const track = (e: any) => {
    const label = e?.activeLabel;
    if (typeof label === "string") setHoverDate(label);
  };

  return (
    <div className="tv-panel rounded-sm overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 md:px-4 py-3 border-b border-tv-border bg-tv-headband">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass">DARJ · MARKET</div>
          <div className="font-display text-tv-text text-base md:text-lg mt-0.5 truncate">
            {product.name}
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-1.5 overflow-x-auto no-scrollbar">
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
          {current ? (
            <>
              <div className="text-tv-muted num-fa w-full sm:w-auto sm:hidden">
                {formatJalali(current.date)}
              </div>
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
              <div className="text-tv-muted ms-auto hidden sm:block num-fa">
                {formatJalali(current.date)} · {product.unit}
              </div>
            </>
          ) : (
            <div className="text-tv-muted">داده‌ای برای این بازه ثبت نشده است</div>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5">
          <ToggleChip
            on={overlays.ma20}
            onClick={() => setOverlays({ ...overlays, ma20: !overlays.ma20 })}
          >
            MA20
          </ToggleChip>
          <ToggleChip
            on={overlays.ma50}
            onClick={() => setOverlays({ ...overlays, ma50: !overlays.ma50 })}
          >
            MA50
          </ToggleChip>
          <ToggleChip
            on={overlays.ema50}
            onClick={() => setOverlays({ ...overlays, ema50: !overlays.ema50 })}
          >
            EMA50
          </ToggleChip>
          <ToggleChip on={overlays.bb} onClick={() => setOverlays({ ...overlays, bb: !overlays.bb })}>
            <Waves className="h-3 w-3" /> BB
          </ToggleChip>
          <ToggleChip
            on={overlays.vwap}
            onClick={() => setOverlays({ ...overlays, vwap: !overlays.vwap })}
          >
            <Zap className="h-3 w-3" /> VWAP
          </ToggleChip>
          <ToggleChip
            on={overlays.fib}
            onClick={() => setOverlays({ ...overlays, fib: !overlays.fib })}
          >
            <GitBranch className="h-3 w-3" /> Fib
          </ToggleChip>
          <span className="mx-2 h-4 w-px bg-tv-border shrink-0" />
          <ToggleChip
            on={panels.volume}
            onClick={() => setPanels({ ...panels, volume: !panels.volume })}
          >
            <BarChart3 className="h-3 w-3" /> Vol
          </ToggleChip>
          <ToggleChip on={panels.rsi} onClick={() => setPanels({ ...panels, rsi: !panels.rsi })}>
            <Activity className="h-3 w-3" /> RSI
          </ToggleChip>
          <ToggleChip on={panels.macd} onClick={() => setPanels({ ...panels, macd: !panels.macd })}>
            <Layers className="h-3 w-3" /> MACD
          </ToggleChip>
          <ToggleChip on={panels.stoch} onClick={() => setPanels({ ...panels, stoch: !panels.stoch })}>
            <Activity className="h-3 w-3" /> Stoch
          </ToggleChip>
        </div>
      </div>

      {!hasData ? (
        <div className={`${priceHeight} bg-tv-bg flex items-center justify-center px-6 text-center`}>
          <p className="text-xs text-tv-muted leading-relaxed">
            برای این محصول در بازه انتخابی داده‌ای ثبت نشده است.
            <br />
            بازه بلندتری انتخاب کنید یا قیمت را از پنل مدیریت ثبت کنید.
          </p>
        </div>
      ) : (
        <>
          {/* Price panel */}
          <div className={`${priceHeight} bg-tv-bg`} dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={MARGIN}
                onMouseMove={track}
                onTouchMove={track}
                onMouseLeave={() => setHoverDate(null)}
              >
                <XAxis {...(openPanels.length ? hiddenAxis : dateTick)} />
                <YAxis
                  {...mutedYAxis}
                  domain={domain}
                  tickFormatter={(v: number) => compactPrice(v)}
                />
                {stats.last && (
                  <ReferenceLine
                    y={stats.last.close}
                    stroke="var(--brass)"
                    strokeDasharray="2 3"
                    strokeOpacity={0.6}
                  />
                )}
                <Tooltip
                  cursor={{ stroke: "var(--brass)", strokeOpacity: 0.45, strokeDasharray: "2 3" }}
                  content={<PriceTooltip unit={product.unit} />}
                />
                {overlays.bb && (
                  <Area
                    type="monotone"
                    dataKey="bbU"
                    stroke="var(--olive)"
                    strokeOpacity={0.5}
                    fill="color-mix(in oklab, var(--olive) 12%, transparent)"
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
                {overlays.bb && (
                  <Line
                    type="monotone"
                    dataKey="bbL"
                    stroke="var(--olive)"
                    strokeOpacity={0.5}
                    strokeWidth={1}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
                {overlays.bb && (
                  <Line
                    type="monotone"
                    dataKey="bbM"
                    stroke="var(--olive)"
                    strokeOpacity={0.7}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
                {(style === "candle" || style === "ha") && (
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="transparent"
                    strokeWidth={0}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                )}
                {(style === "candle" || style === "ha") && <Customized component={CandleLayer} />}
                {style === "area" && (
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="var(--brass)"
                    strokeWidth={1.75}
                    fill="color-mix(in oklab, var(--brass) 22%, transparent)"
                    isAnimationActive={false}
                  />
                )}
                {style === "line" && (
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
                  <Line
                    type="monotone"
                    dataKey="ma20"
                    stroke="var(--olive)"
                    strokeWidth={1.2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
                {overlays.ma50 && (
                  <Line
                    type="monotone"
                    dataKey="ma50"
                    stroke="var(--cocoa)"
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
                {overlays.ema50 && (
                  <Line
                    type="monotone"
                    dataKey="ema50"
                    stroke="var(--brass-dark)"
                    strokeWidth={1.2}
                    strokeDasharray="6 3"
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
                {overlays.vwap && (
                  <Line
                    type="monotone"
                    dataKey="vwap"
                    stroke="#c9a84c"
                    strokeWidth={1.4}
                    strokeDasharray="1 3"
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
                {overlays.fib &&
                  meta.fib &&
                  meta.fib.levels.map((lv) => (
                    <ReferenceLine
                      key={lv.ratio}
                      y={lv.value}
                      stroke={fibColor(lv.ratio)}
                      strokeOpacity={0.7}
                      strokeDasharray="4 3"
                      label={{
                        value: `${(lv.ratio * 100).toFixed(1)}%`,
                        position: "insideLeft",
                        fill: fibColor(lv.ratio),
                        fontSize: 9,
                      }}
                    />
                  ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Volume panel */}
          {panels.volume && (
            <SubPanelBox label="حجم معاملات">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={MARGIN} onMouseMove={track} onTouchMove={track}>
                  <XAxis {...(lastPanel === "volume" ? dateTick : hiddenAxis)} />
                  <YAxis {...mutedYAxis} tickFormatter={(v: number) => compactNum(v)} />
                  <Tooltip
                    cursor={{ stroke: "var(--brass)", strokeOpacity: 0.3 }}
                    content={<SimpleTooltip labels={{ volume: "حجم" }} digits={0} />}
                  />
                  {hoverDate && <ReferenceLine x={hoverDate} stroke="var(--brass)" strokeOpacity={0.35} />}
                  <Bar dataKey="volume" isAnimationActive={false}>
                    {data.map((d, i) => (
                      <Cell
                        key={i}
                        fill={
                          d.up
                            ? "color-mix(in oklab, var(--bull) 55%, transparent)"
                            : "color-mix(in oklab, var(--bear) 55%, transparent)"
                        }
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </SubPanelBox>
          )}

          {/* RSI panel */}
          {panels.rsi && (
            <SubPanelBox label="RSI ۱۴">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={MARGIN} onMouseMove={track} onTouchMove={track}>
                  <XAxis {...(lastPanel === "rsi" ? dateTick : hiddenAxis)} />
                  <YAxis {...mutedYAxis} domain={[0, 100]} ticks={[30, 50, 70]} tickFormatter={(v: number) => toFaDigits(v)} />
                  <ReferenceLine y={70} stroke="var(--bear)" strokeOpacity={0.4} strokeDasharray="2 3" />
                  <ReferenceLine y={30} stroke="var(--bull)" strokeOpacity={0.4} strokeDasharray="2 3" />
                  <ReferenceLine y={50} stroke="var(--tv-border)" strokeDasharray="1 3" />
                  <Tooltip
                    cursor={{ stroke: "var(--brass)", strokeOpacity: 0.3 }}
                    content={<SimpleTooltip labels={{ rsi: "RSI" }} digits={1} raw />}
                  />
                  {hoverDate && <ReferenceLine x={hoverDate} stroke="var(--brass)" strokeOpacity={0.35} />}
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="var(--brass)"
                    strokeWidth={1.4}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </SubPanelBox>
          )}

          {/* MACD panel */}
          {panels.macd && (
            <SubPanelBox label="MACD ۱۲ ۲۶ ۹">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={MARGIN} onMouseMove={track} onTouchMove={track}>
                  <XAxis {...(lastPanel === "macd" ? dateTick : hiddenAxis)} />
                  <YAxis {...mutedYAxis} tickFormatter={(v: number) => compactNum(v)} />
                  <ReferenceLine y={0} stroke="var(--tv-border)" />
                  <Tooltip
                    cursor={{ stroke: "var(--brass)", strokeOpacity: 0.3 }}
                    content={
                      <SimpleTooltip
                        labels={{ macd: "MACD", macdSignal: "سیگنال", macdHist: "هیستوگرام" }}
                        digits={0}
                      />
                    }
                  />
                  {hoverDate && <ReferenceLine x={hoverDate} stroke="var(--brass)" strokeOpacity={0.35} />}
                  <Bar dataKey="macdHist" isAnimationActive={false}>
                    {data.map((d, i) => (
                      <Cell
                        key={i}
                        fill={
                          (d.macdHist ?? 0) >= 0
                            ? "color-mix(in oklab, var(--bull) 55%, transparent)"
                            : "color-mix(in oklab, var(--bear) 55%, transparent)"
                        }
                      />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="var(--brass)"
                    strokeWidth={1.3}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="macdSignal"
                    stroke="var(--olive)"
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </SubPanelBox>
          )}

          {/* Stochastic panel */}
          {panels.stoch && (
            <SubPanelBox label="Stochastic %K %D">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={MARGIN} onMouseMove={track} onTouchMove={track}>
                  <XAxis {...(lastPanel === "stoch" ? dateTick : hiddenAxis)} />
                  <YAxis {...mutedYAxis} domain={[0, 100]} ticks={[20, 50, 80]} tickFormatter={(v: number) => toFaDigits(v)} />
                  <ReferenceLine y={80} stroke="var(--bear)" strokeOpacity={0.4} strokeDasharray="2 3" />
                  <ReferenceLine y={20} stroke="var(--bull)" strokeOpacity={0.4} strokeDasharray="2 3" />
                  <Tooltip
                    cursor={{ stroke: "var(--brass)", strokeOpacity: 0.3 }}
                    content={<SimpleTooltip labels={{ stochK: "%K", stochD: "%D" }} digits={1} raw />}
                  />
                  {hoverDate && <ReferenceLine x={hoverDate} stroke="var(--brass)" strokeOpacity={0.35} />}
                  <Line
                    type="monotone"
                    dataKey="stochK"
                    stroke="var(--brass)"
                    strokeWidth={1.3}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="stochD"
                    stroke="var(--olive)"
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </SubPanelBox>
          )}
        </>
      )}

      {/* Footer key stats */}
      <div className="px-3 md:px-4 py-2 border-t border-tv-border bg-tv-headband text-[10px] text-tv-muted grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
        <Kv k="بالاترین" v={hasData ? formatPrice(stats.hi) : "—"} />
        <Kv k="پایین‌ترین" v={hasData ? formatPrice(stats.lo) : "—"} />
        <Kv k="میانگین حجم" v={hasData ? toFaDigits(Math.round(meta.avgVol)) : "—"} />
        <Kv k="ATR ۱۴" v={hasData ? formatPrice(Math.round(meta.atrLast)) : "—"} />
      </div>
    </div>
  );
}

// ─────────────────────────── Tooltips ───────────────────────────
function TooltipShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      dir="rtl"
      className="rounded-sm border border-tv-border bg-tv-bg/95 px-2.5 py-2 text-[11px] text-tv-text shadow-lg backdrop-blur-sm"
    >
      {children}
    </div>
  );
}

function PriceTooltip({ active, payload, unit }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as Row | undefined;
  if (!d) return null;
  const up = d.close >= d.open;
  return (
    <TooltipShell>
      <div className="num-fa text-tv-muted mb-1">{formatJalali(d.date)}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <TRow k="باز" v={formatPrice(d.open)} />
        <TRow k="بالا" v={formatPrice(d.high)} />
        <TRow k="پایین" v={formatPrice(d.low)} />
        <TRow k="بسته" v={formatPrice(d.close)} accent={up ? "bull" : "bear"} />
      </div>
      {d.volume ? <TRow k="حجم" v={toFaDigits(d.volume)} /> : null}
      {d.ma20 != null ? <TRow k="MA20" v={formatPrice(d.ma20)} /> : null}
      <div className="mt-1 text-[9px] text-tv-muted">{unit}</div>
    </TooltipShell>
  );
}

function SimpleTooltip({ active, payload, labels, digits = 0, raw = false }: any) {
  if (!active || !payload?.length) return null;
  const date = payload[0]?.payload?.date as string | undefined;
  return (
    <TooltipShell>
      {date && <div className="num-fa text-tv-muted mb-1">{formatJalali(date)}</div>}
      {payload
        .filter((p: any) => typeof p.value === "number" && labels[p.dataKey])
        .map((p: any) => (
          <TRow
            key={p.dataKey}
            k={labels[p.dataKey]}
            v={raw ? toFaDigits(p.value.toFixed(digits)) : formatPrice(p.value)}
          />
        ))}
    </TooltipShell>
  );
}

function TRow({ k, v, accent }: { k: string; v: string; accent?: "bull" | "bear" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-tv-muted">{k}</span>
      <span
        className={`num-fa ${accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-tv-text"}`}
      >
        {v}
      </span>
    </div>
  );
}

// ─────────────────────────── Helpers ───────────────────────────
function SubPanelBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative h-28 bg-tv-bg border-t border-tv-border" dir="ltr">
      <div className="absolute right-2 top-1 z-10 pointer-events-none text-[9px] tracking-widest uppercase text-tv-muted">
        {label}
      </div>
      {children}
    </div>
  );
}
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
function SegGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex rounded-sm border border-tv-border overflow-hidden shrink-0">{children}</div>
  );
}
function SegBtn({
  on,
  onClick,
  children,
  title,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={on}
      className={`px-2 py-1 transition-colors ${on ? "bg-brass/20 text-brass" : "text-tv-muted hover:text-tv-text"}`}
    >
      {children}
    </button>
  );
}
function ToggleChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] tracking-widest uppercase transition-colors ${
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
function fibColor(r: number): string {
  if (r === 0 || r === 1) return "#c9a84c";
  if (r === 0.5) return "#e8b84a";
  if (r === 0.618) return "#e85d3a";
  return "#8b7355";
}
