import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

const NAV: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "خانه", exact: true },
  { to: "/market", label: "بازار پسته" },
  { to: "/analysis", label: "تحلیل بازار" },
  { to: "/news", label: "اخبار خشکبار" },
  { to: "/products", label: "محصولات" },
  { to: "/wholesale", label: "فروش عمده" },
  { to: "/about", label: "درباره ما" },
  { to: "/contact", label: "تماس" },
];

export function Header() {
  const { settings } = useStore();
  return (
    <header className="hairline-b bg-background/85 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brass/60 bg-olive-deep text-brass font-display text-lg">
            درج
          </div>
          <div className="min-w-0 leading-tight">
            <div className="font-display text-lg text-olive-deep truncate">
              {settings.brandName}
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {settings.brandLatin}
            </div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm text-cocoa">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={n.exact ? { exact: true } : undefined}
              className="hover:text-olive-deep [&.active]:text-olive-deep [&.active]:font-semibold"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mr-auto flex items-center gap-3">
          <Link
            to="/market"
            className="hidden sm:inline-flex items-center gap-2 rounded-sm border border-olive-deep/70 bg-olive-deep px-4 py-2 text-xs tracking-widest text-paper hover:bg-olive transition-colors"
          >
            تابلوی زنده
          </Link>
        </div>
      </div>
      <div className="gold-rule" />
    </header>
  );
}

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="hairline-t mt-24 bg-cream/50">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-4">
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
          <div dir="ltr" className="text-muted-foreground">{settings.contactEmail}</div>
        </div>
      </div>
      <div className="gold-rule" />
      <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-muted-foreground flex justify-between">
        <span>© {new Intl.DateTimeFormat("fa-IR-u-nu-arabext-ca-persian",{year:"numeric"}).format(new Date())} · تمام حقوق برای درج سبز قزوین محفوظ است</span>
        <span className="tracking-widest uppercase">Since MCMLXIX</span>
      </div>
    </footer>
  );
}
