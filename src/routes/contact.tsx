import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { COMPANY } from "@/lib/licenses";
import { sendInquiry, validateInquiry, telHref, waHref } from "@/lib/contact";
import { Phone, MapPin, Mail, Clock, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با درج سبز قزوین — استعلام قیمت خلال پسته" },
      { name: "description", content: "شماره تماس کارخانه، نشانی شهرک صنعتی لیا و فرم استعلام قیمت روز خلال پسته و بادام درج سبز قزوین." },
      { property: "og:title", content: "تماس با درج سبز قزوین" },
      { property: "og:description", content: "استعلام قیمت روز خلال پسته و خشکبار، مستقیم از تولیدکننده." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

const SUBJECTS = ["استعلام قیمت", "سفارش عمده", "صادرات", "درخواست نمونه", "سایر"];

function Contact() {
  const { settings } = useStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: SUBJECTS[0],
    quantity: "",
    message: "",
  });
  const wa = (settings.contactWhatsapp ?? "").trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateInquiry(form);
    if (err) {
      toast.error(err);
      return;
    }
    const via = sendInquiry(form, settings);
    toast.success(via === "whatsapp" ? "در حال انتقال به واتساپ…" : "در حال بازکردن نامه‌ی درخواست…");
    setForm({ name: "", phone: "", subject: SUBJECTS[0], quantity: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">ارتباط</div>
      <h1 className="font-display text-4xl sm:text-5xl text-olive-deep mt-2">تماس با درج سبز</h1>
      <div className="gold-rule my-6" />
      <p className="max-w-2xl text-sm leading-8 text-cocoa">
        برای استعلام قیمت روز، سفارش عمده یا دریافت نمونه، مستقیم با کارخانه در تماس باشید. پاسخگویی در ساعات کاری،
        بدون واسطه.
      </p>

      {/* Quick actions */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <a href={telHref(settings.contactPhone)} className="card-paper rounded-sm p-4 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
            <Phone className="h-4 w-4 shrink-0" /> تلفن کارخانه
          </div>
          <div className="mt-2 num-fa text-olive-deep">{settings.contactPhone}</div>
        </a>
        {wa ? (
          <a
            href={waHref(wa, `سلام، از وب‌سایت ${settings.brandName} برای استعلام قیمت تماس می‌گیرم.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="card-paper rounded-sm p-4 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
              <MessageCircle className="h-4 w-4 shrink-0" /> واتساپ
            </div>
            <div className="mt-2 num-fa text-olive-deep">{wa}</div>
          </a>
        ) : null}
        <a href={`mailto:${settings.contactEmail}`} className="card-paper rounded-sm p-4 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
            <Mail className="h-4 w-4 shrink-0" /> پست الکترونیک
          </div>
          <div dir="ltr" className="mt-2 break-all text-olive-deep">{settings.contactEmail}</div>
        </a>
        <div className="card-paper rounded-sm p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
            <Clock className="h-4 w-4 shrink-0" /> ساعات کاری
          </div>
          <div className="mt-2 text-cocoa text-sm">{settings.workingHours}</div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div className="card-paper rounded-sm p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">نشانی کارخانه</div>
            <div className="gold-rule my-4" />
            <div className="flex items-start gap-3 text-sm leading-8 text-cocoa">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-brass-dark" />
              <span>{settings.contactAddress}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(COMPANY.factoryAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-xs tracking-widest text-brass-dark hover:text-olive-deep"
            >
              مشاهده روی نقشه ←
            </a>
          </div>
          <div className="card-paper rounded-sm p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">اطلاعات حقوقی</div>
            <div className="gold-rule my-4" />
            <Info k="نام حقوقی" v={COMPANY.legalName} />
            <Info k="نام تجاری" v={COMPANY.trademark} />
            <Info k="شناسه منبع" v={COMPANY.sourceCode} />
            <Info k="مرجع صدور پروانه" v={COMPANY.authority} />
            <Info k="وب‌سایت" v={COMPANY.web} dir="ltr" />
          </div>
        </div>

        <form onSubmit={submit} className="card-paper rounded-sm p-6 space-y-4">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">فرم درخواست</div>
          <h2 className="font-display text-2xl text-olive-deep">استعلام قیمت و سفارش</h2>
          <div className="gold-rule" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام و نام خانوادگی" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="شماره تماس" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} dir="ltr" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground">موضوع</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Field label="مقدار موردنیاز (کیلوگرم)" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">توضیحات</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              maxLength={1000}
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
            />
          </div>
          <button type="submit" className="w-full rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive">
            {wa ? "ارسال از طریق واتساپ" : "ارسال درخواست"}
          </button>
          <p className="text-[11px] leading-6 text-muted-foreground">
            {wa
              ? "با ارسال فرم، پیام آماده‌شده در واتساپ باز می‌شود و مستقیم به تیم فروش می‌رسد."
              : "پیام شما به‌صورت ایمیل آماده ارسال می‌شود. برای ارسال مستقیم واتساپ، شماره موبایل را در پنل مدیریت ثبت کنید."}
          </p>
        </form>
      </div>
    </div>
  );
}

function Info({ k, v, dir }: { k: string; v: string; dir?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-3 border-b border-border/50 py-2 text-sm last:border-0">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="min-w-0 break-words text-cocoa" dir={dir}>{v}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: string;
}) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        maxLength={120}
        className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
      />
    </div>
  );
}
