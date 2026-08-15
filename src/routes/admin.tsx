import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  useStore,
  slugify,
  type Product,
  type Passport,
  type PricePoint,
  type WholesaleTier,
  type WholesaleBenefit,
} from "@/lib/store";
import { getPassport, passportRows } from "@/lib/passport";
import { ARTICLES, CATEGORIES, categoryLabel } from "@/lib/articles";
import type { Article, ArticleCategoryId } from "@/lib/articles-types";
import { formatPrice, formatJalali, toFaDigits, formatPercent } from "@/lib/format";
import { adminStatus, unlockAdmin, lockAdmin } from "@/lib/admin-gate.functions";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Star,
  StarOff,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Lock,
  LogOut,
  Download,
  Upload,
  LayoutDashboard,
  Package,
  LineChart,
  FileText,
  Settings2,
  DatabaseBackup,
  Store,
} from "lucide-react";

const PASSPORT_FIELDS: { key: keyof Passport; label: string }[] = [
  { key: "batch", label: "شماره بچ" },
  { key: "harvestYear", label: "سال برداشت" },
  { key: "region", label: "منطقه" },
  { key: "altitude", label: "ارتفاع باغ" },
  { key: "soil", label: "نوع خاک" },
  { key: "process", label: "روش فرآوری" },
  { key: "size", label: "سایز / درجه" },
  { key: "notes", label: "نت‌های طعمی" },
  { key: "units", label: "تیراژ تولید" },
  { key: "certificates", label: "گواهی‌ها" },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "پنل مدیریت — درج سبز قزوین" },
      { name: "description", content: "پنل مدیریت داخلی درج سبز قزوین." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminGate,
});

/* ---------------------------------- gate --------------------------------- */

