export type ArticleCategoryId =
  | "market"
  | "orchard"
  | "process"
  | "trade"
  | "taste"
  | "health"
  | "heritage";

export type Article = {
  slug: string;
  title: string;
  dek: string;
  category: ArticleCategoryId;
  date: string; // ISO gregorian YYYY-MM-DD
  minutes: number;
  tags: string[];
  body: string[];
};

export const CATEGORIES: { id: ArticleCategoryId; label: string; latin: string; desc: string }[] = [
  {
    id: "market",
    label: "بازار و قیمت",
    latin: "Market",
    desc: "سازوکار قیمت‌گذاری، فصل‌های بازار، نرخ ارز و خواندن نمودار.",
  },
  {
    id: "orchard",
    label: "باغ و کشاورزی",
    latin: "Orchard",
    desc: "خاک، آب، اقلیم، ارقام و مدیریت باغ‌های پسته و بادام.",
  },
  {
    id: "process",
    label: "فرآوری و کیفیت",
    latin: "Process",
    desc: "خلال‌زنی، پرک، رطوبت، رنگ، آفلاتوکسین و کنترل کیفیت.",
  },
  {
    id: "trade",
    label: "تجارت و صادرات",
    latin: "Trade",
    desc: "اینکوترمز، بسته‌بندی صادراتی، اسناد، بازارهای هدف و لجستیک.",
  },
  {
    id: "taste",
    label: "آیین چشیدن",
    latin: "Taste",
    desc: "طعم، بافت، ترکیب با قهوه و شیرینی، و کاربرد در قنادی.",
  },
  {
    id: "health",
    label: "سلامت و تغذیه",
    latin: "Health",
    desc: "ارزش غذایی، چربی مفید، پروتئین و مصرف متعادل.",
  },
  {
    id: "heritage",
    label: "میراث و برند",
    latin: "Heritage",
    desc: "تاریخ خشکبار قزوین، اعتماد، اصالت و روایت برند درج سبز.",
  },
];

export function categoryLabel(id: ArticleCategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "";
}
