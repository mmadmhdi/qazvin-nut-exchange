import type { Locale } from "@/lib/i18n";
import type { WholesaleTier, WholesaleBenefit } from "@/lib/store";

const TIERS: Record<Locale, WholesaleTier[]> = {
  fa: [
    { name: "قنادی و بوتیک", min: 20, discount: 0, note: "قیمت تابلو، ارسال از انبار قزوین" },
    { name: "صنایع غذایی", min: 100, discount: 4, note: "تخفیف پلکانی، بسته‌بندی درخواستی" },
    { name: "صادرات و پروژه", min: 500, discount: 8, note: "قرارداد سالانه، ثبت سفارش صادراتی" },
  ],
  en: [
    { name: "Patisserie & boutique", min: 20, discount: 0, note: "Board price, shipped from our Qazvin warehouse" },
    { name: "Food industry", min: 100, discount: 4, note: "Tiered discount, packaging to order" },
    { name: "Export & projects", min: 500, discount: 8, note: "Annual contract, export order handling" },
  ],
  ar: [
    { name: "الحلويات والمتاجر", min: 20, discount: 0, note: "سعر اللوحة، الشحن من مستودع قزوين" },
    { name: "الصناعات الغذائية", min: 100, discount: 4, note: "خصم تدريجي وتعبئة حسب الطلب" },
    { name: "التصدير والمشاريع", min: 500, discount: 8, note: "عقد سنوي وتسجيل طلب تصديري" },
  ],
};

const BENEFITS: Record<Locale, WholesaleBenefit[]> = {
  fa: [
    { text: "مبدأ باغ‌های اصیل قزوین و بویین‌زهرا" },
    { text: "کنترل کیفیت سه‌مرحله‌ای رنگ، رطوبت و اندازه" },
    { text: "بسته‌بندی خلأ (Vacuum) و کارتن صادراتی" },
    { text: "امکان درج برند شخصی (Private Label)" },
    { text: "گواهی بهداشت و آنالیز آزمایشگاهی همراه محموله" },
    { text: "قرارداد قیمت تضمینی سه ماهه برای مشتریان دائم" },
  ],
  en: [
    { text: "Sourced from the orchards of Qazvin and Buin Zahra" },
    { text: "Three-stage quality control of colour, moisture and size" },
    { text: "Vacuum packing and export cartons" },
    { text: "Private-label printing available" },
    { text: "Health permit and laboratory analysis with every consignment" },
    { text: "Three-month fixed-price contracts for regular customers" },
  ],
  ar: [
    { text: "المصدر بساتين قزوين وبوئين زهرا الأصيلة" },
    { text: "ضبط جودة ثلاثي المراحل للون والرطوبة والحجم" },
    { text: "تعبئة بالتفريغ الهوائي وكرتون تصديري" },
    { text: "إمكانية طبع العلامة الخاصة" },
    { text: "شهادة صحية وتحليل مختبري مع كل شحنة" },
    { text: "عقد سعر مضمون لثلاثة أشهر للعملاء الدائمين" },
  ],
};

export const defaultTiers = (l: Locale) => TIERS[l] ?? TIERS.fa;
export const defaultBenefits = (l: Locale) => BENEFITS[l] ?? BENEFITS.fa;
