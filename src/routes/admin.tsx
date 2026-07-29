import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, slugify, type Product } from "@/lib/store";
import { formatPrice, formatJalali, toFaDigits } from "@/lib/format";
import { toast } from "sonner";
import { Trash2, Plus, Star, StarOff, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "پنل مدیریت — خانه پسته قزوین" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const emptyProduct = (): Product => ({
  id: `p-${Date.now()}`,
  slug: `p-${Date.now()}`,
  name: "",
  category: "پسته",
  price: 0,
  unit: "ریال",
  origin: "",
  grade: "",
  description: "",
  priority: 10,
  active: true,
  featured: false,
  updatedAt: new Date().toISOString().slice(0, 10),
  history: [],
});

function Admin() {
  const { products, settings, saveProduct, deleteProduct, addPricePoint, updateSettings, resetAll } = useStore();
  const [tab, setTab] = useState<"products" | "settings">("products");
  const [editing, setEditing] = useState<Product | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">پنل مدیریت</div>
          <h1 className="font-display text-3xl text-olive-deep mt-1">مدیریت بازار</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (confirm("همه داده‌ها به مقادیر اولیه بازگردد؟")) { resetAll(); toast.success("داده‌ها بازنشانی شد"); } }} className="text-xs px-3 py-2 rounded-sm border border-border hover:bg-cream">
            بازنشانی
          </button>
        </div>
      </div>
      <div className="gold-rule my-6" />

      <div className="flex gap-1 mb-6 border-b border-border">
        {(["products", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm ${tab === t ? "text-olive-deep border-b-2 border-olive-deep -mb-px font-semibold" : "text-muted-foreground"}`}
          >
            {t === "products" ? "محصولات" : "تنظیمات سایت"}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground num-fa">{toFaDigits(products.length)} محصول</div>
            <button
              onClick={() => setEditing(emptyProduct())}
              className="inline-flex items-center gap-2 rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
            >
              <Plus className="h-4 w-4" /> افزودن محصول
            </button>
          </div>

          <div className="card-paper rounded-sm overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_120px_120px] px-4 py-3 text-xs text-muted-foreground bg-cream/60 hairline-b">
              <div>نام</div><div>دسته</div><div>قیمت</div><div>وضعیت</div><div className="text-left">عملیات</div>
            </div>
            {products.sort((a, b) => b.priority - a.priority).map((p) => (
              <div key={p.id} className="hairline-b last:border-0">
                <div className="grid grid-cols-[2fr_1fr_1fr_120px_120px] px-4 py-3 items-center text-sm">
                  <div className="text-cocoa">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.origin} · {p.grade}</div>
                  </div>
                  <div className="text-muted-foreground">{p.category}</div>
                  <div className="num-fa text-olive-deep">{formatPrice(p.price)}</div>
                  <div className="flex gap-1">
                    <button onClick={() => { saveProduct({ ...p, active: !p.active }); }} title="فعال/غیرفعال" className="p-1 rounded hover:bg-cream">
                      {p.active ? <Eye className="h-4 w-4 text-bull" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => saveProduct({ ...p, featured: !p.featured })} title="ویژه" className="p-1 rounded hover:bg-cream">
                      {p.featured ? <Star className="h-4 w-4 text-brass-dark fill-current" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="text-xs text-cocoa hover:text-olive-deep">
                      {expanded === p.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEditing(p)} className="text-xs text-cocoa hover:text-olive-deep">ویرایش</button>
                    <button onClick={() => { if (confirm("حذف شود؟")) { deleteProduct(p.id); toast.success("حذف شد"); } }} className="text-bear hover:opacity-70">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expanded === p.id && (
                  <PriceHistoryEditor product={p} onAdd={(pt) => { addPricePoint(p.id, pt); toast.success("قیمت ثبت شد"); }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="grid gap-4 max-w-2xl">
          <SettingField label="نام برند" value={settings.brandName} onChange={(v) => updateSettings({ brandName: v })} />
          <SettingField label="نام لاتین" value={settings.brandLatin} onChange={(v) => updateSettings({ brandLatin: v })} />
          <SettingField label="شعار" value={settings.brandTagline} onChange={(v) => updateSettings({ brandTagline: v })} />
          <SettingField label="واحد پول پیش‌فرض" value={settings.currency} onChange={(v) => updateSettings({ currency: v })} />
          <SettingField label="عنوان هیرو" value={settings.heroTitle} onChange={(v) => updateSettings({ heroTitle: v })} />
          <SettingField label="زیرعنوان هیرو" value={settings.heroSubtitle} onChange={(v) => updateSettings({ heroSubtitle: v })} textarea />
          <SettingField label="متن درباره ما" value={settings.aboutText} onChange={(v) => updateSettings({ aboutText: v })} textarea rows={8} />
          <SettingField label="تلفن" value={settings.contactPhone} onChange={(v) => updateSettings({ contactPhone: v })} />
          <SettingField label="نشانی" value={settings.contactAddress} onChange={(v) => updateSettings({ contactAddress: v })} />
          <SettingField label="ایمیل" value={settings.contactEmail} onChange={(v) => updateSettings({ contactEmail: v })} />
        </div>
      )}

      {editing && (
        <ProductEditor
          product={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => {
            const final = { ...p, slug: p.slug || slugify(p.name) || p.id };
            saveProduct(final);
            setEditing(null);
            toast.success("محصول ذخیره شد");
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
      <div className="text-xs text-muted-foreground mb-3">ثبت قیمت جدید</div>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-xs">
          <div className="text-muted-foreground mb-1">تاریخ (میلادی)</div>
          <input dir="ltr" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-sm border border-input bg-background px-2 py-1.5 text-sm" />
        </label>
        <label className="text-xs">
          <div className="text-muted-foreground mb-1">قیمت</div>
          <input dir="ltr" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="rounded-sm border border-input bg-background px-2 py-1.5 text-sm w-40" />
        </label>
        <button onClick={() => onAdd({ date, price })} className="rounded-sm bg-olive-deep px-3 py-1.5 text-xs text-paper hover:bg-olive">افزودن</button>
      </div>
      <div className="mt-4 max-h-40 overflow-auto text-xs">
        {[...product.history].slice(-10).reverse().map((h) => (
          <div key={h.date} className="flex justify-between py-1 border-b border-border/40 last:border-0">
            <span>{formatJalali(new Date(h.date))}</span>
            <span className="num-fa text-olive-deep">{formatPrice(h.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductEditor({ product, onSave, onCancel }: { product: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const [p, setP] = useState<Product>(product);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="card-paper rounded-sm w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 hairline-b flex items-center justify-between">
          <div className="font-display text-xl text-olive-deep">{product.name ? "ویرایش محصول" : "محصول جدید"}</div>
          <button onClick={onCancel} className="text-muted-foreground text-sm">بستن</button>
        </div>
        <div className="p-6 grid gap-4 md:grid-cols-2">
          <TextField label="نام" value={p.name} onChange={(v) => setP({ ...p, name: v })} />
          <TextField label="اسلاگ (اختیاری)" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} />
          <SelectField label="دسته" value={p.category} onChange={(v) => setP({ ...p, category: v as Product["category"] })} options={["پسته", "بادام درختی", "بادام زمینی", "سایر"]} />
          <TextField label="واحد" value={p.unit} onChange={(v) => setP({ ...p, unit: v })} />
          <NumField label="قیمت" value={p.price} onChange={(v) => setP({ ...p, price: v })} />
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
              <input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} /> ویژه (کارت بزرگ)
            </label>
          </div>
        </div>
        <div className="px-6 py-4 hairline-t flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-sm border border-border px-4 py-2 text-sm">انصراف</button>
          <button onClick={() => onSave(p)} className="rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive">ذخیره</button>
        </div>
      </div>
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
function SettingField({ label, value, onChange, textarea, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; rows?: number }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
      )}
    </div>
  );
}
