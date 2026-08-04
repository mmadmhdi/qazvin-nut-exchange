import type { Article } from "./articles-types";
import {

  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PricePoint = {
  date: string;
  price: number; // = close
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

export type Passport = {
  batch: string;
  harvestYear: string;
  region: string;
  altitude: string;
  soil: string;
  process: string;
  size: string;
  notes: string;
  units: string;
  certificates: string;
};

export type Product = {
  passport?: Passport;
  id: string;
  slug: string;
  name: string;
  category: "پسته" | "بادام درختی" | "بادام زمینی" | "سایر";
  price: number;
  unit: string;
  origin: string;
  grade: string;
  description: string;
  priority: number;
  active: boolean;
  featured: boolean;
  updatedAt: string;
  history: PricePoint[];
};

export type SiteSettings = {
  brandName: string;
  brandLatin: string;
  brandTagline: string;
  currency: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  contactPhone: string;
  contactAddress: string;
  contactEmail: string;
  contactWhatsapp?: string;
  instagram?: string;
  telegram?: string;
  workingHours?: string;
  foundedYear?: string;
  missionText?: string;
  exportText?: string;
  seoTitle?: string;
  seoDescription?: string;
  announcement?: string;

};

const DAY = 86400000;

// Deterministic OHLC walk seeded per product. Base prices are calibrated
// to observed 2026 wholesale market ranges (rial/kg) reported by
// stdt.ir, sepidyas, aghayepeste and similar Iranian nut market trackers.
function seedHistory(basePrice: number, seed: number, days = 180): PricePoint[] {
  const out: PricePoint[] = [];
  let close = basePrice * 0.88;
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const drift = (rnd() - 0.48) * 0.028;
    const open = close;
    const target = basePrice * (1 + Math.sin(i / 22) * 0.05);
    close = open * (1 + drift) + (target - open) * 0.06;
    const wick = Math.max(basePrice, close) * (0.006 + rnd() * 0.018);
    const high = Math.max(open, close) + wick * rnd();
    const low = Math.min(open, close) - wick * rnd();
    const round = (v: number) => Math.round(v / 1000) * 1000;
    const volume = Math.round(120 + rnd() * 380 + Math.abs(drift) * 4000);
    const date = new Date(now - i * DAY).toISOString().slice(0, 10);
    out.push({
      date,
      price: round(close),
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume,
    });
  }
  // pin last close to listed price
  const last = out[out.length - 1];
  last.close = basePrice;
  last.price = basePrice;
  last.high = Math.max(last.high ?? basePrice, basePrice);
  last.low = Math.min(last.low ?? basePrice, basePrice);
  return out;
}

const today = new Date().toISOString().slice(0, 10);

// Realistic base prices (rial/kg wholesale) — 2026 market snapshot.
// Sources cross-checked: stdt.ir daily pistachio index (~1.08M toman/kg
// raw fandoghi), sepidyas wholesale, aghayepeste retail band.
const SEED_PRODUCTS: Product[] = [
  {
    id: "khelal-peste-qazvin",
    slug: "khelal-peste-qazvin",
    name: "خلال پسته قزوین",
    category: "پسته",
    price: 58_500_000,
    unit: "ریال / کیلوگرم",
    origin: "قزوین",
    grade: "ممتاز",
    description:
      "خلال پسته قزوین با رنگ سبز طبیعی، عطر ملایم و برش یکنواخت؛ برگزیده باغ‌های اصیل قزوین.",
    priority: 100,
    active: true,
    featured: true,
    updatedAt: today,
    history: seedHistory(58_500_000, 7),
  },
  {
    id: "khelal-peste-boein",
    slug: "khelal-peste-boein",
    name: "خلال پسته بویین‌زهرا",
    category: "پسته",
    price: 53_200_000,
    unit: "ریال / کیلوگرم",
    origin: "بویین‌زهرا",
    grade: "درجه یک",
    description:
      "خلال پسته بویین با مغز پرمایه و رنگ زیتونی روشن؛ انتخابی متعادل برای قنادی و صنایع.",
    priority: 90,
    active: true,
    featured: true,
    updatedAt: today,
    history: seedHistory(53_200_000, 11),
  },
  {
    id: "peste-akbari",
    slug: "peste-akbari",
    name: "پسته اکبری",
    category: "پسته",
    price: 12_500_000,
    unit: "ریال / کیلوگرم",
    origin: "رفسنجان",
    grade: "درشت",
    description: "پسته اکبری با دانه‌های بلند و مغز پر؛ نماد کیفیت صادراتی ایران.",
    priority: 80,
    active: true,
    featured: false,
    updatedAt: today,
    history: seedHistory(12_500_000, 13),
  },
  {
    id: "peste-fandoghi",
    slug: "peste-fandoghi",
    name: "پسته فندقی",
    category: "پسته",
    price: 10_890_000,
    unit: "ریال / کیلوگرم",
    origin: "کرمان",
    grade: "درجه یک",
    description: "پسته فندقی گرد و ترد؛ پرمصرف‌ترین رقم بازار داخلی و مبنای شاخص قیمت.",
    priority: 75,
    active: true,
    featured: false,
    updatedAt: today,
    history: seedHistory(10_890_000, 19),
  },
  {
    id: "khelal-badam-derakhti",
    slug: "khelal-badam-derakhti",
    name: "خلال بادام درختی",
    category: "بادام درختی",
    price: 21_400_000,
    unit: "ریال / کیلوگرم",
    origin: "سامان",
    grade: "درجه یک",
    description: "خلال بادام درختی سفید و یکدست، مناسب شیرینی‌پزی سنتی و مدرن.",
    priority: 60,
    active: true,
    featured: false,
    updatedAt: today,
    history: seedHistory(21_400_000, 3),
  },
  {
    id: "perak-badam-derakhti",
    slug: "perak-badam-derakhti",
    name: "پرک بادام درختی",
    category: "بادام درختی",
    price: 21_000_000,
    unit: "ریال / کیلوگرم",
    origin: "سامان",
    grade: "درجه یک",
    description: "پرک بادام درختی با ضخامت یکنواخت؛ بافتی ترد و طعمی اصیل.",
    priority: 55,
    active: true,
    featured: false,
    updatedAt: today,
    history: seedHistory(21_000_000, 17),
  },
  {
    id: "khelal-badam-zamini-doroshte",
    slug: "khelal-badam-zamini-doroshte",
    name: "خلال بادام زمینی درشت",
    category: "بادام زمینی",
    price: 5_600_000,
    unit: "ریال / کیلوگرم",
    origin: "کردستان",
    grade: "درشت",
    description: "خلال بادام زمینی درشت، تفت‌داده متعادل؛ مناسب آجیل و تزیین.",
    priority: 40,
    active: true,
    featured: false,
    updatedAt: today,
    history: seedHistory(5_600_000, 23),
  },
  {
    id: "perak-badam-zamini",
    slug: "perak-badam-zamini",
    name: "پرک بادام زمینی",
    category: "بادام زمینی",
    price: 5_500_000,
    unit: "ریال / کیلوگرم",
    origin: "کردستان",
    grade: "درجه یک",
    description: "پرک بادام زمینی با برش نازک و طعم ملایم؛ کاربرد گسترده در صنایع.",
    priority: 35,
    active: true,
    featured: false,
    updatedAt: today,
    history: seedHistory(5_500_000, 29),
  },
  {
    id: "magz-peste",
    slug: "magz-peste",
    name: "مغز پسته سبز",
    category: "پسته",
    price: 42_000_000,
    unit: "ریال / کیلوگرم",
    origin: "قزوین",
    grade: "ممتاز",
    description: "مغز پسته سبز پوست‌کنده، رنگ ثابت و مغز کامل؛ کاربرد لوکس در قنادی.",
    priority: 70,
    active: true,
    featured: false,
    updatedAt: today,
    history: seedHistory(42_000_000, 31),
  },
];

const SEED_SETTINGS: SiteSettings = {
  brandName: "درج سبز قزوین",
  brandLatin: "DorjeSabz · Qazvin",
  brandTagline: "درج سبز؛ مرجع قیمت خلال پسته و بادام قزوین",
  currency: "ریال",
  heroTitle: "بازار خلال پسته، اصیل و شفاف",
  heroSubtitle:
    "درج سبز قزوین، تابلوی رسمی قیمت خلال پسته قزوین و بویین را با نمودارهای حرفه‌ای و تاریخچه‌ی دقیق در اختیار تجار، قنادان و صنایع قرار می‌دهد.",
  aboutText:
    "درج سبز، نام تجاری شرکت «درج تجارت لیا» است؛ واحد تولیدی خلال مغز پسته و بادام در شهرک صنعتی لیای قزوین، دارای پروانه‌های بهداشتی ساخت از معاونت غذا و داروی دانشگاه علوم پزشکی قزوین. مأموریت ما حفظ اصالت طعم و صداقت در قیمت است: ما اعتماد شما را به سرمایه‌ی خود ترجیح می‌دهیم.",
  contactPhone: "۰۲۸-۳۳۴۵۵۰۱۰",
  contactAddress:
    "استان قزوین، شهرک صنعتی لیا، خیابان کاوشگران، نبش خیابان خلاقیت — شرکت درج تجارت لیا",
  contactEmail: "mmd85mmd@gmail.com",
  contactWhatsapp: "",
  instagram: "dorjesabz",
  telegram: "dorjesabz",
  workingHours: "شنبه تا پنجشنبه، ۹ تا ۱۸",
  foundedYear: "۱۳۴۸",
  missionText:
    "ما به اعتماد شما بیش از سود خود اهمیت می‌دهیم؛ قیمت شفاف، کیفیت آزمایش‌شده و تعهد به تحویل در موعد.",
  exportText:
    "بسته‌بندی صادراتی ۱۰ و ۲۵ کیلوگرمی با گواهی بهداشت و آزمون آفلاتوکسین، آماده تحویل FOB/CFR.",
  seoTitle: "درج سبز قزوین — مرجع قیمت خلال پسته و خشکبار",
  seoDescription:
    "تابلوی قیمت روز خلال پسته قزوین، نمودار تحلیلی حرفه‌ای، فروش عمده و صادرات خشکبار با کیفیت ممتاز.",
  announcement: "قیمت‌های امروز بر مبنای معاملات بازار قزوین به‌روزرسانی شد.",

};

const LS_KEY = "darj-sabz:v3";


type State = {
  products: Product[];
  settings: SiteSettings;
  articles: Article[];
};

type StoreCtx = State & {
  ready: boolean;
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addPricePoint: (id: string, point: PricePoint) => void;
  removePricePoint: (id: string, date: string) => void;
  bulkPricePoints: (id: string, points: PricePoint[]) => void;
  updateSettings: (s: Partial<SiteSettings>) => void;
  saveArticle: (a: Article) => void;
  deleteArticle: (slug: string) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetAll: () => void;
};

const StoreContext = createContext<StoreCtx | null>(null);

function slugify(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .toLowerCase();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    products: SEED_PRODUCTS,
    settings: SEED_SETTINGS,
    articles: [],
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        if (parsed?.products && parsed?.settings)
          setState({
            products: parsed.products,
            settings: { ...SEED_SETTINGS, ...parsed.settings },
            articles: parsed.articles ?? [],
          });
      }
    } catch {}

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const value: StoreCtx = useMemo(
    () => ({
      ...state,
      ready,
      saveProduct(p) {
        setState((s) => {
          const exists = s.products.some((x) => x.id === p.id);
          const next = exists
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, { ...p, slug: p.slug || slugify(p.name) || p.id }];
          return { ...s, products: next };
        });
      },
      deleteProduct(id) {
        setState((s) => ({ ...s, products: s.products.filter((x) => x.id !== id) }));
      },
      addPricePoint(id, point) {
        setState((s) => ({
          ...s,
          products: s.products.map((x) =>
            x.id === id
              ? {
                  ...x,
                  price: point.price,
                  updatedAt: point.date,
                  history: [...x.history.filter((h) => h.date !== point.date), point].sort(
                    (a, b) => a.date.localeCompare(b.date),
                  ),
                }
              : x,
          ),
        }));
      },
      removePricePoint(id, date) {
        setState((s) => ({
          ...s,
          products: s.products.map((x) =>
            x.id === id ? { ...x, history: x.history.filter((h) => h.date !== date) } : x,
          ),
        }));
      },
      bulkPricePoints(id, points) {
        setState((s) => ({
          ...s,
          products: s.products.map((x) => {
            if (x.id !== id) return x;
            const dates = new Set(points.map((p) => p.date));
            const history = [...x.history.filter((h) => !dates.has(h.date)), ...points].sort(
              (a, b) => a.date.localeCompare(b.date),
            );
            const last = history[history.length - 1];
            return { ...x, history, price: last?.price ?? x.price, updatedAt: last?.date ?? x.updatedAt };
          }),
        }));
      },
      updateSettings(s) {
        setState((prev) => ({ ...prev, settings: { ...prev.settings, ...s } }));
      },
      saveArticle(a) {
        setState((s) => {
          const exists = s.articles.some((x) => x.slug === a.slug);
          return {
            ...s,
            articles: exists ? s.articles.map((x) => (x.slug === a.slug ? a : x)) : [a, ...s.articles],
          };
        });
      },
      deleteArticle(slug) {
        setState((s) => ({ ...s, articles: s.articles.filter((x) => x.slug !== slug) }));
      },
      exportData() {
        return JSON.stringify(state, null, 2);
      },
      importData(json) {
        try {
          const parsed = JSON.parse(json) as Partial<State>;
          if (!parsed?.products || !parsed?.settings) return false;
          setState({
            products: parsed.products,
            settings: { ...SEED_SETTINGS, ...parsed.settings },
            articles: parsed.articles ?? [],
          });
          return true;
        } catch {
          return false;
        }
      },
      resetAll() {
        setState({ products: SEED_PRODUCTS, settings: SEED_SETTINGS, articles: [] });
      },

    }),
    [state, ready],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useProductBySlug(slug: string): Product | undefined {
  const { products } = useStore();
  return products.find((p) => p.slug === slug || p.id === slug);
}

export function computeChange(history: PricePoint[]): { pct: number; abs: number } {
  if (history.length < 2) return { pct: 0, abs: 0 };
  const last = history[history.length - 1].price;
  const prev = history[history.length - 2].price;
  return { pct: ((last - prev) / prev) * 100, abs: last - prev };
}

export { SEED_PRODUCTS, SEED_SETTINGS, slugify };
