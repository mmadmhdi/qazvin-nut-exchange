import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, computeChange } from "@/lib/store";
import { MarketChart } from "@/components/site/MarketChart";
import { MarketSnowflake } from "@/components/site/MarketSnowflake";
import { Heatmap } from "@/components/site/Heatmap";
import { MiniSparkline } from "@/components/site/MiniSparkline";
import { formatJalali, formatPercent, formatPrice, toFaDigits, jalaliParts, jalaliMonthName } from "@/lib/format";
import { ArrowUpDown, Search } from "lucide-react";
import { Faq } from "@/components/site/Faq";
import { priceFaq } from "@/lib/faq-i18n";
import { useTranslation } from "@/lib/i18n-provider";
import { localizeProduct, localizeCategory } from "@/lib/product-i18n";
import { seoLinks } from "@/lib/seo";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "بازار پسته — تابلوی معاملات درج سبز" },
      { name: "description", content: "تابلوی معاملات پسته و خشکبار با نمودار شمعی حرفه‌ای، اندیکاتورهای RSI و MACD و نقشه بازار." },
      { property: "og:title", content: "بازار پسته امروز" },
      { property: "og:description", content: "قیمت لحظه‌ای، اندیکاتورهای تکنیکال و نقشه بازار خشکبار." },
    ],
    links: seoLinks("/market"),
  }),
  component: Market,
});

type SortKey = "priority" | "price" | "change" | "name";

