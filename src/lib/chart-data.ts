import type { PricePoint } from "./site-types";
import { jalaliParts, parseDateInput } from "./format";
import { sma, ema, bollinger, rsi, macd, atr, stochastic, vwap, fibonacciLevels, heikinAshi, type OHLC } from "./indicators";

export type ChartPeriod = { jy: number | null; jm: number | null; jd?: number | null };
export const RANGE_DAYS = { "1w": 7, "1m": 30, "3m": 90, "6m": 180, "1y": 365, all: Infinity };

/** Normalize real records without inventing missing prices or volumes. */
export function normalizeHistory(history: PricePoint[]): OHLC[] {
  const byDate = new Map<string, OHLC>();
  for (const point of history) {
    const date = parseDateInput(String(point.date).slice(0, 10));
    const close = Number(point.close ?? point.price);
    if (!date || !Number.isFinite(close) || close <= 0) continue;
    const positive = (value: unknown) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : close;
    const open = positive(point.open);
    byDate.set(date, {
      date, open, close,
      high: Math.max(positive(point.high), open, close),
      low: Math.min(positive(point.low), open, close),
      volume: Number.isFinite(Number(point.volume)) ? Math.max(0, Number(point.volume ?? 0)) : 0,
    });
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function buildMarketData(history: PricePoint[], days: number, period?: ChartPeriod, ha = false) {
  const source = normalizeHistory(history);
  const periodOn = !!period && (period.jy !== null || period.jm !== null || period.jd != null);
  const newest = source.at(-1)?.date;
  const cutoff = newest && Number.isFinite(days)
    ? new Date(new Date(newest).getTime() - (days - 1) * 86_400_000).toISOString().slice(0, 10) : "";
  const rows = ha ? heikinAshi(source) : source;
  // Warm up indicators on the full history, with the advertised fixed periods.
  const closes = source.map((row) => row.close);
  const ma20 = sma(closes, 20), ma50 = sma(closes, 50), em50 = ema(closes, 50);
  const bb = bollinger(closes, 20), r14 = rsi(closes, 14), m = macd(closes);
  const at = atr(source, 14), stoch = stochastic(source, 14, 3), vw = vwap(source);
  const indices = source.flatMap((row, i) => {
    if (periodOn && period) {
      const j = jalaliParts(row.date);
      if (!j || (period.jy !== null && j.jy !== period.jy) || (period.jm !== null && j.jm !== period.jm) || (period.jd != null && j.jd !== period.jd)) return [];
    } else if (cutoff && row.date < cutoff) return [];
    return [i];
  });
  const data = indices.map((i) => ({ ...rows[i], volume: source[i].volume ?? 0,
    ma20: ma20[i], ma50: ma50[i], ema50: em50[i], bbU: bb.upper[i], bbM: bb.mid[i], bbL: bb.lower[i],
    vwap: vw[i], rsi: r14[i], macd: m.macd[i], macdSignal: m.signal[i], macdHist: m.hist[i],
    stochK: stoch.k[i], stochD: stoch.d[i], up: source[i].close >= source[i].open,
  }));
  const actual = indices.map((i) => source[i]);
  const first = actual[0], last = actual.at(-1);
  const hi = actual.length ? Math.max(...actual.map((r) => r.high)) : 0;
  const lo = actual.length ? Math.min(...actual.map((r) => r.low)) : 0;
  const chg = last ? last.close - (first?.close ?? last.close) : 0;
  return {
    data, actual,
    stats: { first, last, hi, lo, chg, chgPct: first?.close ? chg / first.close * 100 : 0 },
    meta: { bars: data.length, avgVol: actual.length ? actual.reduce((s, r) => s + (r.volume ?? 0), 0) / actual.length : 0,
      atrLast: indices.length ? at[indices[indices.length - 1]] : null, fib: fibonacciLevels(actual) },
  };
}