import { Globe } from "lucide-react";
import { LOCALES } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n-provider";
import { Button } from "@/components/ui/button";

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  const scene = className.includes("scene-language");
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={t("lang.label")}>
      <Globe className={`h-3.5 w-3.5 ${scene ? "text-scene-muted" : "text-brass-dark"}`} aria-hidden />
      {LOCALES.map((l) => (
        <Button
          variant="ghost"
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          lang={l.code}
          className={`h-8 rounded-none px-1.5 py-1 text-[11px] transition-colors ${
            scene ? (locale === l.code ? "text-signal hover:bg-scene-panel hover:text-signal" : "text-scene-muted hover:bg-scene-panel hover:text-scene-text") : locale === l.code
              ? "bg-olive-deep text-paper"
              : "text-cocoa hover:bg-cream hover:text-olive-deep"
          }`}
        >
          {l.native}
        </Button>
      ))}
    </div>
  );
}
