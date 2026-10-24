// Lightweight technical indicators. All inputs are OHLC-ish arrays;
// outputs are aligned to the input length (nulls where undefined).

export type OHLC = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export function sma(values: number[], win: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= win) sum -= values[i - win];
    out.push(i >= win - 1 ? sum / win : null);
  }
  return out;
}

export function ema(values: number[], win: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (win + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (i < win - 1) { out.push(null); continue; }
    if (prev == null) {
      let s = 0;
      for (let j = i - win + 1; j <= i; j++) s += values[j];
      prev = s / win;
    } else {
      prev = values[i] * k + prev * (1 - k);
    }
    out.push(prev);
  }
  return out;
}

export function rsi(values: number[], win = 14): (number | null)[] {
  const out: (number | null)[] = [null];
  let gain = 0, loss = 0;
  for (let i = 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    const g = Math.max(0, d), l = Math.max(0, -d);
    if (i <= win) {
      gain += g; loss += l;
      if (i === win) {
        gain /= win; loss /= win;
        const rs = loss === 0 ? 100 : gain / loss;
        out.push(100 - 100 / (1 + rs));
      } else {
        out.push(null);
      }
    } else {
      gain = (gain * (win - 1) + g) / win;
      loss = (loss * (win - 1) + l) / win;
      const rs = loss === 0 ? 100 : gain / loss;
      out.push(100 - 100 / (1 + rs));
    }
  }
  return out;
}

export function macd(values: number[], fast = 12, slow = 26, sig = 9) {
  const ef = ema(values, fast);
  const es = ema(values, slow);
  const macdLine = values.map((_, i) =>
    ef[i] != null && es[i] != null ? (ef[i] as number) - (es[i] as number) : null,
  );
  const filled = macdLine.map((v) => v ?? 0);
  const signal = ema(filled, sig).map((v, i) => (macdLine[i] == null ? null : v));
  const hist = macdLine.map((v, i) =>
    v != null && signal[i] != null ? v - (signal[i] as number) : null,
  );
  return { macd: macdLine, signal, hist };
}

export function bollinger(values: number[], win = 20, mult = 2) {
  const mid = sma(values, win);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < win - 1) { upper.push(null); lower.push(null); continue; }
    let s = 0;
    for (let j = i - win + 1; j <= i; j++) s += (values[j] - (mid[i] as number)) ** 2;
    const sd = Math.sqrt(s / win);
    upper.push((mid[i] as number) + mult * sd);
    lower.push((mid[i] as number) - mult * sd);
  }
  return { upper, mid, lower };
}

export function atr(rows: OHLC[], win = 14): (number | null)[] {
  const trs: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (i === 0) { trs.push(r.high - r.low); continue; }
    const prev = rows[i - 1].close;
    trs.push(Math.max(r.high - r.low, Math.abs(r.high - prev), Math.abs(r.low - prev)));
  }
  return sma(trs, win);
}

// Heikin-Ashi transform
export function heikinAshi(rows: OHLC[]): OHLC[] {
  const out: OHLC[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const prev = out[i - 1];
    const close = (r.open + r.high + r.low + r.close) / 4;
    const open = prev ? (prev.open + prev.close) / 2 : (r.open + r.close) / 2;
    const high = Math.max(r.high, open, close);
    const low = Math.min(r.low, open, close);
    out.push({ ...r, open, high, low, close });
  }
  return out;
}

// Score 0..100 helpers for "snowflake"-style radar cards
export function trendScore(rows: OHLC[]): number {
  if (rows.length < 20) return 50;
  const closes = rows.map((r) => r.close);
  const ma = sma(closes, 20);
  const last = closes[closes.length - 1];
  const m = ma[ma.length - 1] as number;
  const diff = ((last - m) / m) * 100;
  return clamp(50 + diff * 4);
}
export function momentumScore(rows: OHLC[]): number {
  const closes = rows.map((r) => r.close);
  const r = rsi(closes, 14);
  const v = r[r.length - 1];
  return v == null ? 50 : clamp(v);
}
export function volatilityScore(rows: OHLC[]): number {
  const closes = rows.map((r) => r.close);
  if (closes.length < 20) return 50;
  const rets: number[] = [];
  for (let i = 1; i < closes.length; i++) rets.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length);
  // Lower vol = higher score (calmer market)
  return clamp(100 - sd * 1500);
}
export function liquidityScore(rows: OHLC[]): number {
  const vols = rows.map((r) => r.volume ?? 0);
  if (!vols.length) return 50;
  const avg = vols.reduce((a, b) => a + b, 0) / vols.length;
  return clamp(Math.log10(1 + avg) * 22);
}
export function qualityScore(basePrice: number): number {
  // Purely nominal — higher tier products deserve higher badge
  return clamp(40 + Math.log10(1 + basePrice / 1_000_000) * 22);
}
export function valueScore(rows: OHLC[]): number {
  if (rows.length < 30) return 50;
  const closes = rows.map((r) => r.close);
  const last = closes[closes.length - 1];
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const pos = (last - min) / (max - min || 1); // 0 = deep discount, 1 = local top
  return clamp(100 - pos * 90);
}

// Stochastic Oscillator (%K, %D)
export function stochastic(rows: OHLC[], kWin = 14, dWin = 3) {
  const k: (number | null)[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (i < kWin - 1) { k.push(null); continue; }
    let hh = -Infinity, ll = Infinity;
    for (let j = i - kWin + 1; j <= i; j++) {
      if (rows[j].high > hh) hh = rows[j].high;
      if (rows[j].low < ll) ll = rows[j].low;
    }
    const c = rows[i].close;
    k.push(hh === ll ? 50 : ((c - ll) / (hh - ll)) * 100);
  }
  const filled = k.map((v) => v ?? 0);
  const d = sma(filled, dWin).map((v, i) => (k[i] == null ? null : v));
  return { k, d };
}

// VWAP over the window
export function vwap(rows: OHLC[]): (number | null)[] {
  const out: (number | null)[] = [];
  let pv = 0, vv = 0;
  for (let i = 0; i < rows.length; i++) {
    const tp = (rows[i].high + rows[i].low + rows[i].close) / 3;
    const v = rows[i].volume ?? 0;
    pv += tp * v; vv += v;
    out.push(vv > 0 ? pv / vv : null);
  }
  return out;
}

// Fibonacci retracement levels between period high and low
export function fibonacciLevels(rows: OHLC[]) {
  if (!rows.length) return null;
  let hi = -Infinity, lo = Infinity, hiIdx = 0, loIdx = 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].high > hi) { hi = rows[i].high; hiIdx = i; }
    if (rows[i].low < lo) { lo = rows[i].low; loIdx = i; }
  }
  const up = loIdx < hiIdx;
  const ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  const range = hi - lo;
  return {
    hi, lo, up,
    levels: ratios.map((r) => ({
      ratio: r,
      value: up ? hi - range * r : lo + range * r,
    })),
  };
}

function clamp(v: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}
