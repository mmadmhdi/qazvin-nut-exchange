import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Lock,
  LogOut,
  Inbox,
  Users,
  KanbanSquare,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

import { adminStatus, unlockAdmin, lockAdmin } from "@/lib/admin-gate.functions";
import { crmSnapshot, crmMarketPrices, type CrmSnapshot, type MarketPrice } from "@/lib/crm.functions";
import { formatPrice, toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "پنل کنترل فروش — درج سبز قزوین" },
      { name: "description", content: "نمای سریع معاملات، مشتریان و پیام‌های درج سبز قزوین." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PanelGate,
});

const STAGE_LABEL: Record<string, string> = {
  new: "سرنخ تازه",
  contacted: "تماس گرفته‌شده",
  quoted: "پیش‌فاکتور",
  negotiation: "مذاکره",
  won: "برنده",
  lost: "از دست رفته",
};

const MSG_STATUS: Record<string, string> = {
  new: "جدید",
  in_progress: "در حال پیگیری",
  answered: "پاسخ داده شد",
  archived: "بایگانی",
};

/* ---------------------------------- gate --------------------------------- */

function PanelGate() {
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");
  const [role, setRole] = useState<"admin" | "sales">("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    adminStatus()
      .then((r) => {
        if (r.role) setRole(r.role);
        setState(r.unlocked ? "open" : "locked");
      })
      .catch(() => setState("locked"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const r = await unlockAdmin({ data: { password } });
      if (r.ok) {
        setRole(r.role);
        setState("open");
        setPassword("");
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
        <div className="card-paper rounded-sm p-7 text-center sm:p-9">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-olive-deep text-brass">
            <Lock className="h-5 w-5" />
          </div>
          <div className="mt-5 text-[10px] uppercase tracking-[0.3em] text-brass-dark">Private Panel</div>
          <h1 className="mt-2 font-display text-2xl text-olive-deep">ورود به پنل کنترل فروش</h1>
          <div className="gold-rule my-5" />
          <form onSubmit={submit} className="space-y-3 text-right">
            <label className="block text-xs text-muted-foreground" htmlFor="panel-password">
              رمز عبور
            </label>
            <input
              id="panel-password"
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
            این صفحه فقط برای تیم درج سبز است و در موتورهای جست‌وجو نمایه نمی‌شود.
          </p>
        </div>
      </div>
    );
  }

  return <Panel role={role} onLock={() => setState("locked")} />;
}

/* --------------------------------- panel --------------------------------- */

function Panel({ role, onLock }: { role: "admin" | "sales"; onLock: () => void }) {
  const [data, setData] = useState<CrmSnapshot | null>(null);
  const [market, setMarket] = useState<MarketPrice[]>([]);

  useEffect(() => {
    Promise.all([crmSnapshot(), crmMarketPrices()])
      .then(([snapshot, prices]) => {
        setData(snapshot);
        setMarket(prices);
      })
      .catch(() => toast.error("خواندن داده‌ها ناموفق بود"));
  }, []);

  const marketById = useMemo(() => new Map(market.map((m) => [m.product_id, m])), [market]);
  const contactById = useMemo(
    () => new Map((data?.contacts ?? []).map((c) => [c.id, c])),
    [data],
  );

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted-foreground sm:px-6">
        در حال بارگذاری…
      </div>
    );
  }

  const openDeals = data.deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipelineValue = openDeals.reduce((s, d) => s + d.quantity_kg * d.unit_price, 0);
  const wonDeals = data.deals.filter((d) => d.stage === "won");
  const wonValue = wonDeals.reduce((s, d) => s + d.quantity_kg * d.unit_price, 0);
  const unread = data.messages.filter((m) => !m.read).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-brass-dark">Sales Control</div>
          <h1 className="mt-1 font-display text-2xl text-olive-deep sm:text-3xl">پنل کنترل فروش</h1>
          <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            {role === "admin" ? "نقش: مدیر — دسترسی کامل" : "نقش: کارشناس فروش — فقط مشاهده و ویرایش"}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-xs hover:bg-cream"
          >
            <ExternalLink className="h-3.5 w-3.5" /> پنل مدیریت کامل
          </Link>
          <button
            onClick={async () => {
              await lockAdmin();
              onLock();
            }}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-xs hover:bg-cream"
          >
            <LogOut className="h-3.5 w-3.5" /> خروج
          </button>
        </div>
      </div>
      <div className="gold-rule my-5" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi title="مشتریان و سرنخ‌ها" value={toFaDigits(data.contacts.length)} hint={`${toFaDigits(data.contacts.filter((c) => c.kind === "customer").length)} مشتری فعال`} />
        <Kpi title="معاملات باز" value={toFaDigits(openDeals.length)} hint={`ارزش: ${formatPrice(pipelineValue)}`} />
        <Kpi title="فروش برنده‌شده" value={formatPrice(wonValue)} hint={`${toFaDigits(wonDeals.length)} معامله`} />
        <Kpi title="پیام‌های خوانده‌نشده" value={toFaDigits(unread)} hint={`${toFaDigits(data.messages.length)} پیام در مجموع`} />
      </div>

      {/* market reference */}
      {market.length > 0 && (
        <section className="card-paper mb-6 rounded-sm p-4">
          <div className="flex items-center gap-1.5 text-[11px] text-brass-dark">
            <TrendingUp className="h-3.5 w-3.5" /> قیمت روز بازار و معاملات مرتبط
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {market.map((m) => {
              const ref = m.last_close ?? m.price;
              const related = data.deals.filter((d) => d.product_id === m.product_id);
              const volume = related
                .filter((d) => d.stage === "won")
                .reduce((s, d) => s + d.quantity_kg, 0);
              return (
                <Link
                  key={m.product_id}
                  to="/market"
                  className="rounded-sm border border-border bg-background p-3 hover:bg-cream/50"
                >
                  <div className="truncate text-sm font-semibold text-cocoa">{m.name}</div>
                  <div className="num-fa mt-1 text-base text-olive-deep">{formatPrice(ref)}</div>
                  <div className="num-fa mt-1 text-[11px] text-muted-foreground">
                    {toFaDigits(related.length)} معامله CRM · {toFaDigits(volume)} کیلوگرم فروش قطعی
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* deals */}
      <section className="card-paper mb-6 overflow-hidden rounded-sm">
        <header className="flex items-center gap-1.5 bg-cream/60 px-4 py-3 text-xs text-brass-dark hairline-b">
          <KanbanSquare className="h-3.5 w-3.5" /> معاملات
        </header>
        {data.deals.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">معامله‌ای ثبت نشده است.</div>
        )}
        {data.deals.slice(0, 20).map((d) => {
          const c = d.contact_id ? contactById.get(d.contact_id) : undefined;
          const ref = d.product_id ? marketById.get(d.product_id)?.last_close ?? marketById.get(d.product_id)?.price ?? null : null;
          const diff = ref && d.unit_price ? ((d.unit_price - ref) / ref) * 100 : null;
          return (
            <div key={d.id} className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm hairline-b last:border-0">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-cocoa">{d.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {c ? c.name : "بدون مشتری"}
                  {c?.company ? ` — ${c.company}` : ""}
                </div>
              </div>
              <div className="num-fa text-xs text-cocoa">
                {toFaDigits(d.quantity_kg)} کیلوگرم · {formatPrice(d.quantity_kg * d.unit_price)}
              </div>
              {diff !== null && (
                <span className={`num-fa text-[11px] ${diff >= 0 ? "text-bull" : "text-bear"}`}>
                  {diff >= 0 ? "+" : "−"}
                  {toFaDigits(Math.abs(diff).toFixed(1))}٪ نسبت به بازار
                </span>
              )}
              <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-brass-dark">
                {STAGE_LABEL[d.stage] ?? d.stage}
              </span>
            </div>
          );
        })}
      </section>

      {/* contacts */}
      <section className="card-paper mb-6 overflow-hidden rounded-sm">
        <header className="flex items-center gap-1.5 bg-cream/60 px-4 py-3 text-xs text-brass-dark hairline-b">
          <Users className="h-3.5 w-3.5" /> مشتریان
        </header>
        {data.contacts.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">مشتری‌ای ثبت نشده است.</div>
        )}
        {data.contacts.slice(0, 20).map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm hairline-b last:border-0">
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-cocoa">{c.name}</div>
              {c.company && <div className="truncate text-[11px] text-muted-foreground">{c.company}</div>}
            </div>
            {c.phone && (
              <a href={`tel:${c.phone}`} className="num-fa text-xs text-muted-foreground hover:text-olive-deep">
                {toFaDigits(c.phone)}
              </a>
            )}
            <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-brass-dark">{c.city || c.country}</span>
          </div>
        ))}
      </section>

      {/* messages */}
      <section className="card-paper overflow-hidden rounded-sm">
        <header className="flex items-center gap-1.5 bg-cream/60 px-4 py-3 text-xs text-brass-dark hairline-b">
          <Inbox className="h-3.5 w-3.5" /> پیام‌های فرم تماس
        </header>
        {data.messages.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">پیامی دریافت نشده است.</div>
        )}
        {data.messages.slice(0, 15).map((m) => (
          <div key={m.id} className={`px-4 py-3 hairline-b last:border-0 ${m.read ? "" : "bg-cream/40"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-cocoa">{m.name}</div>
              {m.phone && <span className="num-fa text-xs text-muted-foreground">{toFaDigits(m.phone)}</span>}
              <span className="ms-auto rounded-full bg-cream px-2 py-0.5 text-[11px] text-brass-dark">
                {MSG_STATUS[m.status] ?? m.status}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-xs leading-6 text-cocoa">{m.message}</p>
          </div>
        ))}
      </section>

      <p className="mt-6 text-[11px] leading-6 text-muted-foreground">
        این صفحه فقط برای مشاهده است؛ برای ثبت و ویرایش از پنل مدیریت استفاده کنید.
      </p>
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="card-paper rounded-sm p-4">
      <div className="text-[11px] text-muted-foreground">{title}</div>
      <div className="num-fa mt-1 font-display text-xl text-olive-deep">{value}</div>
      {hint && <div className="num-fa mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
