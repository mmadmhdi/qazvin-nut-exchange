import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  crmSnapshot,
  crmSaveContact,
  crmDeleteContact,
  crmSaveDeal,
  crmDeleteDeal,
  crmSetDealStage,
  crmAddActivity,
  crmToggleActivity,
  crmDeleteActivity,
  crmUpdateMessage,
  crmConvertMessage,
  crmMarketPrices,
  type MarketPrice,
  type CrmSnapshot,
  type CrmContact,
  type CrmDeal,
} from "@/lib/crm.functions";
import { formatPrice, toFaDigits } from "@/lib/format";
import { useStore } from "@/lib/store";
import { adminStatus } from "@/lib/admin-gate.functions";
import {
  Plus,
  Trash2,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Circle,
  ArrowLeftRight,
  Inbox,
  Users,
  KanbanSquare,
  ListTodo,
  UserPlus,
  Search,
  X,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

/* --------------------------------- config -------------------------------- */

const STAGES: { id: CrmDeal["stage"]; label: string; tone: string }[] = [
  { id: "new", label: "سرنخ تازه", tone: "bg-cream text-cocoa" },
  { id: "contacted", label: "تماس گرفته‌شده", tone: "bg-cream text-cocoa" },
  { id: "quoted", label: "پیش‌فاکتور", tone: "bg-brass/20 text-brass-dark" },
  { id: "negotiation", label: "مذاکره", tone: "bg-brass/30 text-brass-dark" },
  { id: "won", label: "برنده", tone: "bg-bull/15 text-bull" },
  { id: "lost", label: "از دست رفته", tone: "bg-bear/10 text-bear" },
];

const KINDS: Record<string, string> = {
  lead: "سرنخ",
  customer: "مشتری",
  supplier: "تأمین‌کننده",
  partner: "شریک",
};

const ACTIVITY_KINDS: Record<string, string> = {
  call: "تماس تلفنی",
  whatsapp: "واتس‌اپ",
  email: "ایمیل",
  meeting: "جلسه",
  note: "یادداشت",
  task: "کار پیگیری",
};

const MSG_STATUS: Record<string, string> = {
  new: "جدید",
  in_progress: "در حال پیگیری",
  answered: "پاسخ داده شد",
  archived: "بایگانی",
};

type View = "pipeline" | "contacts" | "inbox" | "tasks";

const VIEWS: { id: View; label: string; icon: typeof Users }[] = [
  { id: "pipeline", label: "قیف فروش", icon: KanbanSquare },
  { id: "contacts", label: "مشتریان", icon: Users },
  { id: "inbox", label: "پیام‌ها", icon: Inbox },
  { id: "tasks", label: "پیگیری‌ها", icon: ListTodo },
];

const emptyContact = (): CrmContact => ({
  id: "",
  name: "",
  company: "",
  phone: "",
  email: "",
  city: "قزوین",
  country: "ایران",
  kind: "lead",
  source: "manual",
  tags: [],
  notes: "",
  last_contact_at: null,
  created_at: "",
});

const emptyDeal = (): CrmDeal => ({
  id: "",
  contact_id: null,
  title: "",
  product_id: null,
  quantity_kg: 0,
  unit_price: 0,
  currency: "ریال",
  stage: "new",
  probability: 20,
  expected_close: null,
  notes: "",
  created_at: "",
  updated_at: "",
});

const field = "w-full rounded-sm border border-input bg-background px-3 py-2 text-sm";
const label = "block text-xs text-muted-foreground mb-1";

/* ---------------------------------- main --------------------------------- */

export default function AdminCrm() {
  const { products } = useStore();
  const [data, setData] = useState<CrmSnapshot | null>(null);
  const [market, setMarket] = useState<MarketPrice[]>([]);
  const [canDelete, setCanDelete] = useState(false);
  const [view, setView] = useState<View>("pipeline");
  const [contactForm, setContactForm] = useState<CrmContact | null>(null);
  const [dealForm, setDealForm] = useState<CrmDeal | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    try {
      const [snapshot, prices] = await Promise.all([crmSnapshot(), crmMarketPrices()]);
      setData(snapshot);
      setMarket(prices);
    } catch {
      toast.error("خواندن داده‌های CRM ناموفق بود");
    }
  }

  useEffect(() => {
    void load();
    adminStatus()
      .then((r) => setCanDelete(Boolean(r.canDelete)))
      .catch(() => setCanDelete(false));
  }, []);

  async function act(fn: () => Promise<unknown>, ok: string) {
    try {
      await fn();
      await load();
      toast.success(ok);
    } catch (e) {
      toast.error(`عملیات ناموفق بود: ${(e as Error).message}`);
    }
  }

  const marketById = useMemo(() => new Map(market.map((m) => [m.product_id, m])), [market]);

  /** Market reference price for a deal: last chart close, else watchlist price. */
  function marketPriceOf(productId: string | null): number | null {
    if (!productId) return null;
    const m = marketById.get(productId);
    if (!m) return null;
    return m.last_close ?? m.price ?? null;
  }

  const contactById = useMemo(
    () => new Map((data?.contacts ?? []).map((c) => [c.id, c])),
    [data],
  );

  if (!data) {
    return <div className="py-16 text-center text-sm text-muted-foreground">در حال بارگذاری CRM…</div>;
  }

  const openDeals = data.deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipelineValue = openDeals.reduce((s, d) => s + d.quantity_kg * d.unit_price, 0);
  const wonValue = data.deals
    .filter((d) => d.stage === "won")
    .reduce((s, d) => s + d.quantity_kg * d.unit_price, 0);
  const unread = data.messages.filter((m) => !m.read).length;
  const dueTasks = data.activities.filter((a) => !a.done && a.due_at).length;

  const query = q.trim();
  const filteredContacts = query
    ? data.contacts.filter((c) =>
        [c.name, c.company, c.phone, c.email, c.city, c.tags.join(" ")].join(" ").includes(query),
      )
    : data.contacts;

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi title="مشتریان و سرنخ‌ها" value={toFaDigits(data.contacts.length)} hint={`${toFaDigits(data.contacts.filter((c) => c.kind === "customer").length)} مشتری فعال`} />
        <Kpi title="معاملات باز" value={toFaDigits(openDeals.length)} hint={`ارزش: ${formatPrice(pipelineValue)}`} />
        <Kpi title="فروش برنده‌شده" value={formatPrice(wonValue)} hint={`${toFaDigits(data.deals.filter((d) => d.stage === "won").length)} معامله`} />
        <Kpi title="پیام‌های خوانده‌نشده" value={toFaDigits(unread)} hint={`${toFaDigits(dueTasks)} پیگیری سررسید`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1 overflow-x-auto rounded-sm border border-border p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 text-xs ${
                view === v.id ? "bg-olive-deep text-paper" : "text-muted-foreground hover:bg-cream"
              }`}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-[11px] text-brass-dark">
          <ShieldCheck className="h-3.5 w-3.5" />
          {canDelete ? "دسترسی مدیر (خواندن، ویرایش، حذف)" : "دسترسی کارشناس فروش (خواندن و ویرایش)"}
        </span>
        <div className="ms-auto flex gap-2">
          <button
            onClick={() => setContactForm(emptyContact())}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-xs hover:bg-cream"
          >
            <UserPlus className="h-3.5 w-3.5" /> مشتری جدید
          </button>
          <button
            onClick={() => setDealForm(emptyDeal())}
            className="inline-flex items-center gap-1.5 rounded-sm bg-olive-deep px-3 py-2 text-xs text-paper hover:bg-olive"
          >
            <Plus className="h-3.5 w-3.5" /> معامله جدید
          </button>
        </div>
      </div>

      {view === "pipeline" && market.length > 0 && (
        <div className="card-paper mb-3 rounded-sm p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-brass-dark">
            <TrendingUp className="h-3.5 w-3.5" /> قیمت روز بازار (مبنای قیمت‌گذاری معاملات)
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {market.map((m) => {
              const ref = m.last_close ?? m.price;
              const open = data.deals.filter(
                (d) => d.product_id === m.product_id && d.stage !== "won" && d.stage !== "lost",
              ).length;
              return (
                <div key={m.product_id} className="min-w-[180px] rounded-sm border border-border bg-background p-2.5">
                  <div className="truncate text-xs font-semibold text-cocoa">{m.name}</div>
                  <div className="num-fa mt-1 text-sm text-olive-deep">{formatPrice(ref)}</div>
                  <div className="num-fa mt-0.5 text-[10px] text-muted-foreground">
                    {m.last_date ? `آخرین معامله بازار: ${toFaDigits(m.last_date)}` : "بدون تاریخچه"} · {toFaDigits(open)} معامله باز
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "pipeline" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {STAGES.map((s) => {
            const deals = data.deals.filter((d) => d.stage === s.id);
            const value = deals.reduce((sum, d) => sum + d.quantity_kg * d.unit_price, 0);
            return (
              <div key={s.id} className="card-paper rounded-sm p-3">
                <div className="flex items-center justify-between">
                  <div className={`rounded-full px-2.5 py-1 text-[11px] ${s.tone}`}>{s.label}</div>
                  <div className="num-fa text-[11px] text-muted-foreground">
                    {toFaDigits(deals.length)} · {formatPrice(value)}
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {deals.length === 0 && (
                    <div className="rounded-sm border border-dashed border-border py-6 text-center text-[11px] text-muted-foreground">
                      خالی
                    </div>
                  )}
                  {deals.map((d) => {
                    const c = d.contact_id ? contactById.get(d.contact_id) : undefined;
                    return (
                      <div key={d.id} className="rounded-sm border border-border bg-background p-3">
                        <button
                          onClick={() => setDealForm(d)}
                          className="block w-full text-right text-sm font-semibold text-olive-deep"
                        >
                          {d.title}
                        </button>
                        {c && <div className="mt-1 text-[11px] text-muted-foreground">{c.name}{c.company ? ` — ${c.company}` : ""}</div>}
                        <div className="num-fa mt-2 text-xs text-cocoa">
                          {toFaDigits(d.quantity_kg)} کیلوگرم · {formatPrice(d.quantity_kg * d.unit_price)}
                        </div>
                        {(() => {
                          const ref = marketPriceOf(d.product_id);
                          if (!ref || !d.unit_price) return null;
                          const diff = ((d.unit_price - ref) / ref) * 100;
                          const tone = diff >= 0 ? "text-bull" : "text-bear";
                          return (
                            <div className="num-fa mt-1 text-[11px] text-muted-foreground">
                              قیمت بازار: {formatPrice(ref)} ·{" "}
                              <span className={tone}>
                                {diff >= 0 ? "+" : "−"}
                                {toFaDigits(Math.abs(diff).toFixed(1))}٪
                              </span>
                            </div>
                          );
                        })()}
                        <div className="mt-2 flex items-center gap-2">
                          <select
                            aria-label="مرحله معامله"
                            value={d.stage}
                            onChange={(e) =>
                              act(() => crmSetDealStage({ data: { id: d.id, stage: e.target.value as CrmDeal["stage"] } }), "مرحله به‌روز شد")
                            }
                            className="flex-1 rounded-sm border border-input bg-background px-2 py-1 text-[11px]"
                          >
                            {STAGES.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                          {canDelete && (
                          <button
                            aria-label="حذف معامله"
                            onClick={() => act(() => crmDeleteDeal({ data: { id: d.id } }), "معامله حذف شد")}
                            className="rounded-sm border border-border p-1.5 text-bear hover:bg-cream"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "contacts" && (
        <div>
          <label className="relative mb-3 block">
            <span className="sr-only">جست‌وجوی مشتری</span>
            <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="نام، شرکت، تلفن، شهر…"
              className="h-11 w-full rounded-sm border border-input bg-background pe-10 ps-3 text-sm"
            />
          </label>
          <div className="card-paper overflow-hidden rounded-sm">
            <div className="hidden md:grid grid-cols-[1.6fr_1.2fr_1fr_100px_120px] bg-cream/60 px-4 py-3 text-xs text-muted-foreground hairline-b">
              <div>نام</div>
              <div>تماس</div>
              <div>شهر</div>
              <div>نوع</div>
              <div className="text-left">عملیات</div>
            </div>
            {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">موردی ثبت نشده است.</div>
            )}
            {filteredContacts.map((c) => (
              <div key={c.id} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1.6fr_1.2fr_1fr_100px_120px] items-center hairline-b last:border-0">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-cocoa">{c.name}</div>
                  {c.company && (
                    <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" /> {c.company}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 text-xs text-muted-foreground">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="num-fa flex items-center gap-1 hover:text-olive-deep">
                      <Phone className="h-3 w-3" /> {toFaDigits(c.phone)}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-olive-deep" dir="ltr">
                      <Mail className="h-3 w-3" /> {c.email}
                    </a>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{c.city}</div>
                <div>
                  <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-brass-dark">{KINDS[c.kind] ?? c.kind}</span>
                </div>
                <div className="flex justify-start gap-2">
                  <button onClick={() => setContactForm(c)} className="rounded-sm border border-border px-2 py-1 text-[11px] hover:bg-cream">
                    ویرایش
                  </button>
                  {canDelete && (
                    <button
                      aria-label="حذف مشتری"
                      onClick={() => act(() => crmDeleteContact({ data: { id: c.id } }), "مشتری حذف شد")}
                      className="rounded-sm border border-border p-1.5 text-bear hover:bg-cream"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* activity log per contact */}
                <div className="md:col-span-5">
                  <ActivityBox
                    canDelete={canDelete}
                    contactId={c.id}
                    items={data.activities.filter((a) => a.contact_id === c.id)}
                    onAdd={(payload) => act(() => crmAddActivity({ data: payload }), "پیگیری ثبت شد")}
                    onToggle={(id, done) => act(() => crmToggleActivity({ data: { id, done } }), "به‌روز شد")}
                    onDelete={(id) => act(() => crmDeleteActivity({ data: { id } }), "حذف شد")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "inbox" && (
        <div className="card-paper overflow-hidden rounded-sm">
          {data.messages.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">پیامی دریافت نشده است.</div>
          )}
          {data.messages.map((m) => (
            <div key={m.id} className={`p-4 hairline-b last:border-0 ${m.read ? "" : "bg-cream/40"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-semibold text-cocoa">{m.name}</div>
                {m.phone && <span className="num-fa text-xs text-muted-foreground">{toFaDigits(m.phone)}</span>}
                {m.email && <span className="text-xs text-muted-foreground" dir="ltr">{m.email}</span>}
                <span className="ms-auto rounded-full bg-cream px-2 py-0.5 text-[11px] text-brass-dark">
                  {MSG_STATUS[m.status] ?? m.status}
                </span>
              </div>
              {(m.subject || m.product || m.quantity) && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {[m.subject, m.product, m.quantity].filter(Boolean).join(" · ")}
                </div>
              )}
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-cocoa">{m.message}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  aria-label="وضعیت پیام"
                  value={m.status}
                  onChange={(e) => act(() => crmUpdateMessage({ data: { id: m.id, status: e.target.value as "new" } }), "وضعیت پیام به‌روز شد")}
                  className="rounded-sm border border-input bg-background px-2 py-1 text-xs"
                >
                  {Object.entries(MSG_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => act(() => crmUpdateMessage({ data: { id: m.id, read: !m.read } }), "به‌روز شد")}
                  className="rounded-sm border border-border px-2.5 py-1 text-xs hover:bg-cream"
                >
                  {m.read ? "علامت‌گذاری نخوانده" : "خوانده شد"}
                </button>
                {m.crm_contact_id ? (
                  <span className="text-xs text-bull">در CRM ثبت شده</span>
                ) : (
                  <button
                    onClick={() => act(() => crmConvertMessage({ data: { id: m.id } }), "به مشتری CRM تبدیل شد")}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-olive-deep px-2.5 py-1 text-xs text-paper hover:bg-olive"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" /> تبدیل به سرنخ
                  </button>
                )}
                {m.phone && (
                  <a
                    href={`https://wa.me/${m.phone.replace(/\D/g, "").replace(/^0/, "98")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm border border-border px-2.5 py-1 text-xs hover:bg-cream"
                  >
                    واتس‌اپ
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "tasks" && (
        <div className="card-paper rounded-sm p-4">
          <div className="text-sm text-muted-foreground mb-3">پیگیری‌ها و یادداشت‌های ثبت‌شده</div>
          <div className="space-y-2">
            {data.activities.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">پیگیری‌ای ثبت نشده است.</div>
            )}
            {data.activities.map((a) => {
              const c = a.contact_id ? contactById.get(a.contact_id) : undefined;
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-sm border border-border p-3">
                  <button
                    aria-label={a.done ? "بازکردن پیگیری" : "انجام شد"}
                    onClick={() => act(() => crmToggleActivity({ data: { id: a.id, done: !a.done } }), "به‌روز شد")}
                    className={a.done ? "text-bull" : "text-muted-foreground"}
                  >
                    {a.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-brass-dark">
                      {ACTIVITY_KINDS[a.kind] ?? a.kind}
                      {c ? ` · ${c.name}` : ""}
                    </div>
                    <p className={`text-sm leading-6 ${a.done ? "text-muted-foreground line-through" : "text-cocoa"}`}>{a.body}</p>
                    {a.due_at && (
                      <div className="num-fa mt-1 text-[11px] text-muted-foreground">
                        سررسید: {toFaDigits(a.due_at.slice(0, 10))}
                      </div>
                    )}
                  </div>
                  {canDelete && (
                    <button
                      aria-label="حذف پیگیری"
                      onClick={() => act(() => crmDeleteActivity({ data: { id: a.id } }), "حذف شد")}
                      className="text-bear"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {contactForm && (
        <Modal title={contactForm.id ? "ویرایش مشتری" : "مشتری جدید"} onClose={() => setContactForm(null)}>
          <ContactForm
            value={contactForm}
            onChange={setContactForm}
            onSave={async () => {
              const c = contactForm;
              await act(
                () =>
                  crmSaveContact({
                    data: {
                      ...(c.id ? { id: c.id } : {}),
                      name: c.name,
                      company: c.company,
                      phone: c.phone,
                      email: c.email,
                      city: c.city,
                      country: c.country,
                      kind: c.kind as "lead",
                      source: c.source,
                      tags: c.tags,
                      notes: c.notes,
                    },
                  }),
                "مشتری ذخیره شد",
              );
              setContactForm(null);
            }}
          />
        </Modal>
      )}

      {dealForm && (
        <Modal title={dealForm.id ? "ویرایش معامله" : "معامله جدید"} onClose={() => setDealForm(null)}>
          <DealForm
            value={dealForm}
            onChange={setDealForm}
            contacts={data.contacts}
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              price: marketPriceOf(p.id) ?? p.price,
            }))}
            onSave={async () => {
              const d = dealForm;
              await act(
                () =>
                  crmSaveDeal({
                    data: {
                      ...(d.id ? { id: d.id } : {}),
                      contact_id: d.contact_id,
                      title: d.title,
                      product_id: d.product_id,
                      quantity_kg: Number(d.quantity_kg) || 0,
                      unit_price: Number(d.unit_price) || 0,
                      currency: d.currency,
                      stage: d.stage as "new",
                      probability: Number(d.probability) || 0,
                      expected_close: d.expected_close,
                      notes: d.notes,
                    },
                  }),
                "معامله ذخیره شد",
              );
              setDealForm(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

/* -------------------------------- partials ------------------------------- */

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="card-paper rounded-sm p-4">
      <div className="text-[11px] text-muted-foreground">{title}</div>
      <div className="num-fa mt-1 font-display text-xl text-olive-deep">{value}</div>
      {hint && <div className="num-fa mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-olive-deep/40 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-lg bg-background p-5 sm:rounded-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-olive-deep">{title}</h3>
          <button aria-label="بستن" onClick={onClose} className="rounded-sm border border-border p-1.5 hover:bg-cream">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ContactForm({
  value,
  onChange,
  onSave,
}: {
  value: CrmContact;
  onChange: (c: CrmContact) => void;
  onSave: () => void;
}) {
  const set = (patch: Partial<CrmContact>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="crm-name">نام</label>
          <input id="crm-name" className={field} value={value.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="crm-company">شرکت</label>
          <input id="crm-company" className={field} value={value.company} onChange={(e) => set({ company: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="crm-phone">تلفن</label>
          <input id="crm-phone" dir="ltr" className={field} value={value.phone} onChange={(e) => set({ phone: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="crm-email">ایمیل</label>
          <input id="crm-email" dir="ltr" className={field} value={value.email} onChange={(e) => set({ email: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="crm-city">شهر</label>
          <input id="crm-city" className={field} value={value.city} onChange={(e) => set({ city: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="crm-country">کشور</label>
          <input id="crm-country" className={field} value={value.country} onChange={(e) => set({ country: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="crm-kind">نوع</label>
          <select id="crm-kind" className={field} value={value.kind} onChange={(e) => set({ kind: e.target.value })}>
            {Object.entries(KINDS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="crm-source">منبع آشنایی</label>
          <input id="crm-source" className={field} value={value.source} onChange={(e) => set({ source: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="crm-tags">برچسب‌ها (با کاما)</label>
        <input
          id="crm-tags"
          className={field}
          value={value.tags.join(", ")}
          onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
        />
      </div>
      <div>
        <label className={label} htmlFor="crm-notes">یادداشت</label>
        <textarea id="crm-notes" rows={3} className={field} value={value.notes} onChange={(e) => set({ notes: e.target.value })} />
      </div>
      <button
        onClick={onSave}
        disabled={!value.name.trim()}
        className="w-full rounded-sm bg-olive-deep px-4 py-2.5 text-sm text-paper hover:bg-olive disabled:opacity-60"
      >
        ذخیره
      </button>
    </div>
  );
}

function DealForm({
  value,
  onChange,
  contacts,
  products,
  onSave,
}: {
  value: CrmDeal;
  onChange: (d: CrmDeal) => void;
  contacts: CrmContact[];
  products: { id: string; name: string; price: number }[];
  onSave: () => void;
}) {
  const set = (patch: Partial<CrmDeal>) => onChange({ ...value, ...patch });
  const total = (Number(value.quantity_kg) || 0) * (Number(value.unit_price) || 0);
  return (
    <div className="space-y-3">
      <div>
        <label className={label} htmlFor="deal-title">عنوان معامله</label>
        <input id="deal-title" className={field} value={value.title} onChange={(e) => set({ title: e.target.value })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="deal-contact">مشتری</label>
          <select
            id="deal-contact"
            className={field}
            value={value.contact_id ?? ""}
            onChange={(e) => set({ contact_id: e.target.value || null })}
          >
            <option value="">— انتخاب نشده —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="deal-product">محصول</label>
          <select
            id="deal-product"
            className={field}
            value={value.product_id ?? ""}
            onChange={(e) => {
              const p = products.find((x) => x.id === e.target.value);
              set({ product_id: e.target.value || null, unit_price: value.unit_price || (p?.price ?? 0) });
              // price defaults to the latest market close for that product
            }}
          >
            <option value="">— انتخاب نشده —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="deal-qty">مقدار (کیلوگرم)</label>
          <input
            id="deal-qty"
            type="number"
            min={0}
            className={field}
            value={value.quantity_kg}
            onChange={(e) => set({ quantity_kg: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={label} htmlFor="deal-price">قیمت واحد</label>
          <input
            id="deal-price"
            type="number"
            min={0}
            className={field}
            value={value.unit_price}
            onChange={(e) => set({ unit_price: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={label} htmlFor="deal-stage">مرحله</label>
          <select id="deal-stage" className={field} value={value.stage} onChange={(e) => set({ stage: e.target.value })}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="deal-prob">احتمال موفقیت (٪)</label>
          <input
            id="deal-prob"
            type="number"
            min={0}
            max={100}
            className={field}
            value={value.probability}
            onChange={(e) => set({ probability: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={label} htmlFor="deal-close">تاریخ تقریبی بستن</label>
          <input
            id="deal-close"
            type="date"
            className={field}
            value={value.expected_close ?? ""}
            onChange={(e) => set({ expected_close: e.target.value || null })}
          />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="deal-notes">یادداشت</label>
        <textarea id="deal-notes" rows={3} className={field} value={value.notes} onChange={(e) => set({ notes: e.target.value })} />
      </div>
      <div className="num-fa rounded-sm bg-cream px-3 py-2 text-sm text-olive-deep">ارزش معامله: {formatPrice(total)}</div>
      <button
        onClick={onSave}
        disabled={!value.title.trim()}
        className="w-full rounded-sm bg-olive-deep px-4 py-2.5 text-sm text-paper hover:bg-olive disabled:opacity-60"
      >
        ذخیره
      </button>
    </div>
  );
}

function ActivityBox({
  canDelete,
  contactId,
  items,
  onAdd,
  onToggle,
  onDelete,
}: {
  canDelete: boolean;
  contactId: string;
  items: { id: string; kind: string; body: string; due_at: string | null; done: boolean }[];
  onAdd: (payload: { contact_id: string; kind: "note"; body: string; due_at: string | null }) => void;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("call");
  const [body, setBody] = useState("");
  const [due, setDue] = useState("");

  return (
    <div className="mt-1 rounded-sm bg-cream/40 p-2">
      <button onClick={() => setOpen((o) => !o)} className="text-[11px] text-brass-dark">
        {open ? "بستن پیگیری‌ها" : `پیگیری‌ها (${toFaDigits(items.length)})`}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {items.map((a) => (
            <div key={a.id} className="flex items-start gap-2 rounded-sm bg-background p-2">
              <button
                aria-label={a.done ? "بازکردن" : "انجام شد"}
                onClick={() => onToggle(a.id, !a.done)}
                className={a.done ? "text-bull" : "text-muted-foreground"}
              >
                {a.done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-brass-dark">{ACTIVITY_KINDS[a.kind] ?? a.kind}</div>
                <p className={`text-xs leading-5 ${a.done ? "text-muted-foreground line-through" : "text-cocoa"}`}>{a.body}</p>
              </div>
              {canDelete && (
                <button aria-label="حذف" onClick={() => onDelete(a.id)} className="text-bear">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-[120px_1fr_140px_auto]">
            <select aria-label="نوع پیگیری" value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-sm border border-input bg-background px-2 py-1.5 text-xs">
              {Object.entries(ACTIVITY_KINDS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              aria-label="متن پیگیری"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="شرح تماس یا کار پیگیری…"
              className="rounded-sm border border-input bg-background px-2 py-1.5 text-xs"
            />
            <input aria-label="سررسید" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="rounded-sm border border-input bg-background px-2 py-1.5 text-xs" />
            <button
              onClick={() => {
                if (!body.trim()) return;
                onAdd({ contact_id: contactId, kind: kind as "note", body: body.trim(), due_at: due ? new Date(due).toISOString() : null });
                setBody("");
                setDue("");
              }}
              className="rounded-sm bg-olive-deep px-3 py-1.5 text-xs text-paper hover:bg-olive"
            >
              افزودن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
