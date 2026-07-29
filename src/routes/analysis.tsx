import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, computeChange } from "@/lib/store";
import { MarketChart } from "@/components/site/MarketChart";
import { formatPercent, formatPrice, formatJalali } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Scale, Sparkles } from "lucide-react";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "تحلیل بازار خلال پسته — درج سبز قزوین" },
      { name: "description", content: "تحلیل بنیادی و تکنیکال بازار خلال پسته قزوین، شاخص‌های کلیدی و روند قیمت‌ها." },
      { property: "og:title", content: "تحلیل بازار خلال پسته | درج سبز قزوین" },
      { property: "og:description", content: "شاخص‌های کلیدی بازار خشکبار و تفسیر روند قیمت‌ها." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
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
    .slice(0, 4);
  const losers = [...active]
    .map((p) => ({ p, ch: computeChange(p.history).pct }))
    .sort((a, b) => a.ch - b.ch)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">تحلیل بازار</div>
      <h1 className="font-display text-4xl md:text-5xl text-olive-deep mt-2">
        نبض بازار خلال پسته
      </h1>
      <p className="text-cocoa max-w-2xl mt-3 leading-8 text-sm">
        شاخص‌های روزانه، دامنه نوسان و بازیگران اصلی بازار خشکبار — به‌روزرسانی: {formatJalali(new Date())}.
      </p>
      <div className="gold-rule my-6" />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={<TrendingUp className="h-4 w-4" />} label="میانگین قیمت فعال" value={formatPrice(avg)} unit="ریال" />
        <Kpi icon={<Scale className="h-4 w-4" />} label="محصولات پایش‌شده" value={String(active.length)} unit="قلم" />
        <Kpi icon={<Sparkles className="h-4 w-4" />} label="پیشرو امروز" value={gainers[0]?.p.name ?? "-"} unit={formatPercent(gainers[0]?.ch ?? 0)} accent="bull" />
        <Kpi icon={<Sparkles className="h-4 w-4" />} label="اصلاحی امروز" value={losers[0]?.p.name ?? "-"} unit={formatPercent(losers[0]?.ch ?? 0)} accent="bear" />
      </div>

      {/* Featured chart */}
      {featured && (
        <div className="mt-8">
          <MarketChart product={featured} />
        </div>
      )}

      {/* Gainers / losers */}
      <div className="grid gap-6 md:grid-cols-2 mt-10">
        <MoverList title="پرشتاب‌ترین‌ها" tone="bull" rows={gainers} />
        <MoverList title="اصلاح‌شده‌ترین‌ها" tone="bear" rows={losers} />
      </div>

      {/* Commentary */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Note title="بنیادی">
          فصل برداشت پسته قزوین با کاهش نسبی تناژ و کیفیت بالاتر همراه بوده؛ نرخ صادرات و تقاضای صنایع قنادی، جهت‌دهنده اصلی روند شش‌ماهه است.
        </Note>
        <Note title="تکنیکال">
          روند میان‌مدت خلال پسته قزوین، بالای میانگین متحرک بلندمدت با حمایت‌های پلکانی؛ نوسان‌گیری در دامنه‌ی ۳ تا ۵ درصدی هفتگی متعارف است.
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
    <div className="card-paper rounded-sm p-5">
      <div className="flex items-center gap-2 text-brass-dark text-[10px] tracking-[0.3em] uppercase">
        {icon}
        {label}
      </div>
      <div className="font-display text-xl text-olive-deep mt-3 truncate">{value}</div>
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
            className="flex items-center justify-between py-3 hover:bg-cream/50 -mx-2 px-2 rounded-sm"
          >
            <div className="min-w-0">
              <div className="text-sm text-olive-deep truncate">{p.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 tracking-widest uppercase">{p.origin} · {p.grade}</div>
            </div>
            <div className="text-left">
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