function Market() {
  const { products } = useStore();
  const { t, locale } = useTranslation();
  const active = products.filter((p) => p.active);
  const [selectedId, setSelectedId] = useState<string>(active[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | "پسته" | "بادام درختی" | "بادام زمینی">("all");
  const [sort, setSort] = useState<SortKey>("priority");
  const [dir, setDir] = useState<"desc" | "asc">("desc");
  const [jy, setJy] = useState<number | null>(null);
  const [jm, setJm] = useState<number | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = active
      .filter((p) => cat === "all" || p.category === cat)
      .filter((p) => {
        if (!q) return true;
        const l = localizeProduct(p, locale);
        return (
          p.name.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.origin.toLowerCase().includes(q)
        );
      });
    list.sort((a, b) => {
      const ca = computeChange(a.history).pct;
      const cb = computeChange(b.history).pct;
      let d = 0;
      if (sort === "price") d = a.price - b.price;
      else if (sort === "change") d = ca - cb;
      else if (sort === "name")
        d = localizeProduct(a, locale).name.localeCompare(localizeProduct(b, locale).name, locale);
      else d = a.priority - b.priority;
      return dir === "asc" ? d : -d;
    });
    return list;
  }, [active, query, cat, sort, dir, locale]);

  const selected = rows.find((p) => p.id === selectedId) ?? rows[0] ?? active[0];
  const sel = selected ? localizeProduct(selected, locale) : null;

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
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("market.eyebrow")}</div>
          <h1 className="font-display text-3xl sm:text-4xl text-olive-deep mt-1">{t("market.title")}</h1>
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground text-end shrink-0">
          {formatJalali(new Date())}
        </div>
      </div>
      <div className="gold-rule mb-6" />

      {/* Index strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <IndexCard k={t("market.idx.avg")} v={formatPrice(Math.round(idx.avg))} unit={t("market.unit.rial")} />
        <IndexCard k={t("market.idx.trend")} v={formatPercent(idx.ch)} accent={idx.ch >= 0 ? "bull" : "bear"} />
        <IndexCard k={t("market.idx.up")} v={toFaDigits(idx.up)} accent="bull" />
        <IndexCard k={t("market.idx.down")} v={toFaDigits(idx.dn)} accent="bear" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.9fr]">
        {/* Watchlist */}
        <div className="tv-panel rounded-sm overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-tv-border bg-tv-headband">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass">{t("market.watchlist")}</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute start-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-tv-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("market.search")}
                  aria-label={t("market.search")}
                  className="w-full bg-tv-bg border border-tv-border rounded-sm text-xs text-tv-text placeholder:text-tv-muted ps-7 pe-2 py-1.5 outline-none focus:border-brass/60"
                />
              </div>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as typeof cat)}
                aria-label={t("meta.category")}
                className="bg-tv-bg border border-tv-border rounded-sm text-xs text-tv-text px-2 py-1.5 outline-none focus:border-brass/60"
              >
                <option value="all">{t("market.all")}</option>
                <option value="پسته">{localizeCategory("پسته", locale)}</option>
                <option value="بادام درختی">{localizeCategory("بادام درختی", locale)}</option>
                <option value="بادام زمینی">{localizeCategory("بادام زمینی", locale)}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-[2fr_1fr_auto] px-3 py-1.5 text-[10px] tracking-widest uppercase text-tv-muted bg-tv-headband/50 border-b border-tv-border">
            <button className="flex items-center gap-1 text-start" onClick={() => toggle("name")}>
              {t("market.col.name")} <ArrowUpDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 justify-start" onClick={() => toggle("price")}>
              {t("market.col.price")} <ArrowUpDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 ps-1" onClick={() => toggle("change")}>
              {t("market.col.change")} <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[560px]">
            {rows.map((p) => {
              const ch = computeChange(p.history).pct;
              const up = ch >= 0;
              const on = selected?.id === p.id;
              const l = localizeProduct(p, locale);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full grid grid-cols-[2fr_1fr_auto] items-center gap-2 px-3 py-2 text-start border-b border-tv-border/60 transition-colors ${
                    on ? "bg-brass/10" : "hover:bg-tv-headband/60"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[13px] text-tv-text truncate">{l.name}</div>
                    <div className="text-[10px] text-tv-muted mt-0.5 tracking-widest uppercase truncate">
                      {l.origin} · {l.grade}
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
                    {up ? "+" : "−"}{locale === "en" ? Math.abs(ch).toFixed(2) : toFaDigits(Math.abs(ch).toFixed(2))}{locale === "en" ? "%" : "٪"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 min-w-0">
          {selected && (
            <div className="space-y-3">
              <PeriodFilter
                history={selected.history ?? []}
                jy={jy}
                jm={jm}
                onYear={(y) => { setJy(y); setJm(null); }}
                onMonth={setJm}
                locale={locale}
              />
              <MarketChart product={selected} period={{ jy, jm }} />
            </div>
          )}
          {selected && sel && (
            <div className="grid gap-6 md:grid-cols-2">
              <MarketSnowflake product={selected} />
              <div className="card-paper rounded-sm p-5">
                <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("market.aboutProduct")}</div>
                <h2 className="font-display text-xl text-olive-deep mt-2">{sel.name}</h2>
                <p className="mt-3 text-cocoa leading-8 text-sm">{sel.description}</p>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <Meta k={t("meta.origin")} v={sel.origin} />
                  <Meta k={t("meta.grade")} v={sel.grade} />
                  <Meta k={t("meta.category")} v={sel.category} />
                  <Meta k={t("meta.unit")} v={sel.unit} />
                </div>
                <Link to="/products/$slug" params={{ slug: selected.slug }} className="mt-5 inline-flex text-xs tracking-widest uppercase text-brass-dark hover:text-olive-deep">
                  {t("market.details")}
                </Link>
              </div>
            </div>
          )}
          <Heatmap products={active} />
        </div>
      </div>

      <Faq items={priceFaq(locale)} title={t("market.faqTitle")} />
    </div>
  );
}

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
type Loc = "fa" | "en" | "ar";
const PERIOD_LABELS: Record<Loc, { title: string; year: string; month: string; all: string; allMonths: string; bars: string }> = {
  fa: { title: "تاریخچه قیمت", year: "سال", month: "ماه", all: "همه سال‌ها", allMonths: "همه ماه‌ها", bars: "رکورد" },
  en: { title: "Price history", year: "Year", month: "Month", all: "All years", allMonths: "All months", bars: "records" },
  ar: { title: "سجل الأسعار", year: "السنة", month: "الشهر", all: "كل السنوات", allMonths: "كل الأشهر", bars: "سجل" },
};

function PeriodFilter({
  history,
  jy,
  jm,
  onYear,
  onMonth,
  locale,
}: {
  history: { date: string }[];
  jy: number | null;
  jm: number | null;
  onYear: (y: number | null) => void;
  onMonth: (m: number | null) => void;
  locale: string;
}) {
  const L = PERIOD_LABELS[(locale as Loc) in PERIOD_LABELS ? (locale as Loc) : "fa"];
  const { years, months, count } = useMemo(() => {
    const ys = new Set<number>();
    const ms = new Set<number>();
    let count = 0;
    for (const p of history) {
      const j = jalaliParts(p.date);
      if (!j) continue;
      ys.add(j.jy);
      if (jy === null || j.jy === jy) ms.add(j.jm);
      if ((jy === null || j.jy === jy) && (jm === null || j.jm === jm)) count++;
    }
    return {
      years: [...ys].sort((a, b) => b - a),
      months: [...ms].sort((a, b) => a - b),
      count,
    };
  }, [history, jy, jm]);

  const fa = locale !== "en";
  const num = (n: number | string) => (fa ? toFaDigits(n) : String(n));

  return (
    <div className="tv-panel rounded-sm px-3 py-2.5 flex flex-wrap items-center gap-2">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass me-1">{L.title}</div>
      <label className="sr-only" htmlFor="period-year">{L.year}</label>
      <select
        id="period-year"
        value={jy === null ? "all" : String(jy)}
        onChange={(e) => onYear(e.target.value === "all" ? null : Number(e.target.value))}
        className="bg-tv-bg border border-tv-border rounded-sm text-xs text-tv-text px-2 py-1.5 outline-none focus:border-brass/60"
      >
        <option value="all">{L.all}</option>
        {years.map((y) => (
          <option key={y} value={y}>{`${L.year} ${num(y)}`}</option>
        ))}
      </select>
      <label className="sr-only" htmlFor="period-month">{L.month}</label>
      <select
        id="period-month"
        value={jm === null ? "all" : String(jm)}
        onChange={(e) => onMonth(e.target.value === "all" ? null : Number(e.target.value))}
        className="bg-tv-bg border border-tv-border rounded-sm text-xs text-tv-text px-2 py-1.5 outline-none focus:border-brass/60"
      >
        <option value="all">{L.allMonths}</option>
        {months.map((m) => (
          <option key={m} value={m}>{jalaliMonthName(m - 1)}</option>
        ))}
      </select>
      <div className="flex flex-wrap items-center gap-1.5">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => onYear(jy === y ? null : y)}
            className={`text-[11px] num-fa px-2 py-1 rounded-sm border transition-colors ${
              jy === y ? "border-brass text-brass bg-brass/10" : "border-tv-border text-tv-muted hover:text-tv-text"
            }`}
          >
            {num(y)}
          </button>
        ))}
      </div>
      <div className="ms-auto text-[10px] text-tv-muted num-fa">{`${num(count)} ${L.bars}`}</div>
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
