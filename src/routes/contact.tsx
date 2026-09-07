import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { COMPANY } from "@/lib/licenses";
import { sendInquiry, validateInquiry, telHref, waHref } from "@/lib/contact";
import { Phone, MapPin, Mail, Clock, MessageCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";
import { seoLinks } from "@/lib/seo";

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
    links: seoLinks("/contact"),
  }),
  component: Contact,
});

const SUBJECT_KEYS = [
  "contact.subj.price",
  "contact.subj.bulk",
  "contact.subj.export",
  "contact.subj.sample",
  "contact.subj.other",
] as const;

function Contact() {
  const { settings } = useStore();
  const { t } = useTranslation();
  const subjects = SUBJECT_KEYS.map((k) => t(k));
  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: "",
    quantity: "",
    message: "",
  });
  const wa = (settings.contactWhatsapp ?? "").trim();
  const subject = form.subject || subjects[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, subject };
    const err = validateInquiry(payload);
    if (err) {
      toast.error(err);
      return;
    }
    const via = sendInquiry(payload, settings);
    toast.success(via === "whatsapp" ? "در حال انتقال به واتساپ…" : "در حال بازکردن نامه‌ی درخواست…");
    setForm({ name: "", phone: "", subject: "", quantity: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("contact.eyebrow")}</div>
      <h1 className="font-display text-4xl sm:text-5xl text-olive-deep mt-2">{t("contact.title")}</h1>
      <div className="gold-rule my-6" />
      <p className="max-w-2xl text-sm leading-8 text-cocoa">{t("contact.intro")}</p>

      {/* Quick actions */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <a href={telHref(settings.contactPhone)} className="card-paper rounded-sm p-4 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
            <Phone className="h-4 w-4 shrink-0" /> {t("contact.phone")}
          </div>
          <div className="mt-2 num-fa text-olive-deep">{settings.contactPhone}</div>
        </a>
        {wa ? (
          <a
            href={waHref(wa, t("wholesale.waMessage", { brand: settings.brandName }))}
            target="_blank"
            rel="noopener noreferrer"
            className="card-paper rounded-sm p-4 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
              <MessageCircle className="h-4 w-4 shrink-0" /> {t("contact.whatsapp")}
            </div>
            <div className="mt-2 num-fa text-olive-deep">{wa}</div>
          </a>
        ) : null}
        <a href={`mailto:${settings.contactEmail}`} className="card-paper rounded-sm p-4 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
            <Mail className="h-4 w-4 shrink-0" /> {t("contact.email")}
          </div>
          <div dir="ltr" className="mt-2 break-all text-olive-deep">{settings.contactEmail}</div>
        </a>
        <div className="card-paper rounded-sm p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
            <Clock className="h-4 w-4 shrink-0" /> {t("contact.hours")}
          </div>
          <div className="mt-2 text-cocoa text-sm">{settings.workingHours}</div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div className="card-paper rounded-sm p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("contact.factoryAddress")}</div>
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
              {t("contact.viewOnMap")}
            </a>
          </div>
          <div className="card-paper rounded-sm p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("contact.legal")}</div>
            <div className="gold-rule my-4" />
            <Info k={t("contact.legalName")} v={COMPANY.legalName} />
            <Info k={t("contact.trademark")} v={COMPANY.trademark} />
            <Info k={t("contact.sourceCode")} v={COMPANY.sourceCode} />
            <Info k={t("contact.authority")} v={COMPANY.authority} />
            <Info k={t("contact.web")} v={COMPANY.web} dir="ltr" />
          </div>
        </div>

        <form onSubmit={submit} className="card-paper rounded-sm p-6 space-y-4">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("wholesale.form")}</div>
          <h2 className="font-display text-2xl text-olive-deep">{t("contact.formTitle")}</h2>
          <div className="gold-rule" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="contact-name" label={t("contact.fullName")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field id="contact-phone" label={t("contact.phoneNumber")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} dir="ltr" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-subject" className="text-xs tracking-widest uppercase text-muted-foreground">{t("contact.subject")}</label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Field id="contact-quantity" label={t("contact.quantity")} value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
          </div>
          <div>
            <label htmlFor="contact-message" className="text-xs tracking-widest uppercase text-muted-foreground">{t("contact.message")}</label>
            <textarea
              id="contact-message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              maxLength={1000}
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
            />
          </div>
          <button type="submit" className="w-full rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive">
            {wa ? t("contact.sendWa") : t("contact.send")}
          </button>
          <p className="text-[11px] leading-6 text-muted-foreground">
            {wa ? t("contact.noteWa") : t("contact.noteMail")}
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
  id,
  label,
  value,
  onChange,
  dir,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        maxLength={120}
        className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
      />
    </div>
  );
}
