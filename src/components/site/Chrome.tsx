import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "خانه", exact: true },
  { to: "/market", label: "بازار پسته" },
  { to: "/compare", label: "مقایسه" },
  { to: "/analysis", label: "تحلیل بازار" },
  { to: "/taste", label: "آیین چشیدن" },
  { to: "/origin", label: "اصالت باغ" },
  { to: "/news", label: "اخبار خشکبار" },
  { to: "/products", label: "محصولات" },
  { to: "/wholesale", label: "فروش عمده" },
  { to: "/about", label: "درباره ما" },
  { to: "/contact", label: "تماس" },
];

export function Header() {
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <header className="hairline-b bg-background/85 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-full border border-brass/60 bg-olive-deep text-brass font-display text-base sm:text-lg">
            درج
          </div>
          <div className="min-w-0 leading-tight">
            <div className="font-display text-base sm:text-lg text-olive-deep truncate">
              {settings.brandName}
            </div>
            <div className="hidden sm:block text-[10px] tracking-[0.3em] uppercase text-muted-foreground truncate">
              {settings.brandLatin}
            </div>
          </div>
        </Link>
        <nav className="hidden xl:flex items-center gap-4 text-sm text-cocoa">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={n.exact ? { exact: true } : undefined}
              className="whitespace-nowrap hover:text-olive-deep [&.active]:text-olive-deep [&.active]:font-semibold"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/market"
            className="hidden sm:inline-flex items-center rounded-sm border border-olive-deep/70 bg-olive-deep px-3 sm:px-4 py-2 text-xs tracking-widest text-paper hover:bg-olive transition-colors"
          >
            تابلوی زنده
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="منو"
            className="lg:hidden grid h-9 w-9 place-items-center rounded-sm border border-olive-deep/30 text-olive-deep hover:bg-cream"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="gold-rule" />

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden hairline-b bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-2 gap-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={n.exact ? { exact: true } : undefined}
                className="rounded-sm px-3 py-2 text-cocoa hover:bg-cream [&.active]:bg-olive-deep [&.active]:text-paper"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="hairline-t mt-16 sm:mt-24 bg-cream/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-display text-xl text-olive-deep">{settings.brandName}</div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
            {settings.brandLatin} · Est. ۱۳۴۸
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-7 max-w-xs">
            {settings.brandTagline}
          </p>
        </div>
        <div className="text-sm text-cocoa space-y-2">
          <div className="font-semibold text-olive-deep mb-2">بازار</div>
          <div><Link to="/market" className="hover:text-olive-deep">تابلوی قیمت</Link></div>
          <div><Link to="/analysis" className="hover:text-olive-deep">تحلیل</Link></div>
          <div><Link to="/news" className="hover:text-olive-deep">اخبار</Link></div>
        </div>
        <div className="text-sm text-cocoa space-y-2">
          <div className="font-semibold text-olive-deep mb-2">شرکت</div>
          <div><Link to="/products" className="hover:text-olive-deep">محصولات</Link></div>
          <div><Link to="/wholesale" className="hover:text-olive-deep">فروش عمده</Link></div>
          <div><Link to="/about" className="hover:text-olive-deep">درباره ما</Link></div>
          <div><Link to="/contact" className="hover:text-olive-deep">تماس</Link></div>
          <div><Link to="/admin" className="text-muted-foreground hover:text-olive-deep">پنل مدیریت</Link></div>
        </div>
        <div className="text-sm text-cocoa space-y-2">
          <div className="font-semibold text-olive-deep mb-2">تماس</div>
          <div>{settings.contactPhone}</div>
          <div>{settings.contactAddress}</div>
          <div dir="ltr" className="text-muted-foreground break-all">{settings.contactEmail}</div>
        </div>
      </div>
      <div className="gold-rule" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>© {new Intl.DateTimeFormat("fa-IR-u-nu-arabext-ca-persian",{year:"numeric"}).format(new Date())} · تمام حقوق برای درج سبز قزوین محفوظ است</span>
        <span className="tracking-widest uppercase">Since MCMLXIX</span>
      </div>
    </footer>
  );
}
