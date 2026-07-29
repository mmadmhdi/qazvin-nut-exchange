import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس — خانه پسته قزوین" },
      { name: "description", content: "برای استعلام قیمت و سفارش، با ما در تماس باشید." },
      { property: "og:title", content: "تماس با خانه پسته قزوین" },
      { property: "og:description", content: "استعلام قیمت روز خلال پسته و خشکبار." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { settings } = useStore();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">ارتباط</div>
      <h1 className="font-display text-5xl text-olive-deep mt-2">تماس با ما</h1>
      <div className="gold-rule my-8" />
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <Info k="تلفن" v={settings.contactPhone} />
          <Info k="نشانی" v={settings.contactAddress} />
          <Info k="پست الکترونیک" v={settings.contactEmail} dir="ltr" />
          <p className="text-sm text-muted-foreground leading-8">
            برای استعلام قیمت عمده و سفارش‌های سازمانی، در ساعات کاری با ما تماس بگیرید یا فرم روبه‌رو را تکمیل کنید.
          </p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("درخواست شما ثبت شد"); setForm({ name: "", phone: "", message: "" }); }}
          className="card-paper rounded-sm p-6 space-y-4"
        >
          <Field label="نام و نام خانوادگی" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="شماره تماس" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">پیام</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
            />
          </div>
          <button type="submit" className="w-full rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive">
            ارسال درخواست
          </button>
        </form>
      </div>
    </div>
  );
}

function Info({ k, v, dir }: { k: string; v: string; dir?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="mt-1 text-cocoa" dir={dir}>{v}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
      />
    </div>
  );
}
