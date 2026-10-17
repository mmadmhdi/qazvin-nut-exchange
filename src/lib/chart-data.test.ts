import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildMarketData, normalizeHistory } from "./chart-data";
import { rsi, macd, stochastic } from "./indicators";
import { parseDateInput, parseAmount } from "./format";

const history = Array.from({ length: 70 }, (_, i) => ({ date: new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0, 10), price: (i + 1) * 100, volume: 10 }));

describe("Real price history and filters", () => {
  it("keeps only the selected seven calendar days", () => {
    const result = buildMarketData(history, 7);
    assert.equal(result.data.length, 7);
    assert.equal(result.stats.last?.close, 7000);
    assert.equal(result.stats.first?.close, 6400);
  });
  it("never substitutes older records when one day is in range", () => {
    const sparse = [history[0], history[69]];
    assert.equal(buildMarketData(sparse, 7).data.length, 1);
  });
  it("uses the same fixed MA20 after changing the visible range", () => {
    assert.equal(buildMarketData(history, 7).data.at(-1)?.ma20, 6050);
    assert.equal(buildMarketData(history, Infinity).data.at(-1)?.ma20, 6050);
  });
  it("matches the user's selected Jalali year, month and day", () => {
    const date = parseDateInput("۱۴۰۵/۰۷/۰۳");
    assert.equal(date, "2026-09-25");
    const result = buildMarketData([{ date: String(date), price: 4000000 }, { date: "2026-09-26", price: 5000000 }], Infinity, { jy: 1405, jm: 7, jd: 3 });
    assert.equal(result.data.length, 1);
    assert.equal(result.stats.last?.close, 4000000);
  });
  it("preserves the actual close when using Heikin-Ashi", () => {
    const result = buildMarketData([{ date: "2026-09-25", price: 200, open: 100, high: 300, low: 90 }], Infinity, undefined, true);
    assert.equal(result.stats.last?.close, 200);
    assert.equal(result.data[0].close, 172.5);
  });
  it("normalizes missing OHLC and deduplicates dates without fake volume", () => {
    const rows = normalizeHistory([{ date: "2026-09-25", price: 100, low: 0 }, { date: "2026-09-25", price: 200 }]);
    assert.equal(rows.length, 1);
    assert.deepEqual(rows[0], { date: "2026-09-25", open: 200, high: 200, low: 200, close: 200, volume: 0 });
  });
});

describe("Indicator warmup and admin input", () => {
  it("RSI gives 100 on pure gains and 50 on flat prices", () => {
    assert.equal(rsi(history.map((p) => p.price)).at(-1), 100);
    assert.equal(rsi(Array(20).fill(100)).at(-1), 50);
    assert.deepEqual(rsi([]), []);
  });
  it("MACD signal waits for nine valid MACD values", () => {
    const result = macd(history.map((p) => p.price));
    assert.equal(result.signal[32], null);
    assert.equal(result.signal[33], 700);
  });
  it("stochastic D waits for three valid K values", () => {
    const rows = normalizeHistory(history);
    const result = stochastic(rows);
    assert.equal(result.d[14], null);
    assert.equal(result.d[15], 100);
  });
  it("accepts Persian price digits and rejects impossible dates", () => {
    assert.equal(parseAmount("۴۰٬۰۰۰٬۰۰۰"), 40000000);
    assert.equal(parseDateInput("2026-02-31"), null);
    assert.equal(parseDateInput("۱۴۰۵/۰۷/۳۱"), null);
  });
});