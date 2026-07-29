import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, computeChange } from "@/lib/store";
import { MarketChart } from "@/components/site/MarketChart";
import { Heatmap } from "@/components/site/Heatmap";
import { MiniSparkline } from "@/components/site/MiniSparkline";
import { formatPercent, formatPrice, formatJalali } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Scale, Sparkles, Activity } from "lucide-react";
import { rsi as calcRsi, macd as calcMacd, sma } from "@/lib/indicators";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "تحلیل بازار خلال پسته — درج سبز قزوین" },
      { name: "description", content: "تحلیل بنیادی و تکنیکال بازار خشکبار: RSI، MACD، شاخص میانگین و نقشه حرارتی بازار." },
      { property: "og:title", content: "تحلیل بازار خلال پسته | درج سبز" },
      { property: "og:description", content: "شاخص‌های تکنیکال، مووی‌های برتر و روند قیمت‌ها." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Analysis,
});

function Analysis() {
  const { products } = useStore();
  const active = products.filter((p) => p.active);
  const featured = active.find((p) => p.featured) ?? active[0];
  const avg = active.reduce((s, p) => s + p.price, 0) / Math.max(1, active.length);
  const gainers = [...active]
    .map((p) => ({ p, ch: computeChange(p.history).pct }))
    .sort((a, b) => b.ch - a.ch)
    .slice(0, 5);
  const losers = [...active]
    .map((p) => ({ p, ch: computeChange(p.history).pct }))
    .sort((a, b) => a.ch - b.ch)
    .slice(0, 5);

  // Technical signal grid
  const signals = active.map((p) => {
    const closes = p.history.map((h) => h.close ?? h.price);
    const r = calcRsi(closes, 14);
    const m = calcMacd(closes, 12, 26, 9);
    const ma20 = sma(closes, 20);
    const last = closes[closes.length - 1];
    const lastR = r[r.length - 1] ?? 50;
    const lastMacd = m.macd[m.macd.length - 1] ?? 0;
    const lastSig = m.signal[m.signal.length - 1] ?? 0;
    const lastMa = ma20[ma20.length - 1] ?? last;
    const trend = last > lastMa ? "صعودی" : "نزولی";
    const rsiTag = lastR > 70 ? "اشباع خرید" : lastR < 30 ? "اشباع فروش" : "خنثی";
    const macdTag = lastMacd > lastSig ? "صعودی" : "نزولی";
    return { p, rsi: lastR, trend, rsiTag, macdTag };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">تحلیل بازار</div>
      <h1 className="font-display text-3xl sm:text-5xl text-olive-deep mt-2">نبض بازار خلال پسته</h1>
      <p className="text-cocoa max-w-2xl mt-3 leading-8 text-sm">
        شاخص‌های روزانه، دامنه نوسان، سیگنال‌های تکنیکال و نقشه حرارتی بازار خشکبار — به‌روزرسانی: {formatJalali(new Date())}.
      </p>
      <div className="gold-rule my-6" />

      {/* KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Kpi icon={<TrendingUp className="h-4 w-4" />} label="میانگین قیمت فعال" value={formatPrice(avg)} unit="ریال" />
        <Kpi icon={<Scale className="h-4 w-4" />} label="محصولات پایش‌شده" value={String(active.length)} unit="قلم" />
        <Kpi icon={<Sparkles className="h-4 w-4" />} label="پیشرو امروز" value={gainers[0]?.p.name ?? "-"} unit={formatPercent(gainers[0]?.ch ?? 0)} accent="bull" />
        <Kpi icon={<Activity className="h-4 w-4" />} label="اصلاحی امروز" value={losers[0]?.p.name ?? "-"} unit={formatPercent(losers[0]?.ch ?? 0)} accent="bear" />
      </div>

      {/* Featured chart */}
      {featured && (
        <div className="mt-8">
          <MarketChart product={featured} />
        </div>
      )}

      {/* Heatmap */}
      <div className="mt-8">
        <Heatmap products={active} />
      </div>

      {/* Movers */}
      <div className="grid gap-6 md:grid-cols-2 mt-10">
        <MoverList title="پرشتاب‌ترین‌ها" tone="bull" rows={gainers} />
        <MoverList title="اصلاح‌شده‌ترین‌ها" tone="bear" rows={losers} />
      </div>

      {/* Signals table */}
      <div className="mt-10 card-paper rounded-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Signals · سیگنال‌های تکنیکال</div>
          <div className="font-display text-xl text-olive-deep mt-1">تابلوی وضعیت اندیکاتورها</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-cream/50 text-[10px] tracking-widest uppercase text-brass-dark">
              <tr>
                <th className="text-right px-4 sm:px-5 py-2">محصول</th>
                <th className="text-right px-3 py-2">روند (MA20)</th>
                <th className="text-right px-3 py-2">RSI</th>
                <th className="text-right px-3 py-2">MACD</th>
                <th className="text-left px-4 sm:px-5 py-2">نمودار</th>
              </tr>
            </thead>
            <tbody>
              {signals.map(({ p, rsi, trend, rsiTag, macdTag }) => {
                const ch = computeChange(p.history).pct;
                return (
                  <tr key={p.id} className="border-t border-border/60 hover:bg-cream/40">
                    <td className="px-4 sm:px-5 py-3">
                      <Link to="/products/$slug" params={{ slug: p.slug }} className="text-olive-deep hover:text-brass-dark">
                        {p.name}
                      </Link>
                      <div className="text-[10px] text-muted-foreground tracking-widest uppercase">{p.origin}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Tag tone={trend === "صعودی" ? "bull" : "bear"}>{trend}</Tag>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="num-fa text-cocoa">{rsi.toFixed(0)}</span>
                        <Tag tone={rsiTag === "اشباع خرید" ? "bear" : rsiTag === "اشباع فروش" ? "bull" : "muted"}>
                          {rsiTag}
                        </Tag>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Tag tone={macdTag === "صعودی" ? "bull" : "bear"}>{macdTag}</Tag>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-left">
                      <div className="inline-flex flex-col items-end gap-1">
                        <MiniSparkline history={p.history} up={ch >= 0} width={90} height={22} />
                        <span className={`text-[11px] num-fa ${ch >= 0 ? "text-bull" : "text-bear"}`}>{formatPercent(ch)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commentary */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Note title="بنیادی">
          فصل برداشت پسته قزوین با کاهش نسبی تناژ و کیفیت بالاتر همراه بوده؛ نرخ صادرات و تقاضای صنایع قنادی، جهت‌دهنده اصلی روند شش‌ماهه است.
        </Note>
        <Note title="تکنیکال">
          روند میان‌مدت خلال پسته قزوین، بالای میانگین متحرک ۲۰ روزه و در محدوده‌ی خنثی RSI حفظ شده است؛ نوسان‌گیری در دامنه‌ی ۳ تا ۵ درصدی هفتگی متعارف است.
        </Note>
        <Note title="ریسک‌ها">
          نرخ ارز، شرایط اقلیمی برداشت و سیاست‌های صادراتی، سه متغیر اصلی نوسان قیمت داخلی به شمار می‌آیند.
        </Note>
      </div>

      <div className="mt-16 flex flex-wrap gap-3">
        <Link to="/market" className="rounded-sm bg-olive-deep px-6 py-3 text-sm text-paper hover:bg-olive tracking-widest">مشاهده تابلوی زنده</Link>
        <Link to="/news" className="rounded-sm border border-olive-deep/40 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest">اخبار مرتبط</Link>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, unit, accent }: { icon: React.ReactNode; label: string; value: string; unit: string; accent?: "bull" | "bear" }) {
  return (
    <div className="card-paper rounded-sm p-4 sm:p-5 min-w-0">
      <div className="flex items-center gap-2 text-brass-dark text-[10px] tracking-[0.3em] uppercase">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="font-display text-lg sm:text-xl text-olive-deep mt-2 sm:mt-3 truncate">{value}</div>
      <div className={`text-xs mt-1 num-fa ${accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-muted-foreground"}`}>{unit}</div>
    </div>
  );
}

function MoverList({ title, tone, rows }: { title: string; tone: "bull" | "bear"; rows: { p: any; ch: number }[] }) {
  return (
    <div className="card-paper rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{title}</div>
        <div className={`text-xs ${tone === "bull" ? "text-bull" : "text-bear"}`}>
          {tone === "bull" ? "صعودی" : "نزولی"}
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {rows.map(({ p, ch }) => (
          <Link
            to="/products/$slug"
            params={{ slug: p.slug }}
            key={p.id}
            className="flex items-center gap-3 py-3 hover:bg-cream/50 -mx-2 px-2 rounded-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm text-olive-deep truncate">{p.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 tracking-widest uppercase truncate">{p.origin} · {p.grade}</div>
            </div>
            <MiniSparkline history={p.history} up={ch >= 0} width={64} height={22} />
            <div className="text-left shrink-0">
              <div className="num-fa text-sm text-cocoa">{formatPrice(p.price)}</div>
              <div className={`text-xs num-fa flex items-center gap-1 justify-end ${ch >= 0 ? "text-bull" : "text-bear"}`}>
                {ch >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {formatPercent(ch)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-paper rounded-sm p-6">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{title}</div>
      <div className="gold-rule my-3" />
      <p className="text-sm text-cocoa leading-8">{children}</p>
    </div>
  );
}

function Tag({ tone, children }: { tone: "bull" | "bear" | "muted"; children: React.ReactNode }) {
  const cls =
    tone === "bull"
      ? "text-bull border-bull/40 bg-bull/5"
      : tone === "bear"
        ? "text-bear border-bear/40 bg-bear/5"
        : "text-muted-foreground border-border bg-muted/30";
  return (
    <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] tracking-widest uppercase ${cls}`}>
      {children}
    </span>
  );
}
