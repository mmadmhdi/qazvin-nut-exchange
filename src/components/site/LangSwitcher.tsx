import { Globe } from "lucide-react";
import { LOCALES } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n-provider";

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={t("lang.label")}>
      <Globe className="h-3.5 w-3.5 text-brass-dark" aria-hidden />
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          lang={l.code}
          className={`rounded-sm px-1.5 py-1 text-[11px] tracking-wide transition-colors ${
            locale === l.code
              ? "bg-olive-deep text-paper"
              : "text-cocoa hover:bg-cream hover:text-olive-deep"
          }`}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}
