import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Legend,
} from "recharts";
import { useStore, computeChange, type Product } from "@/lib/store";
import { formatJalaliShort, formatPercent, formatPrice, toFaDigits } from "@/lib/format";
import { X, Plus } from "lucide-react";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "مقایسه محصولات — درج سبز قزوین" },
      { name: "description", content: "مقایسه چند محصول خشکبار به صورت نرمال‌شده روی یک نمودار؛ تحلیل بازدهی، همبستگی و شکاف قیمتی." },
      { property: "og:title", content: "مقایسه بازار خشکبار" },
      { property: "og:description", content: "بازدهی نرمال‌شده و شکاف قیمتی محصولات پسته و بادام." },
    ],
  }),
  component: Compare,
});

const COLORS = ["#c9a84c", "#4a6741", "#8b6f5e", "#e85d3a", "#2d8a9e"];

function Compare() {
  const { products } = useStore();
  const active = products.filter((p) => p.active);
  const [selected, setSelected] = useState<string[]>(
    active.slice(0, Math.min(3, active.length)).map((p) => p.id)
  );
  const [range, setRange] = useState<7 | 30 | 90 | 180 | 365>(90);

  const pick = (id: string) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < 5 ? [...s, id] : s
    );
  };

  const picked = selected
    .map((id) => active.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const data = useMemo(() => {
    if (!picked.length) return [];
    const series = picked.map((p) => {
      const hist = p.history.slice(-range);
      const base = hist[0]?.price ?? p.price;
      return { p, hist, base };
    });
    const len = Math.min(...series.map((s) => s.hist.length));
    const rows: any[] = [];
    for (let i = 0; i < len; i++) {
      const row: any = { label: formatJalaliShort(new Date(series[0].hist[i].date)) };
      series.forEach((s) => {
        const pct = ((s.hist[i].price - s.base) / s.base) * 100;
        row[s.p.id] = Number(pct.toFixed(2));
      });
      rows.push(row);
    }
    return rows;
  }, [picked, range]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">مقایسه</div>
      <h1 className="font-display text-3xl sm:text-5xl text-olive-deep mt-2">مقایسه‌ی بازدهی محصولات</h1>
      <p className="text-cocoa max-w-2xl mt-3 leading-8 text-sm">
        تا ۵ محصول را انتخاب کنید تا بازدهی نرمال‌شده (٪ تغییر از ابتدای بازه) روی یک نمودار مقایسه شود.
      </p>
      <div className="gold-rule my-6" />

      {/* Selector chips */}
      <div className="card-paper rounded-sm p-4 mb-6">
        <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark mb-3">انتخاب محصولات</div>
        <div className="flex flex-wrap gap-2">
          {active.map((p, i) => {
            const on = selected.includes(p.id);
            const colorIdx = selected.indexOf(p.id);
            return (
              <button
                key={p.id}
                onClick={() => pick(p.id)}
                className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs transition-colors ${
                  on
                    ? "border-olive-deep bg-olive-deep text-paper"
                    : "border-border text-cocoa hover:bg-cream"
                }`}
              >
                {on && (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: COLORS[colorIdx] }}
                  />
                )}
                {on ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">بازه</span>
        {[
          { d: 7, l: "۱ هفته" },
          { d: 30, l: "۱ ماه" },
          { d: 90, l: "۳ ماه" },
          { d: 180, l: "۶ ماه" },
          { d: 365, l: "۱ سال" },
        ].map((r) => (
          <button
            key={r.d}
            onClick={() => setRange(r.d as any)}
            className={`text-xs px-3 py-1 rounded-sm border transition-colors ${
              range === r.d
                ? "border-olive-deep bg-olive-deep text-paper"
                : "border-border text-cocoa hover:bg-cream"
            }`}
          >
            {r.l}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="tv-panel rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-tv-border bg-tv-headband">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass">Normalized Return %</div>
          <div className="font-display text-tv-text mt-1">بازدهی نرمال‌شده از ابتدای بازه</div>
        </div>
        <div className="h-96 bg-tv-bg px-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 46, left: 4, bottom: 8 }}>
              <XAxis
                dataKey="label"
                reversed
                tick={{ fill: "var(--tv-muted)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "var(--tv-border)" }}
                minTickGap={30}
              />
              <YAxis
                orientation="right"
                tick={{ fill: "var(--tv-muted)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "var(--tv-border)" }}
                tickFormatter={(v) => toFaDigits(v) + "٪"}
                width={44}
              />
              <ReferenceLine y={0} stroke="var(--brass)" strokeOpacity={0.5} strokeDasharray="2 3" />
              <Tooltip
                cursor={{ stroke: "var(--brass)", strokeOpacity: 0.4 }}
                contentStyle={{
                  background: "var(--tv-bg)",
                  border: "1px solid var(--tv-border)",
                  fontSize: 11,
                  color: "var(--tv-text)",
                }}
                labelFormatter={(l) => `تاریخ: ${l}`}
                formatter={(v: any, k: string) => {
                  const p = picked.find((x) => x.id === k);
                  return [typeof v === "number" ? toFaDigits(v.toFixed(2)) + "٪" : v, p?.name ?? k];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--tv-text)" }}
                formatter={(v) => picked.find((p) => p.id === v)?.name ?? v}
              />
              {picked.map((p, i) => (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={p.id}
                  stroke={COLORS[i]}
                  strokeWidth={1.6}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stat matrix */}
      {picked.length > 0 && (
        <div className="mt-8 card-paper rounded-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-border">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">جدول مقایسه</div>
            <div className="font-display text-xl text-olive-deep mt-1">شاخص‌های کلیدی</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-cream/50 text-[10px] tracking-widest uppercase text-brass-dark">
                <tr>
                  <th className="text-right px-4 py-2">محصول</th>
                  <th className="text-right px-3 py-2">قیمت روز</th>
                  <th className="text-right px-3 py-2">تغییر ۲۴ س</th>
                  <th className="text-right px-3 py-2">بازدهی بازه</th>
                  <th className="text-right px-3 py-2">سقف بازه</th>
                  <th className="text-right px-3 py-2">کف بازه</th>
                </tr>
              </thead>
              <tbody>
                {picked.map((p, i) => {
                  const hist = p.history.slice(-range);
                  const base = hist[0]?.price ?? p.price;
                  const last = hist[hist.length - 1]?.price ?? p.price;
                  const periodPct = ((last - base) / base) * 100;
                  const hi = Math.max(...hist.map((h) => h.high ?? h.price));
                  const lo = Math.min(...hist.map((h) => h.low ?? h.price));
                  const ch24 = computeChange(hist).pct;
                  return (
                    <tr key={p.id} className="border-t border-border/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ background: COLORS[i] }}
                          />
                          <span className="text-olive-deep">{p.name}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 tracking-widest uppercase">
                          {p.origin} · {p.grade}
                        </div>
                      </td>
                      <td className="px-3 py-3 num-fa text-cocoa">{formatPrice(p.price)}</td>
                      <td className={`px-3 py-3 num-fa ${ch24 >= 0 ? "text-bull" : "text-bear"}`}>
                        {formatPercent(ch24)}
                      </td>
                      <td className={`px-3 py-3 num-fa ${periodPct >= 0 ? "text-bull" : "text-bear"}`}>
                        {formatPercent(periodPct)}
                      </td>
                      <td className="px-3 py-3 num-fa text-cocoa">{formatPrice(hi)}</td>
                      <td className="px-3 py-3 num-fa text-cocoa">{formatPrice(lo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