function AdminGate() {
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    adminStatus()
      .then((r) => setState(r.unlocked ? "open" : "locked"))
      .catch(() => setState("locked"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const r = await unlockAdmin({ data: { password } });
      if (r.ok) {
        setState("open");
        setPassword("");
        toast.success("خوش آمدید");
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-muted-foreground">
        در حال بررسی دسترسی…
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-16 sm:py-24">
        <div className="card-paper rounded-sm p-7 sm:p-9 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-olive-deep text-brass">
            <Lock className="h-5 w-5" />
          </div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark mt-5">Private Area</div>
          <h1 className="font-display text-2xl text-olive-deep mt-2">ورود به پنل مدیریت</h1>
          <div className="gold-rule my-5" />
          <form onSubmit={submit} className="space-y-3 text-right">
            <label className="block text-xs text-muted-foreground">رمز عبور مدیر</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm"
            />
            {error && <p className="text-xs text-bear">رمز عبور نادرست است.</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-sm bg-olive-deep px-4 py-2.5 text-sm text-paper hover:bg-olive disabled:opacity-60"
            >
              {busy ? "در حال بررسی…" : "ورود"}
            </button>
          </form>
          <p className="mt-5 text-[11px] leading-6 text-muted-foreground">
            این بخش فقط برای مدیران سایت است و در موتورهای جست‌وجو نمایه نمی‌شود.
          </p>
        </div>
      </div>
    );
  }

  return <Admin onLock={() => setState("locked")} />;
}

/* --------------------------------- admin --------------------------------- */

type TabId = "dashboard" | "products" | "prices" | "articles" | "wholesale" | "settings" | "backup";

const TABS: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { id: "products", label: "محصولات", icon: Package },
  { id: "prices", label: "قیمت‌ها", icon: LineChart },
  { id: "articles", label: "مقالات", icon: FileText },
  { id: "wholesale", label: "عمده", icon: Store },
  { id: "settings", label: "تنظیمات سایت", icon: Settings2 },
  { id: "backup", label: "پشتیبان‌گیری", icon: DatabaseBackup },
];

function Admin({ onLock }: { onLock: () => void }) {
  const store = useStore();
  const { products, settings, saveProduct, deleteProduct, refresh } = store;
  const [tab, setTab] = useState<TabId>("dashboard");
  const [editing, setEditing] = useState<Product | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => [...products].sort((a, b) => b.priority - a.priority), [products]);

  async function act(fn: () => unknown | Promise<unknown>, ok: string) {
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error(`عملیات ناموفق بود: ${(e as Error).message}`);
    }
  }

  async function logout() {
    await lockAdmin();
    onLock();
  }


  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">پنل مدیریت</div>
          <h1 className="font-display text-2xl sm:text-3xl text-olive-deep mt-1">مرکز کنترل درج سبز</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              void refresh();
              toast.success("داده‌ها از پایگاه داده بازخوانی شد");
            }}
            className="text-xs px-3 py-2 rounded-sm border border-border hover:bg-cream"
          >
            بازخوانی
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-sm border border-border hover:bg-cream"
          >
            <LogOut className="h-3.5 w-3.5" /> خروج
          </button>
        </div>
      </div>
      <div className="gold-rule my-5 sm:my-6" />

      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-2 text-sm ${
              tab === t.id
                ? "text-olive-deep border-b-2 border-olive-deep -mb-px font-semibold"
                : "text-muted-foreground hover:text-cocoa"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <Dashboard />}

      {tab === "products" && (
        <div>
          <div className="mb-4 flex flex-wrap gap-3 justify-between items-center">
            <div className="text-sm text-muted-foreground num-fa">
              {toFaDigits(products.length)} محصول · {toFaDigits(products.filter((p) => p.active).length)} فعال
            </div>
            <button
              onClick={() => setEditing(emptyProduct())}
              className="inline-flex items-center gap-2 rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
            >
              <Plus className="h-4 w-4" /> افزودن محصول
            </button>
          </div>

          <div className="card-paper rounded-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_120px_140px] px-4 py-3 text-xs text-muted-foreground bg-cream/60 hairline-b">
              <div>نام</div>
              <div>دسته</div>
              <div>قیمت</div>
              <div>وضعیت</div>
              <div className="text-left">عملیات</div>
            </div>
            {sorted.map((p) => (
              <div key={p.id} className="hairline-b last:border-0">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] md:grid-cols-[2fr_1fr_1fr_120px_140px] gap-2 px-4 py-3 items-center text-sm">
                  <div className="min-w-0 text-cocoa">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {p.origin} · {p.grade}
                    </div>
                    <div className="md:hidden num-fa text-xs text-olive-deep mt-1">{formatPrice(p.price)}</div>
                  </div>
                  <div className="hidden md:block text-muted-foreground">{p.category}</div>
                  <div className="hidden md:block num-fa text-olive-deep md:text-right">{formatPrice(p.price)}</div>
                  <div className="flex gap-1">

                    <button
                      onClick={() => act(() => saveProduct({ ...p, active: !p.active }), p.active ? "غیرفعال شد" : "فعال شد")}
                      title="فعال/غیرفعال"
                      className="p-1 rounded hover:bg-cream"
                    >
                      {p.active ? (
                        <Eye className="h-4 w-4 text-bull" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => act(() => saveProduct({ ...p, featured: !p.featured }), "ویژه بروزرسانی شد")}
                      title="ویژه"
                      className="p-1 rounded hover:bg-cream"
                    >
                      {p.featured ? (
                        <Star className="h-4 w-4 text-brass-dark fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                      className="text-xs text-cocoa hover:text-olive-deep"
                      aria-label="تاریخچه"
                    >
                      {expanded === p.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEditing(p)} className="text-xs text-cocoa hover:text-olive-deep">
                      ویرایش
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("حذف شود؟")) act(() => deleteProduct(p.id), "حذف شد");
                      }}
                      className="text-bear hover:opacity-70"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
                {expanded === p.id && <PriceHistoryEditor product={p} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "prices" && <PricesTab />}
      {tab === "articles" && <ArticlesTab />}

      {tab === "wholesale" && <WholesaleTab />}

      {tab === "settings" && <SettingsTab />}
      {tab === "backup" && <BackupTab />}

      {editing && (
        <ProductEditor
          product={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => {
            setEditing(null);
            void act(() => saveProduct({ ...p, slug: p.slug || slugify(p.name) || p.id }), "ذخیره شد");
          }}
        />
      )}

      <p className="mt-10 text-[11px] text-muted-foreground leading-6">
        داده‌های این پنل در پایگاه داده مرکزی ذخیره می‌شود و بلافاصله برای همه بازدیدکنندگان سایت
        نمایش داده می‌شود. رمز عبور از مقدار محرمانه
        <span dir="ltr" className="mx-1 font-mono">ADMIN_PASSWORD</span>
        خوانده می‌شود. — نام برند فعلی: {settings.brandName}
      </p>

    </div>
  );
}

/* -------------------------------- dashboard ------------------------------- */

function Dashboard() {
  const { products, articles } = useStore();
  const active = products.filter((p) => p.active);
  const movers = [...active]
    .map((p) => {
      const h = p.history;
      const last = h[h.length - 1]?.price ?? p.price;
      const prev = h[h.length - 2]?.price ?? last;
      return { p, pct: prev ? ((last - prev) / prev) * 100 : 0 };
    })
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 5);
  const stale = active.filter((p) => {
    const d = new Date(p.updatedAt).getTime();
    return Date.now() - d > 3 * 86400000;
  });

  const cards = [
    { label: "محصولات فعال", value: toFaDigits(active.length) },
    { label: "کل محصولات", value: toFaDigits(products.length) },
    { label: "مقالات منتشرشده", value: toFaDigits(ARTICLES.length + articles.length) },
    { label: "نیازمند به‌روزرسانی قیمت", value: toFaDigits(stale.length) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-paper rounded-sm p-4">
            <div className="text-[11px] text-muted-foreground">{c.label}</div>
            <div className="font-display num-fa text-3xl text-olive-deep mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-paper rounded-sm overflow-hidden">
          <div className="px-4 py-3 hairline-b text-[10px] tracking-[0.3em] uppercase text-brass-dark">
            بیشترین تغییر روز
          </div>
          {movers.map(({ p, pct }) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hairline-b last:border-0 text-sm">
              <span className="truncate text-cocoa">{p.name}</span>
              <span className={`num-fa ${pct > 0 ? "text-bull" : pct < 0 ? "text-bear" : "text-muted-foreground"}`}>
                {formatPercent(pct)}
              </span>
            </div>
          ))}
        </div>

        <div className="card-paper rounded-sm overflow-hidden">
          <div className="px-4 py-3 hairline-b text-[10px] tracking-[0.3em] uppercase text-brass-dark">
            قیمت‌های قدیمی (بیش از ۳ روز)
          </div>
          {stale.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">همه قیمت‌ها به‌روز است.</div>
          ) : (
            stale.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hairline-b last:border-0 text-sm">
                <span className="truncate text-cocoa">{p.name}</span>
                <span className="num-fa text-muted-foreground">{formatJalali(p.updatedAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- prices -------------------------------- */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Builds a consistent OHLC point: the open follows the previous session's
 * close (never today's stored price), so candles and the chart stay in sync.
 */
function buildPoint(product: Product, date: string, price: number): PricePoint {
  const prior = [...(product.history ?? [])]
    .filter((h) => h.date < date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .pop();
  const existing = (product.history ?? []).find((h) => h.date === date);
  const open = prior?.close ?? prior?.price ?? price;
  return {
    date,
    price,
    close: price,
    open,
    high: Math.max(open, price, existing?.high ?? 0),
    low: Math.min(open, price, existing?.low ?? price),
    volume: existing?.volume ?? 0,
  };
}

function PricesTab() {
  const { products, bulkPricePoints } = useStore();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState<Record<string, string>>({});
  const [csvId, setCsvId] = useState(products[0]?.id ?? "");
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveAll() {
    if (!ISO_DATE.test(date)) return toast.error("تاریخ نامعتبر است");
    const jobs = products
      .map((p) => {
        const v = Number(values[p.id]);
        return Number.isFinite(v) && v > 0 ? { p, point: buildPoint(p, date, Math.round(v)) } : null;
      })
      .filter(Boolean) as { p: Product; point: PricePoint }[];
    if (!jobs.length) return toast.error("قیمتی وارد نشده است");
    setBusy(true);
    try {
      for (const j of jobs) await bulkPricePoints(j.p.id, [j.point]);
      toast.success(`${toFaDigits(jobs.length)} قیمت برای ${formatJalali(date)} ثبت شد`);
      setValues({});
    } catch (e) {
      toast.error(`ثبت قیمت‌ها ناموفق بود: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function importCsv() {
    if (!csvId) return toast.error("محصول را انتخاب کنید");
    const rows = csv
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/^(date|تاریخ)/i.test(line))
      .map((line) => line.split(/[,\t;]/).map((c) => c.trim()));
    const points: PricePoint[] = [];
    for (const r of rows) {
      const [d, price, open, high, low, volume] = r;
      if (!ISO_DATE.test(d ?? "")) continue;
      const close = Number(price);
      if (!Number.isFinite(close) || close <= 0) continue;
      const o = Number(open) || close;
      points.push({
        date: d,
        price: close,
        close,
        open: o,
        high: Math.max(Number(high) || close, o, close),
        low: Math.min(Number(low) || close, o, close),
        volume: Math.max(0, Number(volume) || 0),
      });
    }
    if (points.length === 0)
      return toast.error("داده‌ی معتبری یافت نشد (قالب: ۲۰۲۶-۰۱-۰۱,۱۰۰۰۰۰)");
    setBusy(true);
    try {
      await bulkPricePoints(csvId, points);
      setCsv("");
      toast.success(`${toFaDigits(points.length)} رکورد وارد شد`);
    } catch (e) {
      toast.error(`ورود داده ناموفق بود: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="space-y-8">
      <div className="card-paper rounded-sm">
        <div className="px-4 py-3 hairline-b flex flex-wrap items-center gap-3 justify-between">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">ثبت گروهی قیمت روز</div>
          <input
            dir="ltr"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-sm border border-input bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const v = Number(values[p.id]);
            const diff = Number.isFinite(v) && v > 0 && p.price ? ((v - p.price) / p.price) * 100 : null;
            return (
              <label key={p.id} className="text-xs">
                <div className="text-muted-foreground mb-1 flex items-center justify-between gap-2">
                  <span className="truncate">{p.name}</span>
                  <span className="num-fa shrink-0 text-[10px]">{formatPrice(p.price)}</span>
                </div>
                <input
                  dir="ltr"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={String(p.price)}
                  value={values[p.id] ?? ""}
                  onChange={(e) => setValues((s) => ({ ...s, [p.id]: e.target.value }))}
                  className="w-full rounded-sm border border-input bg-background px-2 py-2 text-sm"
                />
                {diff !== null && (
                  <div className={`mt-1 num-fa text-[10px] ${diff >= 0 ? "text-bull" : "text-bear"}`}>
                    {formatPercent(diff)} نسبت به قیمت فعلی
                  </div>
                )}
              </label>
            );
          })}
        </div>
        <div className="px-4 py-3 hairline-t flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground num-fa">
            تاریخ ثبت: {formatJalali(date)}
          </span>
          <button
            onClick={saveAll}
            disabled={busy}
            className="rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive disabled:opacity-50"
          >
            {busy ? "در حال ثبت…" : "ثبت قیمت‌ها"}
          </button>
        </div>
      </div>


      <div className="card-paper rounded-sm">
        <div className="px-4 py-3 hairline-b text-[10px] tracking-[0.3em] uppercase text-brass-dark">
          ورود انبوه تاریخچه (CSV)
        </div>
        <div className="p-4 space-y-3">
          <select
            value={csvId}
            onChange={(e) => setCsvId(e.target.value)}
            className="w-full sm:w-72 rounded-sm border border-input bg-background px-3 py-2 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <textarea
            dir="ltr"
            rows={7}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={"2026-07-01,58500000,58000000,59000000,57800000,240\n2026-07-02,58900000"}
            className="w-full rounded-sm border border-input bg-background px-3 py-2 text-xs font-mono"
          />
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <span className="text-[11px] text-muted-foreground">
              هر خط: تاریخ میلادی، قیمت پایانی، (اختیاری) باز، بیشترین، کمترین، حجم
            </span>
            <button
              onClick={importCsv}
              disabled={busy}
              className="rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive disabled:opacity-50"
            >
              {busy ? "در حال ورود…" : "وارد کردن"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* -------------------------------- articles -------------------------------- */

const emptyArticle = (): Article => ({
  slug: "",
  title: "",
  dek: "",
  category: "market",
  date: new Date().toISOString().slice(0, 10),
  minutes: 4,
  tags: [],
  body: [""],
});

function ArticlesTab() {
  const { articles, saveArticle, deleteArticle } = useStore();
  const [draft, setDraft] = useState<Article | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="text-sm text-muted-foreground num-fa">
          {toFaDigits(ARTICLES.length)} مقاله پایه · {toFaDigits(articles.length)} مقاله اختصاصی
        </div>
        <button
          onClick={() => setDraft(emptyArticle())}
          className="inline-flex items-center gap-2 rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
        >
          <Plus className="h-4 w-4" /> مقاله جدید
        </button>
      </div>

      {draft && (
        <div className="card-paper rounded-sm p-4 sm:p-6 grid gap-4 md:grid-cols-2">
          <TextField label="عنوان" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <TextField label="اسلاگ (لاتین)" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
          <SelectField
            label="دسته"
            value={draft.category}
            onChange={(v) => setDraft({ ...draft, category: v as ArticleCategoryId })}
            options={CATEGORIES.map((c) => c.id)}
            labels={CATEGORIES.map((c) => c.label)}
          />
          <NumField label="زمان مطالعه (دقیقه)" value={draft.minutes} onChange={(v) => setDraft({ ...draft, minutes: v })} />
          <div className="md:col-span-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">خلاصه</label>
            <textarea
              rows={2}
              value={draft.dek}
              onChange={(e) => setDraft({ ...draft, dek: e.target.value })}
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <TextField
            label="برچسب‌ها (با ویرگول)"
            value={draft.tags.join("، ")}
            onChange={(v) => setDraft({ ...draft, tags: v.split(/[,،]/).map((s) => s.trim()).filter(Boolean) })}
          />
          <TextField label="تاریخ (میلادی)" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} />
          <div className="md:col-span-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">متن (هر پاراگراف در یک خط)</label>
            <textarea
              rows={10}
              value={draft.body.join("\n")}
              onChange={(e) => setDraft({ ...draft, body: e.target.value.split(/\n+/) })}
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-8"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button onClick={() => setDraft(null)} className="rounded-sm border border-border px-4 py-2 text-sm">
              انصراف
            </button>
            <button
              onClick={() => {
                if (!draft.title.trim()) return toast.error("عنوان لازم است");
                const slug = draft.slug.trim() || `post-${Date.now()}`;
                saveArticle({ ...draft, slug, body: draft.body.filter(Boolean) });
                setDraft(null);
                toast.success("مقاله ذخیره شد");
              }}
              className="rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
            >
              ذخیره
            </button>
          </div>
        </div>
      )}

      <div className="card-paper rounded-sm overflow-hidden">
        {articles.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground text-center">
            هنوز مقاله‌ی اختصاصی ثبت نشده است. ۶۶ مقاله‌ی پایه‌ی سایت در «دفتر سبز» منتشر است.
          </div>
        ) : (
          articles.map((a) => (
            <div key={a.slug} className="flex items-center justify-between gap-3 px-4 py-3 hairline-b last:border-0 text-sm">
              <div className="min-w-0">
                <div className="truncate text-cocoa font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground num-fa">
                  {categoryLabel(a.category)} · {formatJalali(a.date)}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => setDraft(a)} className="text-xs text-cocoa hover:text-olive-deep">
                  ویرایش
                </button>
                <button
                  onClick={() => {
                    if (confirm("حذف شود؟")) {
                      deleteArticle(a.slug);
                      toast.success("حذف شد");
                    }
                  }}
                  className="text-bear hover:opacity-70"
                  aria-label="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* -------------------------------- wholesale -------------------------------- */

function WholesaleTab() {
  const { settings, updateSettings } = useStore();
  const tiers = settings.wholesaleTiers ?? [];
  const benefits = settings.wholesaleBenefits ?? [];

  function updateTier(index: number, patch: Partial<WholesaleTier>) {
    updateSettings({ wholesaleTiers: tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)) });
  }
  function addTier() {
    updateSettings({ wholesaleTiers: [...tiers, { name: "پلن جدید", min: 50, discount: 0, note: "" }] });
  }
  function removeTier(index: number) {
    updateSettings({ wholesaleTiers: tiers.filter((_, i) => i !== index) });
  }
  function moveTier(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= tiers.length) return;
    const next = [...tiers];
    [next[index], next[target]] = [next[target], next[index]];
    updateSettings({ wholesaleTiers: next });
  }

  function updateBenefit(index: number, text: string) {
    updateSettings({ wholesaleBenefits: benefits.map((b, i) => (i === index ? { text } : b)) });
  }
  function addBenefit() {
    updateSettings({ wholesaleBenefits: [...benefits, { text: "" }] });
  }
  function removeBenefit(index: number) {
    updateSettings({ wholesaleBenefits: benefits.filter((_, i) => i !== index) });
  }
  function moveBenefit(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= benefits.length) return;
    const next = [...benefits];
    [next[index], next[target]] = [next[target], next[index]];
    updateSettings({ wholesaleBenefits: next });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card-paper rounded-sm p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">پلن‌های عمده</div>
            <div className="font-display text-lg text-olive-deep mt-1">تیراژ، تخفیف و توضیح</div>
          </div>
          <button
            onClick={addTier}
            className="inline-flex items-center gap-1 rounded-sm bg-olive-deep px-3 py-1.5 text-xs text-paper hover:bg-olive"
          >
            <Plus className="h-3.5 w-3.5" /> افزودن
          </button>
        </div>
        <div className="gold-rule my-4" />
        <div className="space-y-4">
          {tiers.map((t, i) => (
            <div key={i} className="grid gap-3 border-b border-border/40 pb-4 last:border-0">
              <div className="grid gap-3 md:grid-cols-2">
                <TextField label="نام پلن" value={t.name} onChange={(v) => updateTier(i, { name: v })} />
                <NumField label="حداقل (کیلوگرم)" value={t.min} onChange={(v) => updateTier(i, { min: v })} />
                <NumField label="درصد تخفیف" value={t.discount} onChange={(v) => updateTier(i, { discount: v })} />
                <TextField label="توضیح کوتاه" value={t.note} onChange={(v) => updateTier(i, { note: v })} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveTier(i, -1)}
                  disabled={i === 0}
                  className="p-1 rounded border border-border disabled:opacity-40 hover:bg-cream"
                  aria-label="بالا"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveTier(i, 1)}
                  disabled={i === tiers.length - 1}
                  className="p-1 rounded border border-border disabled:opacity-40 hover:bg-cream"
                  aria-label="پایین"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeTier(i)}
                  className="p-1 rounded border border-border text-bear hover:bg-cream mr-auto"
                  aria-label="حذف"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {tiers.length === 0 && <p className="text-sm text-muted-foreground">هنوز پلنی ثبت نشده.</p>}
        </div>
      </div>

      <div className="card-paper rounded-sm p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">تعهدات</div>
            <div className="font-display text-lg text-olive-deep mt-1">مزایای خرید عمده</div>
          </div>
          <button
            onClick={addBenefit}
            className="inline-flex items-center gap-1 rounded-sm bg-olive-deep px-3 py-1.5 text-xs text-paper hover:bg-olive"
          >
            <Plus className="h-3.5 w-3.5" /> افزودن
          </button>
        </div>
        <div className="gold-rule my-4" />
        <div className="space-y-3">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <TextField label={`مورد ${i + 1}`} value={b.text} onChange={(v) => updateBenefit(i, v)} />
              </div>
              <div className="flex flex-col gap-2 pt-6">
                <button
                  onClick={() => moveBenefit(i, -1)}
                  disabled={i === 0}
                  className="p-1 rounded border border-border disabled:opacity-40 hover:bg-cream"
                  aria-label="بالا"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveBenefit(i, 1)}
                  disabled={i === benefits.length - 1}
                  className="p-1 rounded border border-border disabled:opacity-40 hover:bg-cream"
                  aria-label="پایین"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => removeBenefit(i)}
                className="mt-6 p-1 rounded border border-border text-bear hover:bg-cream"
                aria-label="حذف"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {benefits.length === 0 && <p className="text-sm text-muted-foreground">هنوز موردی ثبت نشده.</p>}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- settings -------------------------------- */

function SettingsTab() {
  const { settings, updateSettings } = useStore();
  const groups: { title: string; fields: { key: keyof typeof settings; label: string; textarea?: boolean; rows?: number }[] }[] = [
    {
      title: "هویت برند",
      fields: [
        { key: "brandName", label: "نام برند" },
        { key: "brandLatin", label: "نام لاتین" },
        { key: "brandTagline", label: "شعار" },
        { key: "foundedYear", label: "سال تأسیس" },
        { key: "currency", label: "واحد پول" },
      ],
    },
    {
      title: "صفحه اصلی",
      fields: [
        { key: "heroTitle", label: "عنوان هیرو" },
        { key: "heroSubtitle", label: "زیرعنوان هیرو", textarea: true },
        { key: "announcement", label: "نوار اطلاعیه" },
      ],
    },
    {
      title: "درباره ما",
      fields: [
        { key: "aboutText", label: "متن درباره ما", textarea: true, rows: 8 },
        { key: "missionText", label: "بیانیه مأموریت", textarea: true },
        { key: "exportText", label: "متن صادرات / عمده", textarea: true },
      ],
    },
    {
      title: "ارتباط",
      fields: [
        { key: "contactPhone", label: "تلفن" },
        { key: "contactWhatsapp", label: "واتساپ" },
        { key: "contactEmail", label: "ایمیل" },
        { key: "contactAddress", label: "نشانی" },
        { key: "workingHours", label: "ساعات کاری" },
        { key: "instagram", label: "اینستاگرام" },
        { key: "telegram", label: "تلگرام" },
      ],
    },
    {
      title: "سئو",
      fields: [
        { key: "seoTitle", label: "عنوان سئو" },
        { key: "seoDescription", label: "توضیح متا", textarea: true },
      ],
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {groups.map((g) => (
        <div key={g.title} className="card-paper rounded-sm p-4 sm:p-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{g.title}</div>
          <div className="gold-rule my-4" />
          <div className="grid gap-4">
            {g.fields.map((f) => (
              <SettingField
                key={String(f.key)}
                label={f.label}
                value={(settings[f.key] as string) ?? ""}
                onChange={(v) => updateSettings({ [f.key]: v })}
                textarea={f.textarea}
                rows={f.rows}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- backup --------------------------------- */

function BackupTab() {
  const { exportData, importData } = useStore();
  const [text, setText] = useState("");

  function download() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `darj-sabz-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("فایل پشتیبان دانلود شد");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card-paper rounded-sm p-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">خروجی</div>
        <p className="text-sm text-cocoa leading-7 mt-3">
          یک فایل JSON شامل همه محصولات، تاریخچه قیمت، مقالات اختصاصی و تنظیمات سایت دریافت کنید.
        </p>
        <button
          onClick={download}
          className="mt-4 inline-flex items-center gap-2 rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
        >
          <Download className="h-4 w-4" /> دانلود پشتیبان
        </button>
      </div>
      <div className="card-paper rounded-sm p-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">بازیابی</div>
        <textarea
          dir="ltr"
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="محتوای فایل پشتیبان را اینجا بچسبانید"
          className="mt-3 w-full rounded-sm border border-input bg-background px-3 py-2 text-xs font-mono"
        />
        <button
          onClick={async () => {
            if (await importData(text)) {
              toast.success("داده‌ها بازیابی شد");
              setText("");
            } else toast.error("فایل نامعتبر است");
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm hover:bg-cream"
        >
          <Upload className="h-4 w-4" /> بازیابی
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- products -------------------------------- */

const emptyProduct = (): Product => ({
  id: `p-${Date.now()}`,
  slug: `p-${Date.now()}`,
  name: "",
  category: "پسته",
  price: 0,
  unit: "ریال / کیلوگرم",
  origin: "",
  grade: "",
  description: "",
  priority: 10,
  active: true,
  featured: false,
  updatedAt: new Date().toISOString().slice(0, 10),
  history: [],
});

function PriceHistoryEditor({ product }: { product: Product }) {
  const { bulkPricePoints, removePricePoint } = useStore();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [price, setPrice] = useState<string>(String(product.price || ""));
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(
    () => [...(product.history ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    [product.history],
  );

  async function submit() {
    const v = Math.round(Number(price));
    if (!ISO_DATE.test(date)) return toast.error("تاریخ نامعتبر است");
    if (!Number.isFinite(v) || v <= 0) return toast.error("قیمت باید بزرگ‌تر از صفر باشد");
    setBusy(true);
    try {
      await bulkPricePoints(product.id, [buildPoint(product, date, v)]);
      toast.success(`قیمت ${formatJalali(date)} ثبت شد`);
    } catch (e) {
      toast.error(`ثبت قیمت ناموفق بود: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function remove(d: string) {
    setBusy(true);
    try {
      await removePricePoint(product.id, d);
      toast.success("رکورد حذف شد");
    } catch (e) {
      toast.error(`حذف ناموفق بود: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-cream/40 px-4 py-4 border-t border-border">
      <div className="text-xs text-muted-foreground mb-3">
        ثبت یا اصلاح قیمت (تاریخ تکراری بازنویسی می‌شود)
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-xs">
          <div className="text-muted-foreground mb-1">تاریخ (میلادی)</div>
          <input
            dir="ltr"
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-sm border border-input bg-background px-2 py-1.5 text-sm"
          />
          <div className="mt-1 num-fa text-[10px] text-muted-foreground">{formatJalali(date)}</div>
        </label>
        <label className="text-xs">
          <div className="text-muted-foreground mb-1">قیمت</div>
          <input
            dir="ltr"
            type="number"
            min={0}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-sm border border-input bg-background px-2 py-1.5 text-sm w-40"
          />
        </label>
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-sm bg-olive-deep px-3 py-1.5 text-xs text-paper hover:bg-olive disabled:opacity-50"
        >
          {busy ? "…" : "ثبت"}
        </button>
      </div>
      <div className="mt-4 max-h-56 overflow-auto text-xs">
        {sorted.length === 0 && (
          <div className="text-muted-foreground py-2">تاریخچه‌ای ثبت نشده است.</div>
        )}
        {sorted
          .slice(-30)
          .reverse()
          .map((h) => (
            <div
              key={h.date}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-1 border-b border-border/40 last:border-0"
            >
              <span className="num-fa">{formatJalali(h.date)}</span>
              <span className="num-fa text-olive-deep">{formatPrice(h.close ?? h.price)}</span>
              <button
                onClick={() => remove(h.date)}
                disabled={busy}
                className="text-bear hover:opacity-70 disabled:opacity-40"
                aria-label="حذف رکورد"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}


function ProductEditor({
  product,
  onSave,
  onCancel,
}: {
  product: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [p, setP] = useState<Product>(product);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="card-paper rounded-sm w-full max-w-2xl max-h-[92vh] overflow-auto">
        <div className="px-4 sm:px-6 py-4 hairline-b flex items-center justify-between">
          <div className="font-display text-lg sm:text-xl text-olive-deep">
            {product.name ? "ویرایش محصول" : "محصول جدید"}
          </div>
          <button onClick={onCancel} className="text-muted-foreground text-sm">
            بستن
          </button>
        </div>
        <div className="p-4 sm:p-6 grid gap-4 md:grid-cols-2">
          <TextField label="نام" value={p.name} onChange={(v) => setP({ ...p, name: v })} />
          <TextField label="اسلاگ (اختیاری)" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} />
          <SelectField
            label="دسته"
            value={p.category}
            onChange={(v) => setP({ ...p, category: v as Product["category"] })}
            options={["پسته", "بادام درختی", "بادام زمینی", "سایر"]}
          />
          <TextField label="واحد" value={p.unit} onChange={(v) => setP({ ...p, unit: v })} />
          <NumField label="قیمت" value={p.price} onChange={(v) => setP({ ...p, price: v })} />
          <NumField label="اولویت نمایش" value={p.priority} onChange={(v) => setP({ ...p, priority: v })} />
          <TextField label="منشأ" value={p.origin} onChange={(v) => setP({ ...p, origin: v })} />
          <TextField label="درجه" value={p.grade} onChange={(v) => setP({ ...p, grade: v })} />
          <div className="md:col-span-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">توضیحات</label>
            <textarea
              rows={3}
              value={p.description}
              onChange={(e) => setP({ ...p, description: e.target.value })}
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.active} onChange={(e) => setP({ ...p, active: e.target.checked })} /> فعال
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} /> ویژه
            </label>
          </div>

          <div className="md:col-span-2 hairline-t pt-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Pistachio Passport</div>
                <div className="font-display text-lg text-olive-deep">شناسنامه محصول</div>
              </div>
              <button
                onClick={() => setP({ ...p, passport: p.passport ? undefined : getPassport(p) })}
                className="shrink-0 rounded-sm border border-border px-3 py-1.5 text-xs hover:bg-cream"
              >
                {p.passport ? "بازگشت به خودکار" : "ویرایش دستی"}
              </button>
            </div>
            {p.passport ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {PASSPORT_FIELDS.map((f) => (
                  <TextField
                    key={f.key}
                    label={f.label}
                    value={p.passport![f.key]}
                    onChange={(v) => setP({ ...p, passport: { ...p.passport!, [f.key]: v } })}
                  />
                ))}
              </div>
            ) : (
              <dl className="mt-3 grid gap-x-6 text-xs md:grid-cols-2">
                {passportRows(getPassport(p)).map((r) => (
                  <div
                    key={r.label}
                    className="grid grid-cols-[minmax(0,100px)_minmax(0,1fr)] gap-2 border-b border-border/40 py-1.5"
                  >
                    <dt className="text-muted-foreground">{r.label}</dt>
                    <dd className="min-w-0 text-cocoa">{r.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 hairline-t flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-sm border border-border px-4 py-2 text-sm">
            انصراف
          </button>
          <button onClick={() => onSave(p)} className="rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive">
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- fields --------------------------------- */

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input
        dir="ltr"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: string[];
}) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
      >
        {options.map((o, i) => (
          <option key={o} value={o}>
            {labels?.[i] ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingField({
  label,
  value,
  onChange,
  textarea,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-7"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
