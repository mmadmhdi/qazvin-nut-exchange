import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const brandName = locale === "fa" ? settings.brandName : settings.brandLatin;
  return (
    <header className="experience-header sticky top-0 z-40 border-b border-scene-line backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src="/images/dorjesabz-logo.jpg" alt={brandName} className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0"><div className="text-base font-medium text-scene-text sm:text-lg">{brandName}</div><div className="text-[9px] text-scene-muted" dir="ltr">{settings.brandLatin}</div></div>
        </Link>
        <nav className="hidden items-center gap-8 text-xs text-scene-muted lg:flex" aria-label={t("nav.quick")}>
          {NAV.filter(n => ["/market", "/products", "/origin", "/journal"].includes(n.to)).map(n => <Link key={n.to} to={n.to} className="py-2 transition-colors hover:text-signal [&.active]:text-signal">{t(n.key)}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden xl:block"><LangSwitcher className="scene-language" /></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label={t("nav.menu")} className="rounded-none text-scene-text hover:bg-scene-panel hover:text-signal"><Menu className="h-5 w-5" /></Button></DialogTrigger>
            <DialogContent className="max-h-[85svh] max-w-3xl overflow-y-auto border-scene-line bg-scene p-6 text-scene-text sm:p-10">
              <DialogTitle className="mb-5 text-xl font-normal">{brandName}</DialogTitle>
              <nav className="grid gap-x-8 sm:grid-cols-2">
                {NAV.map((n, i) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="flex items-center gap-4 border-b border-scene-line py-4 text-sm hover:text-signal [&.active]:text-signal"><span className="font-mono text-[10px] text-scene-muted">{String(i + 1).padStart(2, "0")}</span>{t(n.key)}</Link>)}
              </nav>
              <LangSwitcher className="scene-language mt-5" />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { settings } = useStore();
  const { t, locale } = useTranslation();
  const brandName = locale === "fa" ? settings.brandName : settings.brandLatin;
  return (
    <footer className="experience-footer border-t border-scene-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <img
            src={"/images/dorjesabz-logo.jpg"}
             alt={locale === "fa" ? "لوگوی درج سبز قزوین" : locale === "ar" ? "شعار درج سبز قزوين" : "Darj Sabz Qazvin logo"}
            className="mb-4 h-16 w-16 rounded-full border border-brass/50 object-cover"
          />
          <div className="font-display text-xl text-olive-deep">{brandName}</div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
            {settings.brandLatin} · {locale === "fa" ? "تأسیس ۱۳۴۸" : locale === "ar" ? "تأسست عام ١٩٦٩" : "Est. 1969"}
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-7 max-w-xs">
            {locale === "fa" ? settings.brandTagline : t("hero.subtitle")}
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
