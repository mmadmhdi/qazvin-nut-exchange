import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { jalaliYear } from "@/lib/format";
import { useTranslation } from "@/lib/i18n-provider";
import { LangSwitcher } from "@/components/site/LangSwitcher";

const NAV: { to: string; key: string; exact?: boolean }[] = [
  { to: "/", key: "nav.home", exact: true },
  { to: "/market", key: "nav.market" },
  { to: "/compare", key: "nav.compare" },
  { to: "/analysis", key: "nav.analysis" },
  { to: "/taste", key: "nav.taste" },
  { to: "/origin", key: "nav.origin" },
  { to: "/news", key: "nav.news" },
  { to: "/journal", key: "nav.journal" },
  { to: "/products", key: "nav.products" },
  { to: "/wholesale", key: "nav.wholesale" },
  { to: "/licenses", key: "nav.licenses" },
  { to: "/about", key: "nav.about" },
  { to: "/contact", key: "nav.contact" },
];

export function Header() {
  const { settings } = useStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <header className="hairline-b bg-background/92 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 sm:py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-olive-deep/20 bg-paper shadow-sm">
            <img src={"/images/dorjesabz-logo.jpg"} alt="نشان درج سبز قزوین" className="h-full w-full object-cover" />
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
        <nav className="hidden xl:flex items-center gap-5 text-[13px] text-cocoa">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={n.exact ? { exact: true } : undefined}
              className="whitespace-nowrap border-b border-transparent py-2 hover:text-olive-deep [&.active]:border-brass [&.active]:text-olive-deep [&.active]:font-semibold transition-colors"
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <LangSwitcher className="hidden md:flex" />
          <Link
            to="/market"
            className="hidden sm:inline-flex items-center rounded-sm border border-olive-deep/70 bg-olive-deep px-3 sm:px-4 py-2 text-xs tracking-widest text-paper hover:bg-olive transition-colors"
          >
            {t("cta.liveBoard")}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav.menu")}
            className="xl:hidden grid h-9 w-9 place-items-center rounded-sm border border-olive-deep/30 text-olive-deep hover:bg-cream"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="xl:hidden hairline-b bg-background max-h-[70vh] overflow-y-auto">
          <nav className="mx-auto max-w-7xl px-4 py-2 grid gap-0.5 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={n.exact ? { exact: true } : undefined}
                className="rounded-sm border-b border-border/50 px-3 py-3 text-cocoa hover:bg-cream [&.active]:bg-olive-deep [&.active]:text-paper"
              >
                {t(n.key)}
              </Link>
            ))}
          </nav>
          <div className="mx-auto max-w-7xl px-4 pb-4">
            <LangSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { settings } = useStore();
  const { t } = useTranslation();
  return (
    <footer className="hairline-t mt-16 sm:mt-24 bg-cream/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <img
            src={"/images/dorjesabz-logo.jpg"}
            alt="لوگوی درج سبز قزوین"
            className="mb-4 h-16 w-16 rounded-full border border-brass/50 object-cover"
          />
          <div className="font-display text-xl text-olive-deep">{settings.brandName}</div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
            {settings.brandLatin} · Est. ۱۳۴۸
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-7 max-w-xs">
            {settings.brandTagline}
          </p>
        </div>
        <div className="text-sm text-cocoa space-y-2">
          <div className="font-semibold text-olive-deep mb-2">{t("footer.market")}</div>
          <div><Link to="/market" className="hover:text-olive-deep">{t("nav.market")}</Link></div>
          <div><Link to="/analysis" className="hover:text-olive-deep">{t("nav.analysis")}</Link></div>
          <div><Link to="/news" className="hover:text-olive-deep">{t("nav.news")}</Link></div>
          <div><Link to="/taste" className="hover:text-olive-deep">{t("nav.taste")}</Link></div>
          <div><Link to="/origin" className="hover:text-olive-deep">{t("nav.origin")}</Link></div>
        </div>
        <div className="text-sm text-cocoa space-y-2">
          <div className="font-semibold text-olive-deep mb-2">{t("footer.company")}</div>
          <div><Link to="/products" className="hover:text-olive-deep">{t("nav.products")}</Link></div>
          <div><Link to="/wholesale" className="hover:text-olive-deep">{t("nav.wholesale")}</Link></div>
          <div><Link to="/about" className="hover:text-olive-deep">{t("nav.about")}</Link></div>
          <div><Link to="/contact" className="hover:text-olive-deep">{t("nav.contact")}</Link></div>
        </div>
        <div className="text-sm text-cocoa space-y-2">
          <div className="font-semibold text-olive-deep mb-2">{t("footer.contact")}</div>
          <div>{settings.contactPhone}</div>
          <div>{settings.contactAddress}</div>
          <div dir="ltr" className="text-muted-foreground break-all">{settings.contactEmail}</div>
        </div>
      </div>
      <div className="gold-rule" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 flex justify-center"><LangSwitcher /></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span className="num-fa">© {jalaliYear()} · {t("footer.rights")}</span>
        <span className="tracking-widest uppercase">Since MCMLXIX</span>
      </div>
    </footer>
  );
}
