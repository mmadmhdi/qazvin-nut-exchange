import { Link } from "@tanstack/react-router";
import { Home, LineChart, Boxes, BookOpen, Phone } from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";

const TABS: { to: string; key: string; icon: React.ReactNode; exact?: boolean }[] = [
  { to: "/", key: "nav.home", icon: <Home className="h-[18px] w-[18px]" />, exact: true },
  { to: "/market", key: "nav.market", icon: <LineChart className="h-[18px] w-[18px]" /> },
  { to: "/products", key: "nav.products", icon: <Boxes className="h-[18px] w-[18px]" /> },
  { to: "/journal", key: "nav.journal", icon: <BookOpen className="h-[18px] w-[18px]" /> },
  { to: "/contact", key: "nav.contact", icon: <Phone className="h-[18px] w-[18px]" /> },
];

/** Thumb-reachable bottom navigation for phones and small tablets. */
export function MobileNav() {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("nav.menu")}
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-olive-deep/15 bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={tab.exact ? { exact: true } : undefined}
            className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground transition-colors [&.active]:text-olive-deep"
          >
            {tab.icon}
            <span className="truncate px-0.5">{t(tab.key)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
