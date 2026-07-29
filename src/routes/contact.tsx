import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس — درج سبز قزوین" },
      { name: "description", content: "برای استعلام قیمت و سفارش، با ما در تماس باشید." },
      { property: "og:title", content: "تماس با درج سبز قزوین" },
      { property: "og:description", content: "استعلام قیمت روز خلال پسته و خشکبار." },
    ],
  }),
  component: Contact,
});

type FormState = { name: string; phone: string; email: string; message: string };

function Contact() {
  const { settings } = useStore();
  const [form, setForm] = useState<FormState>({ name: "", phone: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const validate = (): string | null => {
    const name = form.name.trim();
    const message = form.message.trim();
    if (name.length < 2) return "نام معتبر وارد کنید.";
    if (message.length < 3) return "متن پیام کوتاه است.";
    if (message.length > 4000) return "متن پیام طولانی است.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "ایمیل معتبر نیست.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErr(v);
    if (v) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        message: form.message.trim(),
      });
      if (error) throw error;
      toast.success("پیام شما با موفقیت ثبت شد");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toast.error("ثبت پیام ناموفق بود");
    } finally {
      setBusy(false);
    }
  };

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
        <form onSubmit={onSubmit} className="card-paper rounded-sm p-6 space-y-4">
          <Field label="نام و نام خانوادگی" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="شماره تماس" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} dir="ltr" />
          <Field label="ایمیل (اختیاری)" value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" />
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">پیام</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              maxLength={4000}
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
            />
          </div>
          {err && <div className="text-xs text-bear">{err}</div>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive disabled:opacity-60"
          >
            {busy ? "در حال ارسال…" : "ارسال درخواست"}
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

function Field({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir?: string }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-olive-deep"
      />
    </div>
  );
}
