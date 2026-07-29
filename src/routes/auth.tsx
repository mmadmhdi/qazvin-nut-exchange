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
  const [showClaim, setShowClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const routeAfterAuth = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (isAdmin) {
      navigate({ to: "/admin", replace: true });
    } else {
      // Signed in but no admin role — offer the safe first-admin claim,
      // which only succeeds while no admin exists yet.
      setShowClaim(true);
    }
  };

  useEffect(() => {
    routeAfterAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        await routeAfterAuth();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
        if (!signErr) {
          toast.success("حساب ایجاد شد");
          await routeAfterAuth();
        } else {
          toast.success("حساب ایجاد شد. لطفاً ایمیل خود را تایید و سپس وارد شوید.");
          setMode("login");
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const claimFirstAdmin = async () => {
    setClaiming(true);
    setErr(null);
    try {
      const { data, error } = await supabase.rpc("claim_first_admin");
      if (error) throw error;
      if (data === true) {
        toast.success("شما به عنوان مدیر اولیه تعیین شدید");
        navigate({ to: "/admin", replace: true });
      } else {
        setErr("مدیر پیش‌تر تعیین شده است. برای دسترسی از مدیر فعلی بخواهید نقش شما را تعیین کند.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setClaiming(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setShowClaim(false);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16 min-h-[60vh]">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark text-center">پنل مدیریت</div>
      <h1 className="font-display text-3xl text-olive-deep mt-2 text-center">
        {showClaim ? "تعیین مدیر اولیه" : mode === "login" ? "ورود مدیر" : "ثبت‌نام"}
      </h1>
      <div className="gold-rule my-6" />

      {showClaim ? (
        <div className="card-paper rounded-sm p-6 space-y-4">
          <p className="text-sm text-cocoa leading-7">
            شما وارد شده‌اید ولی نقش مدیر ندارید. اگر هنوز هیچ مدیری در سامانه تعیین نشده باشد،
            می‌توانید با کلیک روی دکمه زیر، به‌عنوان مدیر اولیه ثبت شوید. پس از تعیین اولین مدیر،
            این مسیر بسته می‌شود و افزودن مدیران جدید فقط از پنل مدیریت انجام‌پذیر است.
          </p>
          {err && <div className="text-xs text-bear">{err}</div>}
          <button
            onClick={claimFirstAdmin}
            disabled={claiming}
            className="w-full rounded-sm bg-olive-deep px-6 py-3 text-sm tracking-widest text-paper hover:bg-olive disabled:opacity-60"
          >
            {claiming ? "در حال بررسی…" : "تعیین به عنوان مدیر اولیه"}
          </button>
          <button
            onClick={signOut}
            className="w-full rounded-sm border border-border px-6 py-2 text-xs text-muted-foreground hover:bg-cream"
          >
            خروج
          </button>
        </div>
      ) : (
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
                حساب ندارید؟{" "}
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
            ثبت‌نام عمومی هیچ سطح دسترسی مدیریتی به‌همراه ندارد. تعیین نقش مدیر فقط توسط مدیر فعلی، از داخل پنل مدیریت انجام می‌شود.
          </p>
        </form>
      )}
    </div>
  );
}

