import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { DEFAULT_LOCALE, parseLocale, useT, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "dorjesabz.locale";

const Ctx = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const urlLocale = useRouterState({ select: (s) => parseLocale(s.location.searchStr) });
  const hasParam = useRouterState({ select: (s) => /[?&]lang=(fa|en|ar)\b/.test(s.location.searchStr ?? "") });
  // SSR-safe: the ?lang= param is visible on the server too, so the initial
  // render already matches the requested locale (crawlers see translated HTML).
  const [locale, setLocaleState] = useState<Locale>(hasParam ? urlLocale : DEFAULT_LOCALE);
  if (typeof window === "undefined") console.log("SSR-LOCALE", hasParam, urlLocale, locale);

  useEffect(() => {
    if (hasParam) {
      setLocaleState(urlLocale);
      try {
        window.localStorage.setItem(STORAGE_KEY, urlLocale);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "fa" || stored === "en" || stored === "ar") setLocaleState(stored);
    } catch {
      /* ignore */
    }
  }, [hasParam, urlLocale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("lang", locale);
    el.setAttribute("dir", locale === "en" ? "ltr" : "rtl");
  }, [locale]);

  return <Ctx.Provider value={{ locale, setLocale }}>{children}</Ctx.Provider>;
}

export function useLocaleContext() {
  return useContext(Ctx);
}

export function useTranslation() {
  const { locale, setLocale } = useLocaleContext();
  const { t, dir } = useT(locale);
  return { t, dir, locale, setLocale };
}
