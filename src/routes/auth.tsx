import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود مدیر — درج سبز قزوین" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("ایمیل و کلمه عبور الزامی است.");
      return;
    }
    if (password.length < 8) {
      setErr("کلمه عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("خوش آمدید");
        navigate({ to: "/admin", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("حساب ایجاد شد. اگر تاییدیه ایمیل فعال باشد، لینک تایید ارسال می‌شود.");
        // try immediate login
        const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
        if (!signErr) navigate({ to: "/admin", replace: true });
        else setMode("login");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16 min-h-[60vh]">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark text-center">پنل مدیریت</div>
      <h1 className="font-display text-3xl text-olive-deep mt-2 text-center">
        {mode === "login" ? "ورود مدیر" : "ثبت‌نام مدیر"}
      </h1>
      <div className="gold-rule my-6" />

      <form onSubmit={onSubmit} className="card-paper rounded-sm p-6 space-y-4">
        <div>
          <label className="text-xs tracking-widest uppercase text-muted-foreground">ایمیل</label>
          <input
            dir="ltr"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:border-olive-deep outline-none"
          />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-muted-foreground">کلمه عبور</label>
          <input
            dir="ltr"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:border-olive-deep outline-none"
          />
        </div>
        {err && <div className="text-xs text-bear">{err}</div>}
        <button
          disabled={busy}
          className="w-full rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive disabled:opacity-60"
        >
          {busy ? "در حال ارسال…" : mode === "login" ? "ورود" : "ثبت‌نام"}
        </button>
        <div className="text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              حساب مدیریتی ندارید؟{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-olive-deep hover:underline">
                ایجاد حساب
              </button>
            </>
          ) : (
            <>
              حساب دارید؟{" "}
              <button type="button" onClick={() => setMode("login")} className="text-olive-deep hover:underline">
                ورود
              </button>
            </>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-6 pt-2 border-t border-border/60">
          نکته: نخستین کاربری که در این سامانه ثبت‌نام کند به‌طور خودکار به‌عنوان مدیر تعیین می‌شود. سایر ثبت‌نام‌ها بدون نقش خواهند بود مگر توسط مدیر ارتقا داده شوند.
        </p>
      </form>
    </div>
  );
}
