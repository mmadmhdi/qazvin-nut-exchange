import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

export type Locale = "fa" | "en" | "ar";

export const LOCALES: { code: Locale; label: string; native: string; dir: "rtl" | "ltr" }[] = [
  { code: "fa", label: "Persian", native: "فارسی", dir: "rtl" },
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
];

export const DEFAULT_LOCALE: Locale = "fa";

type Dict = Record<string, string>;

const fa: Dict = {
  "nav.home": "خانه",
  "nav.market": "بازار پسته",
  "nav.compare": "مقایسه",
  "nav.analysis": "تحلیل بازار",
  "nav.taste": "آیین چشیدن",
  "nav.origin": "اصالت باغ",
  "nav.news": "اخبار خشکبار",
  "nav.journal": "دفتر سبز",
  "nav.products": "محصولات",
  "nav.wholesale": "فروش عمده",
  "nav.licenses": "مجوزها",
  "nav.about": "درباره ما",
  "nav.contact": "تماس",
  "nav.menu": "منو",
  "cta.liveBoard": "تابلوی زنده",
  "cta.liveMarket": "تابلوی زنده بازار",
  "cta.analysis": "تحلیل بازار",
  "cta.allPrices": "همه‌ی قیمت‌ها ←",
  "footer.market": "بازار",
  "footer.company": "شرکت",
  "footer.contact": "تماس",
  "footer.rights": "تمام حقوق برای درج سبز قزوین (درج تجارت لیا) محفوظ است",
  "home.todayBoard": "تابلوی قیمت امروز",
  "home.nutMarket": "بازار خشکبار",
  "home.stat.products": "محصول پایش‌شده",
  "home.stat.generations": "نسل تجربه",
  "home.stat.years": "سال فعالیت",
  "lang.label": "زبان",
  "lang.note": "مقالات دفتر سبز فعلاً فقط به فارسی منتشر می‌شوند.",
};

const en: Dict = {
  "nav.home": "Home",
  "nav.market": "Pistachio Market",
  "nav.compare": "Compare",
  "nav.analysis": "Market Analysis",
  "nav.taste": "Tasting Ritual",
  "nav.origin": "Orchard Origin",
  "nav.news": "Nut News",
  "nav.journal": "Green Journal",
  "nav.products": "Products",
  "nav.wholesale": "Wholesale",
  "nav.licenses": "Licenses",
  "nav.about": "About Us",
  "nav.contact": "Contact",
  "nav.menu": "Menu",
  "cta.liveBoard": "Live Board",
  "cta.liveMarket": "Live Market Board",
  "cta.analysis": "Market Analysis",
  "cta.allPrices": "All prices →",
  "footer.market": "Market",
  "footer.company": "Company",
  "footer.contact": "Contact",
  "footer.rights": "All rights reserved — Darj Sabz Qazvin (Darj Tejarat Lia)",
  "home.todayBoard": "Today's Price Board",
  "home.nutMarket": "Nut Market",
  "home.stat.products": "Tracked products",
  "home.stat.generations": "Generations",
  "home.stat.years": "Years active",
  "lang.label": "Language",
  "lang.note": "Green Journal articles are currently published in Persian only.",
};

const ar: Dict = {
  "nav.home": "الرئيسية",
  "nav.market": "سوق الفستق",
  "nav.compare": "المقارنة",
  "nav.analysis": "تحليل السوق",
  "nav.taste": "طقوس التذوق",
  "nav.origin": "أصل البستان",
  "nav.news": "أخبار المكسرات",
  "nav.journal": "الدفتر الأخضر",
  "nav.products": "المنتجات",
  "nav.wholesale": "البيع بالجملة",
  "nav.licenses": "التراخيص",
  "nav.about": "من نحن",
  "nav.contact": "اتصل بنا",
  "nav.menu": "القائمة",
  "cta.liveBoard": "اللوحة المباشرة",
  "cta.liveMarket": "لوحة السوق المباشرة",
  "cta.analysis": "تحليل السوق",
  "cta.allPrices": "كل الأسعار ←",
  "footer.market": "السوق",
  "footer.company": "الشركة",
  "footer.contact": "اتصل",
  "footer.rights": "جميع الحقوق محفوظة — درج سبز قزوين (درج تجارت ليا)",
  "home.todayBoard": "لوحة أسعار اليوم",
  "home.nutMarket": "سوق المكسرات",
  "home.stat.products": "منتجات مرصودة",
  "home.stat.generations": "أجيال من الخبرة",
  "home.stat.years": "سنوات النشاط",
  "lang.label": "اللغة",
  "lang.note": "مقالات الدفتر الأخضر متوفرة حالياً بالفارسية فقط.",
};

const DICTS: Record<Locale, Dict> = { fa, en, ar };

export function parseLocale(searchStr: string | undefined): Locale {
  if (!searchStr) return DEFAULT_LOCALE;
  const m = /[?&]lang=(fa|en|ar)\b/.exec(searchStr);
  return (m?.[1] as Locale) ?? DEFAULT_LOCALE;
}

export function useLocale(): Locale {
  return useRouterState({
    select: (s) => parseLocale(s.location.searchStr),
  });
}

export function useT() {
  const locale = useLocale();
  const dict = DICTS[locale] ?? fa;
  const t = (key: string) => dict[key] ?? fa[key] ?? key;
  return { t, locale, dir: locale === "en" ? ("ltr" as const) : ("rtl" as const) };
}

/** Keeps <html lang/dir> in sync with the active locale (client-side). */
export function LocaleSync() {
  const { locale, dir } = useT();
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("lang", locale);
    el.setAttribute("dir", dir);
  }, [locale, dir]);
  return null;
}
