import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, computeChange } from "@/lib/store";
import { MarketChart } from "@/components/site/MarketChart";
import { Heatmap } from "@/components/site/Heatmap";
import { MiniSparkline } from "@/components/site/MiniSparkline";
import { formatPercent, formatPrice, formatJalali } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Scale, Sparkles, Activity } from "lucide-react";
import { rsi as calcRsi, macd as calcMacd, sma } from "@/lib/indicators";
import { useTranslation } from "@/lib/i18n-provider";
import { localizeProduct } from "@/lib/product-i18n";

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
  const { locale } = useTranslation();
  const c = locale === "fa" ? { eyebrow: "تحلیل بازار", title: "نبض بازار خلال پسته", intro: "شاخص‌های روزانه، دامنه نوسان، سیگنال‌های تکنیکال و نقشه حرارتی بازار خشکبار", kpis: ["میانگین قیمت فعال", "محصولات پایش‌شده", "پیشرو امروز", "اصلاحی امروز"], rial: "ریال", item: "قلم", gainers: "پرشتاب‌ترین‌ها", losers: "اصلاح‌شده‌ترین‌ها", up: "صعودی", down: "نزولی", signal: "سیگنال‌های تکنیکال", status: "تابلوی وضعیت اندیکاتورها", cols: ["محصول", "روند (MA20)", "RSI", "MACD", "نمودار"], tags: ["صعودی", "نزولی", "اشباع خرید", "اشباع فروش", "خنثی"], notes: [["بنیادی", "فصل برداشت پسته قزوین با کاهش نسبی تناژ و کیفیت بالاتر همراه بوده؛ نرخ صادرات و تقاضای صنایع قنادی، جهت‌دهنده اصلی روند شش‌ماهه است."], ["تکنیکال", "روند میان‌مدت خلال پسته قزوین، بالای میانگین متحرک ۲۰ روزه و در محدوده‌ی خنثی RSI حفظ شده است."], ["ریسک‌ها", "نرخ ارز، شرایط اقلیمی برداشت و سیاست‌های صادراتی، سه متغیر اصلی نوسان قیمت داخلی‌اند."]], live: "مشاهده تابلوی زنده", news: "اخبار مرتبط" } : locale === "ar" ? { eyebrow: "تحليل السوق", title: "نبض سوق شرائح الفستق", intro: "المؤشرات اليومية ونطاق التذبذب والإشارات الفنية وخريطة سوق المكسرات", kpis: ["متوسط السعر النشط", "المنتجات المتابعة", "المتصدر اليوم", "الأكثر تصحيحاً"], rial: "ريال", item: "منتج", gainers: "الأسرع صعوداً", losers: "الأكثر تراجعاً", up: "صاعد", down: "هابط", signal: "الإشارات الفنية", status: "حالة المؤشرات", cols: ["المنتج", "الاتجاه (MA20)", "RSI", "MACD", "الرسم"], tags: ["صاعد", "هابط", "تشبع شرائي", "تشبع بيعي", "محايد"], notes: [["أساسي", "يرتبط موسم قزوين بجودة أعلى وإنتاج محدود نسبياً، فيما يوجّه التصدير وطلب صناعات الحلويات اتجاه الأشهر الستة."], ["فني", "حافظت شرائح فستق قزوين على اتجاهها المتوسط فوق متوسط ٢٠ يوماً وفي نطاق RSI المحايد."], ["المخاطر", "سعر الصرف والمناخ وسياسات التصدير هي أبرز عوامل تقلب الأسعار المحلية."]], live: "عرض اللوحة المباشرة", news: "أخبار ذات صلة" } : { eyebrow: "Market analysis", title: "The pulse of the pistachio-sliver market", intro: "Daily indicators, trading ranges, technical signals and the nut-market heatmap", kpis: ["Average active price", "Products monitored", "Today's leader", "Largest correction"], rial: "IRR", item: "items", gainers: "Top gainers", losers: "Largest corrections", up: "Bullish", down: "Bearish", signal: "Technical signals", status: "Indicator status", cols: ["Product", "Trend (MA20)", "RSI", "MACD", "Chart"], tags: ["Bullish", "Bearish", "Overbought", "Oversold", "Neutral"], notes: [["Fundamentals", "Qazvin's harvest combines relatively lower volume with stronger quality; exports and confectionery demand guide the six-month trend."], ["Technical", "Qazvin pistachio slivers remain above their 20-day average, with RSI in neutral territory."], ["Risks", "Exchange rates, harvest weather and export policy remain the main drivers of domestic price volatility."]], live: "View live board", news: "Related news" };
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
    const trend = last > lastMa ? c.tags[0] : c.tags[1];
    const rsiTag = lastR > 70 ? c.tags[2] : lastR < 30 ? c.tags[3] : c.tags[4];
    const macdTag = lastMacd > lastSig ? c.tags[0] : c.tags[1];
    return { p, rsi: lastR, trend, rsiTag, macdTag };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
       <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{c.eyebrow}</div>
       <h1 className="font-display text-3xl sm:text-5xl text-olive-deep mt-2">{c.title}</h1>
      <p className="text-cocoa max-w-2xl mt-3 leading-8 text-sm">
         {c.intro} — {formatJalali(new Date())}.
      </p>
      <div className="gold-rule my-6" />

      {/* KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
         <Kpi icon={<TrendingUp className="h-4 w-4" />} label={c.kpis[0]} value={formatPrice(avg)} unit={c.rial} />
         <Kpi icon={<Scale className="h-4 w-4" />} label={c.kpis[1]} value={String(active.length)} unit={c.item} />
         <Kpi icon={<Sparkles className="h-4 w-4" />} label={c.kpis[2]} value={gainers[0] ? localizeProduct(gainers[0].p, locale).name : "-"} unit={formatPercent(gainers[0]?.ch ?? 0)} accent="bull" />
         <Kpi icon={<Activity className="h-4 w-4" />} label={c.kpis[3]} value={losers[0] ? localizeProduct(losers[0].p, locale).name : "-"} unit={formatPercent(losers[0]?.ch ?? 0)} accent="bear" />
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
         <MoverList title={c.gainers} tone="bull" rows={gainers} locale={locale} labels={c} />
         <MoverList title={c.losers} tone="bear" rows={losers} locale={locale} labels={c} />
      </div>

      {/* Signals table */}
      <div className="mt-10 card-paper rounded-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border">
           <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Signals · {c.signal}</div>
           <div className="font-display text-xl text-olive-deep mt-1">{c.status}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-cream/50 text-[10px] tracking-widest uppercase text-brass-dark">
              <tr>
                 {c.cols.map((x) => <th key={x} className="text-start px-3 sm:px-5 py-2">{x}</th>)}
              </tr>
            </thead>
            <tbody>
              {signals.map(({ p, rsi, trend, rsiTag, macdTag }) => {
                const ch = computeChange(p.history).pct;
                return (
                  <tr key={p.id} className="border-t border-border/60 hover:bg-cream/40">
                    <td className="px-4 sm:px-5 py-3">
                      <Link to="/products/$slug" params={{ slug: p.slug }} className="text-olive-deep hover:text-brass-dark">
                         {localizeProduct(p, locale).name}
                      </Link>
                       <div className="text-[10px] text-muted-foreground tracking-widest uppercase">{localizeProduct(p, locale).origin}</div>
                    </td>
                    <td className="px-3 py-3">
                       <Tag tone={trend === c.tags[0] ? "bull" : "bear"}>{trend}</Tag>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="num-fa text-cocoa">{rsi.toFixed(0)}</span>
                         <Tag tone={rsiTag === c.tags[2] ? "bear" : rsiTag === c.tags[3] ? "bull" : "muted"}>
                          {rsiTag}
                        </Tag>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                       <Tag tone={macdTag === c.tags[0] ? "bull" : "bear"}>{macdTag}</Tag>
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
         {c.notes.map((n) => <Note key={n[0]} title={n[0]}>{n[1]}</Note>)}
      </div>

      <div className="mt-16 flex flex-wrap gap-3">
         <Link to="/market" className="rounded-sm bg-olive-deep px-6 py-3 text-sm text-paper hover:bg-olive tracking-widest">{c.live}</Link>
         <Link to="/news" className="rounded-sm border border-olive-deep/40 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest">{c.news}</Link>
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

function MoverList({ title, tone, rows, locale, labels }: { title: string; tone: "bull" | "bear"; rows: { p: any; ch: number }[]; locale: "fa" | "en" | "ar"; labels: any }) {
  return (
    <div className="card-paper rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{title}</div>
        <div className={`text-xs ${tone === "bull" ? "text-bull" : "text-bear"}`}>
           {tone === "bull" ? labels.up : labels.down}
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
               <div className="text-sm text-olive-deep truncate">{localizeProduct(p, locale).name}</div>
               <div className="text-[10px] text-muted-foreground mt-0.5 tracking-widest uppercase truncate">{localizeProduct(p, locale).origin} · {localizeProduct(p, locale).grade}</div>
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
