import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, slugify, type Product } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatJalali, toFaDigits } from "@/lib/format";
import { toast } from "sonner";
import { Trash2, Plus, Star, StarOff, Eye, EyeOff, ChevronDown, ChevronUp, LogOut, MailOpen, Mail, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "پنل مدیریت — درج سبز قزوین" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type NewProductForm = Omit<Product, "history" | "updatedAt"> & { isNew: true };

function emptyProduct(): NewProductForm {
  return {
    id: "",
    slug: "",
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
    isNew: true,
  };
}

type ContactRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

function Admin() {
  const navigate = useNavigate();
  const { products, settings, saveProduct, deleteProduct, addPricePoint, updateSettings, loading } = useStore();
  const [tab, setTab] = useState<"products" | "settings" | "messages">("products");
  const [editing, setEditing] = useState<(Product & { isNew?: boolean }) | NewProductForm | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (!alive) return;
      if (error) {
        toast.error("خطا در بررسی سطح دسترسی");
        setIsAdmin(false);
      } else {
        setIsAdmin(Boolean(data));
      }
      setCheckingRole(false);
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("خارج شدید");
    navigate({ to: "/auth", replace: true });
  };

  if (checkingRole) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center text-muted-foreground text-sm">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-olive-deep" />
        <div className="mt-3">در حال بررسی دسترسی…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-olive-deep">دسترسی محدود</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          حساب شما نقش مدیر ندارد. برای دسترسی به پنل، از مدیر بخواهید نقش شما را تعیین کند.
        </p>
        <button
          onClick={signOut}
          className="mt-6 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm hover:bg-cream"
        >
          <LogOut className="h-4 w-4" /> خروج
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">پنل مدیریت</div>
          <h1 className="font-display text-3xl text-olive-deep mt-1">مدیریت بازار</h1>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-sm border border-border hover:bg-cream"
        >
          <LogOut className="h-3.5 w-3.5" /> خروج
        </button>
      </div>
      <div className="gold-rule my-6" />

      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto scrollbar-none">
        {(["products", "settings", "messages"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-2 text-sm ${tab === t ? "text-olive-deep border-b-2 border-olive-deep -mb-px font-semibold" : "text-muted-foreground"}`}
          >
            {t === "products" ? "محصولات" : t === "settings" ? "تنظیمات سایت" : "پیام‌های تماس"}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div>
          <div className="mb-4 flex justify-between items-center gap-2 flex-wrap">
            <div className="text-sm text-muted-foreground num-fa">
              {loading ? "در حال بارگذاری…" : `${toFaDigits(products.length)} محصول`}
            </div>
            <button
              onClick={() => setEditing(emptyProduct())}
              className="inline-flex items-center gap-2 rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
            >
              <Plus className="h-4 w-4" /> افزودن محصول
            </button>
          </div>

          <div className="card-paper rounded-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_120px_120px] px-4 py-3 text-xs text-muted-foreground bg-cream/60 hairline-b">
              <div>نام</div><div>دسته</div><div>قیمت</div><div>وضعیت</div><div className="text-left">عملیات</div>
            </div>
            {products.map((p) => (
              <div key={p.id} className="hairline-b last:border-0">
                <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_120px_120px] px-4 py-3 items-center gap-2 text-sm">
                  <div className="text-cocoa min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.origin} · {p.grade} · {p.category}</div>
                  </div>
                  <div className="hidden md:block text-muted-foreground">{p.category}</div>
                  <div className="hidden md:block num-fa text-olive-deep">{formatPrice(p.price)}</div>
                  <div className="hidden md:flex gap-1">
                    <button
                      onClick={() => saveProduct({ ...p, active: !p.active, isNew: false }).then(() => toast.success("بروزرسانی شد"))}
                      title="فعال/غیرفعال"
                      className="p-1 rounded hover:bg-cream"
                    >
                      {p.active ? <Eye className="h-4 w-4 text-bull" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button
                      onClick={() => saveProduct({ ...p, featured: !p.featured, isNew: false }).then(() => toast.success("بروزرسانی شد"))}
                      title="ویژه"
                      className="p-1 rounded hover:bg-cream"
                    >
                      {p.featured ? <Star className="h-4 w-4 text-brass-dark fill-current" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="text-xs text-cocoa hover:text-olive-deep p-1">
                      {expanded === p.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEditing(p)} className="text-xs text-cocoa hover:text-olive-deep">ویرایش</button>
                    <button
                      onClick={async () => {
                        if (!confirm("حذف شود؟")) return;
                        try {
                          await deleteProduct(p.id);
                          toast.success("حذف شد");
                        } catch (e) {
                          toast.error("حذف ناموفق بود");
                        }
                      }}
                      className="text-bear hover:opacity-70"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expanded === p.id && (
                  <PriceHistoryEditor
                    product={p}
                    onAdd={async (pt) => {
                      try {
                        await addPricePoint(p.id, pt);
                        toast.success("قیمت ثبت شد");
                      } catch (e) {
                        toast.error("ثبت ناموفق بود");
                      }
                    }}
                  />
                )}
              </div>
            ))}
            {!loading && products.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">محصولی ثبت نشده است.</div>
            )}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="grid gap-4 max-w-2xl">
          <SettingField label="نام برند" value={settings.brandName} onSave={(v) => updateSettings({ brandName: v })} />
          <SettingField label="نام لاتین" value={settings.brandLatin} onSave={(v) => updateSettings({ brandLatin: v })} />
          <SettingField label="شعار" value={settings.brandTagline} onSave={(v) => updateSettings({ brandTagline: v })} />
          <SettingField label="واحد پول پیش‌فرض" value={settings.currency} onSave={(v) => updateSettings({ currency: v })} />
          <SettingField label="عنوان هیرو" value={settings.heroTitle} onSave={(v) => updateSettings({ heroTitle: v })} />
          <SettingField label="زیرعنوان هیرو" value={settings.heroSubtitle} onSave={(v) => updateSettings({ heroSubtitle: v })} textarea />
          <SettingField label="متن درباره ما" value={settings.aboutText} onSave={(v) => updateSettings({ aboutText: v })} textarea rows={8} />
          <SettingField label="تلفن" value={settings.contactPhone} onSave={(v) => updateSettings({ contactPhone: v })} />
          <SettingField label="نشانی" value={settings.contactAddress} onSave={(v) => updateSettings({ contactAddress: v })} />
          <SettingField label="ایمیل" value={settings.contactEmail} onSave={(v) => updateSettings({ contactEmail: v })} />
        </div>
      )}

      {tab === "messages" && <MessagesPanel />}

      {editing && (
        <ProductEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={async (p) => {
            try {
              const isNew = "isNew" in editing && editing.isNew === true;
              await saveProduct({
                ...(p as Product),
                slug: p.slug || slugify(p.name),
                isNew,
              });
              setEditing(null);
              toast.success("محصول ذخیره شد");
            } catch (e) {
              const msg = e instanceof Error ? e.message : "خطا در ذخیره";
              toast.error(msg);
            }
          }}
        />
      )}
    </div>
  );
}

function PriceHistoryEditor({ product, onAdd }: { product: Product; onAdd: (pt: { date: string; price: number }) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [price, setPrice] = useState<number>(product.price);
  return (
    <div className="bg-cream/40 px-4 py-4 border-t border-border">
      <div className="text-xs text-muted-foreground mb-3">ثبت / بروزرسانی قیمت</div>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-xs">
          <div className="text-muted-foreground mb-1">تاریخ (میلادی)</div>
          <input dir="ltr" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-sm border border-input bg-background px-2 py-1.5 text-sm" />
        </label>
        <label className="text-xs">
          <div className="text-muted-foreground mb-1">قیمت</div>
          <input dir="ltr" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="rounded-sm border border-input bg-background px-2 py-1.5 text-sm w-40" />
        </label>
        <button
          onClick={() => {
            if (!date || !price || price <= 0) { toast.error("تاریخ و قیمت معتبر وارد کنید"); return; }
            onAdd({ date, price });
          }}
          className="rounded-sm bg-olive-deep px-3 py-1.5 text-xs text-paper hover:bg-olive"
        >
          افزودن
        </button>
      </div>
      <div className="mt-4 max-h-40 overflow-auto text-xs">
        {[...product.history].slice(-10).reverse().map((h) => (
          <div key={h.date} className="flex justify-between py-1 border-b border-border/40 last:border-0">
            <span>{formatJalali(new Date(h.date))}</span>
            <span className="num-fa text-olive-deep">{formatPrice(h.price)}</span>
          </div>
        ))}
        {product.history.length === 0 && <div className="text-muted-foreground text-center py-2">تاریخچه‌ای ثبت نشده</div>}
      </div>
    </div>
  );
}

function ProductEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: (Product & { isNew?: boolean }) | NewProductForm;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [p, setP] = useState(() => ({
    id: initial.id,
    slug: initial.slug,
    name: initial.name,
    category: initial.category,
    price: initial.price,
    unit: initial.unit,
    origin: initial.origin,
    grade: initial.grade,
    description: initial.description,
    priority: initial.priority,
    active: initial.active,
    featured: initial.featured,
    updatedAt: "updatedAt" in initial ? initial.updatedAt : "",
    history: "history" in initial ? initial.history : [],
  }));
  const isNew = "isNew" in initial && initial.isNew === true;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="card-paper rounded-sm w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 hairline-b flex items-center justify-between">
          <div className="font-display text-xl text-olive-deep">{isNew ? "محصول جدید" : "ویرایش محصول"}</div>
          <button onClick={onCancel} className="text-muted-foreground text-sm">بستن</button>
        </div>
        <div className="p-6 grid gap-4 md:grid-cols-2">
          <TextField label="نام" value={p.name} onChange={(v) => setP({ ...p, name: v })} />
          <TextField label="اسلاگ (اختیاری)" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} />
          <SelectField label="دسته" value={p.category} onChange={(v) => setP({ ...p, category: v })} options={["پسته", "بادام درختی", "بادام زمینی", "سایر"]} />
          <TextField label="واحد" value={p.unit} onChange={(v) => setP({ ...p, unit: v })} />
          <NumField label="اولویت نمایش" value={p.priority} onChange={(v) => setP({ ...p, priority: v })} />
          <TextField label="منشأ" value={p.origin} onChange={(v) => setP({ ...p, origin: v })} />
          <TextField label="درجه" value={p.grade} onChange={(v) => setP({ ...p, grade: v })} />
          <div className="md:col-span-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">توضیحات</label>
            <textarea rows={3} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.active} onChange={(e) => setP({ ...p, active: e.target.checked })} /> فعال
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} /> ویژه
            </label>
          </div>
          {isNew && (
            <div className="md:col-span-2 text-xs text-muted-foreground bg-cream/60 rounded-sm p-3 border border-border">
              پس از ایجاد محصول، از بخش «ثبت قیمت» تاریخچه قیمت را وارد کنید تا نمودار قابل نمایش شود.
            </div>
          )}
        </div>
        <div className="px-6 py-4 hairline-t flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-sm border border-border px-4 py-2 text-sm">انصراف</button>
          <button
            onClick={() => {
              if (!p.name.trim()) { toast.error("نام محصول الزامی است"); return; }
              onSave(p as Product);
            }}
            className="rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
}

function MessagesPanel() {
  const [rows, setRows] = useState<ContactRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) setErr(error.message);
    else setRows((data ?? []) as ContactRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRead = async (row: ContactRow) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: !row.read })
      .eq("id", row.id);
    if (error) toast.error("بروزرسانی ناموفق"); else load();
  };
  const remove = async (row: ContactRow) => {
    if (!confirm("پیام حذف شود؟")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", row.id);
    if (error) toast.error("حذف ناموفق"); else load();
  };

  if (err) return <div className="text-sm text-bear">{err}</div>;
  if (!rows) return <div className="text-sm text-muted-foreground">در حال بارگذاری…</div>;
  if (rows.length === 0) return <div className="text-sm text-muted-foreground">پیامی ثبت نشده است.</div>;

  return (
    <div className="grid gap-3">
      {rows.map((r) => (
        <div key={r.id} className={`card-paper rounded-sm p-4 ${r.read ? "opacity-70" : ""}`}>
          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <div className="text-cocoa font-semibold">{r.name}</div>
            <div>{new Date(r.created_at).toLocaleString("fa-IR")}</div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {r.phone && <span dir="ltr">{r.phone}</span>}
            {r.email && <span dir="ltr">{r.email}</span>}
          </div>
          <div className="mt-3 text-sm text-cocoa whitespace-pre-wrap leading-7">{r.message}</div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => toggleRead(r)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-sm border border-border hover:bg-cream">
              {r.read ? <><Mail className="h-3 w-3" /> علامت‌گذاری خوانده‌نشده</> : <><MailOpen className="h-3 w-3" /> علامت‌گذاری خوانده</>}
            </button>
            <button onClick={() => remove(r)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-sm border border-border text-bear hover:bg-cream">
              <Trash2 className="h-3 w-3" /> حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
    </div>
  );
}
function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input dir="ltr" type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SettingField({
  label,
  value,
  onSave,
  textarea,
  rows = 3,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<void>;
  textarea?: boolean;
  rows?: number;
}) {
  const [v, setV] = useState(value);
  const [busy, setBusy] = useState(false);
  useEffect(() => setV(value), [value]);
  const dirty = v !== value;
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea rows={rows} value={v} onChange={(e) => setV(e.target.value)} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
      ) : (
        <input value={v} onChange={(e) => setV(e.target.value)} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
      )}
      {dirty && (
        <div className="mt-2 flex gap-2">
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try { await onSave(v); toast.success("ذخیره شد"); } catch (e) { toast.error("ذخیره ناموفق"); } finally { setBusy(false); }
            }}
            className="rounded-sm bg-olive-deep px-3 py-1.5 text-xs text-paper hover:bg-olive disabled:opacity-60"
          >
            {busy ? "در حال ذخیره…" : "ذخیره"}
          </button>
          <button onClick={() => setV(value)} className="rounded-sm border border-border px-3 py-1.5 text-xs">انصراف</button>
        </div>
      )}
    </div>
  );
}
