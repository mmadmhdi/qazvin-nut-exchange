import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, computeChange } from "@/lib/store";
import { MarketChart } from "@/components/site/MarketChart";
import { MarketSnowflake } from "@/components/site/MarketSnowflake";
import { Heatmap } from "@/components/site/Heatmap";
import { MiniSparkline } from "@/components/site/MiniSparkline";
import { formatJalali, formatPercent, formatPrice, toFaDigits } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, ArrowUpDown, Search } from "lucide-react";
import { Faq, type FaqItem } from "@/components/site/Faq";


export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "بازار پسته — تابلوی معاملات درج سبز" },
      { name: "description", content: "تابلوی معاملات پسته و خشکبار با نمودار شمعی حرفه‌ای، اندیکاتورهای RSI و MACD و نقشه بازار." },
      { property: "og:title", content: "بازار پسته امروز" },
      { property: "og:description", content: "قیمت لحظه‌ای، اندیکاتورهای تکنیکال و نقشه بازار خشکبار." },
    ],
  }),
  component: Market,
});

type SortKey = "priority" | "price" | "change" | "name";

function Market() {
  const { products } = useStore();
  const active = products.filter((p) => p.active);
  const [selectedId, setSelectedId] = useState<string>(active[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | "پسته" | "بادام درختی" | "بادام زمینی">("all");
  const [sort, setSort] = useState<SortKey>("priority");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  const rows = useMemo(() => {
    let list = active
      .filter((p) => cat === "all" || p.category === cat)
      .filter((p) => !query || p.name.includes(query) || p.origin.includes(query));
    list.sort((a, b) => {
      const ca = computeChange(a.history).pct;
      const cb = computeChange(b.history).pct;
      let d = 0;
      if (sort === "price") d = a.price - b.price;
      else if (sort === "change") d = ca - cb;
      else if (sort === "name") d = a.name.localeCompare(b.name, "fa");
      else d = a.priority - b.priority;
      return dir === "asc" ? d : -d;
    });
    return list;
  }, [active, query, cat, sort, dir]);

  const selected = rows.find((p) => p.id === selectedId) ?? rows[0] ?? active[0];

  const toggle = (k: SortKey) => {
    if (sort === k) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(k); setDir(k === "name" ? "asc" : "desc"); }
  };

  const idx = useMemo(() => {
    if (!active.length) return { avg: 0, ch: 0, up: 0, dn: 0 };
    const avg = active.reduce((s, p) => s + p.price, 0) / active.length;
    const ch = active.reduce((s, p) => s + computeChange(p.history).pct, 0) / active.length;
    const up = active.filter((p) => computeChange(p.history).pct > 0).length;
    const dn = active.filter((p) => computeChange(p.history).pct < 0).length;
    return { avg, ch, up, dn };
  }, [active]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 mb-6">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">تابلوی معاملات</div>
          <h1 className="font-display text-3xl sm:text-4xl text-olive-deep mt-1">بازار پسته امروز</h1>
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground text-left shrink-0">
          {formatJalali(new Date())}
        </div>
      </div>
      <div className="gold-rule mb-6" />

      {/* Index strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <IndexCard k="شاخص میانگین" v={formatPrice(Math.round(idx.avg))} unit="ریال" />
        <IndexCard k="روند شاخص" v={formatPercent(idx.ch)} accent={idx.ch >= 0 ? "bull" : "bear"} />
        <IndexCard k="صعودی" v={toFaDigits(idx.up)} accent="bull" />
        <IndexCard k="نزولی" v={toFaDigits(idx.dn)} accent="bear" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.9fr]">
        {/* Watchlist */}
        <div className="tv-panel rounded-sm overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-tv-border bg-tv-headband">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass">Watchlist · واچ‌لیست</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-tv-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو…"
                  className="w-full bg-tv-bg border border-tv-border rounded-sm text-xs text-tv-text placeholder:text-tv-muted pr-7 pl-2 py-1.5 outline-none focus:border-brass/60"
                />
              </div>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as any)}
                className="bg-tv-bg border border-tv-border rounded-sm text-xs text-tv-text px-2 py-1.5 outline-none focus:border-brass/60"
              >
                <option value="all">همه</option>
                <option value="پسته">پسته</option>
                <option value="بادام درختی">بادام درختی</option>
                <option value="بادام زمینی">بادام زمینی</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-[2fr_1fr_auto] px-3 py-1.5 text-[10px] tracking-widest uppercase text-tv-muted bg-tv-headband/50 border-b border-tv-border">
            <button className="flex items-center gap-1 text-right" onClick={() => toggle("name")}>
              نام <ArrowUpDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 justify-start" onClick={() => toggle("price")}>
              قیمت <ArrowUpDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 pl-1" onClick={() => toggle("change")}>
              تغییر <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[560px]">
            {rows.map((p) => {
              const ch = computeChange(p.history).pct;
              const up = ch >= 0;
              const on = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full grid grid-cols-[2fr_1fr_auto] items-center gap-2 px-3 py-2 text-right border-b border-tv-border/60 transition-colors ${
                    on ? "bg-brass/10" : "hover:bg-tv-headband/60"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[13px] text-tv-text truncate">{p.name}</div>
                    <div className="text-[10px] text-tv-muted mt-0.5 tracking-widest uppercase truncate">
                      {p.origin} · {p.grade}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="num-fa text-[12px] text-tv-text truncate">{formatPrice(p.price)}</div>
                    <div className="mt-0.5">
                      <MiniSparkline history={p.history} up={up} width={72} height={16} />
                    </div>
                  </div>
                  <div className={`num-fa text-[11px] px-1.5 py-0.5 rounded-sm border ${
                    up ? "text-bull border-bull/40 bg-bull/5" : "text-bear border-bear/40 bg-bear/5"
                  }`}>
                    {up ? "+" : "−"}{toFaDigits(Math.abs(ch).toFixed(2))}٪
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 min-w-0">
          {selected && <MarketChart product={selected} />}
          {selected && (
            <div className="grid gap-6 md:grid-cols-2">
              <MarketSnowflake product={selected} />
              <div className="card-paper rounded-sm p-5">
                <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">درباره محصول</div>
                <h2 className="font-display text-xl text-olive-deep mt-2">{selected.name}</h2>
                <p className="mt-3 text-cocoa leading-8 text-sm">{selected.description}</p>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <Meta k="منشأ" v={selected.origin} />
                  <Meta k="درجه" v={selected.grade} />
                  <Meta k="دسته" v={selected.category} />
                  <Meta k="واحد" v={selected.unit} />
                </div>
                <Link to="/products/$slug" params={{ slug: selected.slug }} className="mt-5 inline-flex text-xs tracking-widest uppercase text-brass-dark hover:text-olive-deep">
                  جزئیات کامل ←
                </Link>
              </div>
            </div>
          )}
          <Heatmap products={active} />
        </div>
      </div>

      <Faq items={PRICE_FAQ} title="پرسش‌های متداول قیمت پسته" />
    </div>
  );
}

const PRICE_FAQ: FaqItem[] = [
  {
    q: "قیمت روز خلال پسته امروز چند است؟",
    a: "نرخ روز هر قلم در همین تابلو با تاریخ آخرین معامله نمایش داده می‌شود؛ اعداد بر مبنای ریال به‌ازای هر کیلوگرم و برگرفته از دفاتر فروش رسمی شرکت درج تجارت لیا هستند.",
  },
  {
    q: "قیمت‌ها هر چند وقت به‌روزرسانی می‌شوند؟",
    a: "پس از هر معامله‌ی ثبت‌شده، نرخ و نمودار همان قلم به‌روز می‌شود؛ تاریخ آخرین به‌روزرسانی همیشه کنار عدد درج شده است.",
  },
  {
    q: "چرا قیمت خلال پسته با مغز پسته تفاوت دارد؟",
    a: "برای تولید هر کیلوگرم خلال درجه‌یک، حدود ۱٫۱۵ تا ۱٫۳۵ کیلوگرم مغز سالم مصرف می‌شود و هزینه‌ی برش، خشک‌کن و سرند نیز اضافه می‌گردد؛ به همین دلیل نرخ خلال بالاتر است.",
  },
  {
    q: "نمودار قیمت بر پایه چه داده‌ای رسم شده است؟",
    a: "بر پایه‌ی معاملات واقعی ثبت‌شده در دفاتر فروش شرکت (سال‌های ۱۴۰۴ و ۱۴۰۵)؛ برای هر روز، بازگشایی، سقف، کف، بسته‌شدن و حجم معامله محاسبه می‌شود.",
  },
  {
    q: "چه عواملی قیمت پسته را تغییر می‌دهند؟",
    a: "برآورد محصول و سرمازدگی بهاره، ضریب تبدیل مغز به خلال، هزینه‌ی فرآوری و انبارداری، تقاضای فصلی داخلی و نرخ ارز و تقاضای صادراتی.",
  },
];


function IndexCard({ k, v, unit, accent }: { k: string; v: string; unit?: string; accent?: "bull" | "bear" }) {
  return (
    <div className="card-paper rounded-sm p-4">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{k}</div>
      <div className={`font-display num-fa mt-2 text-2xl truncate ${accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-olive-deep"}`}>
        {v}
      </div>
      {unit && <div className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">{unit}</div>}
    </div>
  );
}
function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-cocoa mt-1">{v}</div>
    </div>
  );
}
