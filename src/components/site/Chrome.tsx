import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export function Header() {
  const { settings } = useStore();
  return (
    <header className="hairline-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brass/60 text-brass-dark font-display text-xl">
            ق
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
        <nav className="hidden md:flex items-center gap-7 text-sm text-cocoa">
          <Link to="/" activeOptions={{ exact: true }} className="hover:text-olive-deep [&.active]:text-olive-deep [&.active]:font-semibold">
            خانه
          </Link>
          <Link to="/market" className="hover:text-olive-deep [&.active]:text-olive-deep [&.active]:font-semibold">
            بازار پسته
          </Link>
          <Link to="/products" className="hover:text-olive-deep [&.active]:text-olive-deep [&.active]:font-semibold">
            سایر محصولات
          </Link>
          <Link to="/about" className="hover:text-olive-deep [&.active]:text-olive-deep [&.active]:font-semibold">
            درباره ما
          </Link>
          <Link to="/contact" className="hover:text-olive-deep [&.active]:text-olive-deep [&.active]:font-semibold">
            تماس
          </Link>
        </nav>
        <div className="mr-auto flex items-center gap-3">
          <Link
            to="/market"
            className="hidden sm:inline-flex items-center gap-2 rounded-sm border border-olive-deep/70 bg-olive-deep px-4 py-2 text-xs tracking-widest text-paper hover:bg-olive transition-colors"
          >
            مشاهده بازار امروز
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
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-3">
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
          <div className="font-semibold text-olive-deep mb-2">پیوندها</div>
          <div><Link to="/market" className="hover:text-olive-deep">بازار پسته</Link></div>
          <div><Link to="/products" className="hover:text-olive-deep">سایر محصولات</Link></div>
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
        <span>© {new Intl.DateTimeFormat("fa-IR-u-nu-arabext-ca-persian",{year:"numeric"}).format(new Date())} · تمام حقوق محفوظ است</span>
        <span className="tracking-widest uppercase">Since MCMLXIX</span>
      </div>
    </footer>
  );
}
