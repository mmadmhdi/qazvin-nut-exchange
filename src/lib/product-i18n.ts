import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/site-types";

type Pair = { en: string; ar: string };

export const CATEGORY_I18N: Record<string, Pair> = {
  "پسته": { en: "Pistachio", ar: "الفستق" },
  "بادام درختی": { en: "Almond", ar: "اللوز" },
  "بادام زمینی": { en: "Peanut", ar: "الفول السوداني" },
  "سایر": { en: "Other", ar: "أخرى" },
};

const GRADE_I18N: Record<string, Pair> = {
  "ممتاز": { en: "Premium", ar: "ممتاز" },
  "درجه یک": { en: "Grade A", ar: "الدرجة الأولى" },
  "درشت": { en: "Large", ar: "حجم كبير" },
};

const ORIGIN_I18N: Record<string, Pair> = {
  "قزوین": { en: "Qazvin", ar: "قزوين" },
  "قزوین — لیا": { en: "Qazvin — Lia", ar: "قزوين — ليا" },
  "بویین‌زهرا": { en: "Buin Zahra", ar: "بوئين زهرا" },
  "سامان": { en: "Saman", ar: "سامان" },
  "کردستان": { en: "Kurdistan", ar: "كردستان" },
  "رفسنجان": { en: "Rafsanjan", ar: "رفسنجان" },
  "کرمان": { en: "Kerman", ar: "كرمان" },
};

const UNIT_I18N: Record<string, Pair> = {
  "ریال / کیلوگرم": { en: "IRR / kg", ar: "ريال / كغم" },
};

const PRODUCT_I18N: Record<string, { name: Pair; description: Pair }> = {
  "khelal-peste-qazvin": {
    name: { en: "Qazvin Pistachio Slivers", ar: "شرائح الفستق القزويني" },
    description: {
      en: "Qazvin pistachio slivers with a natural green colour, delicate aroma and an even cut — selected from authentic Qazvin orchards.",
      ar: "شرائح الفستق القزويني بلون أخضر طبيعي ورائحة رقيقة وقطع متساوٍ، منتقاة من بساتين قزوين الأصيلة.",
    },
  },
  "khelal-badam-derakhti": {
    name: { en: "Almond Slivers", ar: "شرائح اللوز" },
    description: {
      en: "Uniform white almond slivers, ideal for both traditional and modern pastry work.",
      ar: "شرائح لوز بيضاء متجانسة، مناسبة للحلويات التقليدية والحديثة.",
    },
  },
  "khelal-peste-boein": {
    name: { en: "Buin Zahra Pistachio Slivers", ar: "شرائح فستق بوئين زهرا" },
    description: {
      en: "Buin Zahra pistachio slivers with a full kernel and light olive tone — a balanced choice for confectionery and food industry.",
      ar: "شرائح فستق بوئين زهرا بلب ممتلئ ولون زيتوني فاتح، خيار متوازن للحلويات والصناعات الغذائية.",
    },
  },
  "khelal-badam-zamini-doroshte": {
    name: { en: "Large Peanut Slivers", ar: "شرائح الفول السوداني الكبيرة" },
    description: {
      en: "Large peanut slivers, evenly roasted — suited to nut mixes and decoration.",
      ar: "شرائح فول سوداني كبيرة محمّصة باعتدال، مناسبة لخلطات المكسرات والتزيين.",
    },
  },
  "peste-akbari": {
    name: { en: "Akbari Pistachio", ar: "فستق أكبري" },
    description: {
      en: "Akbari pistachio with long nuts and full kernels — the benchmark of Iranian export quality.",
      ar: "فستق أكبري بحبّات طويلة ولب ممتلئ، رمز جودة التصدير الإيرانية.",
    },
  },
  "peste-fandoghi": {
    name: { en: "Fandoghi Pistachio", ar: "فستق فندقي" },
    description: {
      en: "Round, crisp Fandoghi pistachio — the most traded variety on the domestic market and the base of the price index.",
      ar: "فستق فندقي مستدير ومقرمش، الصنف الأكثر تداولاً محلياً وأساس مؤشر الأسعار.",
    },
  },
  "perak-badam-derakhti": {
    name: { en: "Almond Flakes", ar: "رقائق اللوز" },
    description: {
      en: "Almond flakes of even thickness, with a crisp texture and authentic taste.",
      ar: "رقائق لوز بسماكة متساوية وقوام مقرمش وطعم أصيل.",
    },
  },
  "perak-badam-zamini": {
    name: { en: "Peanut Flakes", ar: "رقائق الفول السوداني" },
    description: {
      en: "Thinly cut peanut flakes with a mild taste and broad industrial use.",
      ar: "رقائق فول سوداني رقيقة القطع بطعم معتدل واستخدام صناعي واسع.",
    },
  },
  "dandane-peste": {
    name: { en: "Pistachio Granulate", ar: "حبيبات الفستق" },
    description: {
      en: "Graded pistachio kernel granulate for chocolate and ice-cream manufacturing.",
      ar: "حبيبات لب الفستق المدرّجة لصناعة الشوكولاتة والمثلجات.",
    },
  },
  "pudr-peste": {
    name: { en: "Pistachio Powder", ar: "مسحوق الفستق" },
    description: {
      en: "Pure pistachio powder for pastry and desserts, with no additives.",
      ar: "مسحوق فستق خالص للحلويات والتحلية، بدون إضافات.",
    },
  },
  "magz-peste": {
    name: { en: "Green Pistachio Kernels", ar: "لب الفستق الأخضر" },
    description: {
      en: "Peeled green pistachio kernels with stable colour and whole kernels — a luxury ingredient for confectionery.",
      ar: "لب فستق أخضر مقشّر بلون ثابت وحبّات كاملة، مكوّن فاخر للحلويات.",
    },
  },
  "javane-peste": {
    name: { en: "Pistachio Germ", ar: "جنين الفستق" },
    description: {
      en: "Pistachio germ obtained from fresh kernel processing — suited to chocolate and ice-cream industries.",
      ar: "جنين الفستق الناتج عن معالجة اللب الطازج، مناسب لصناعات الشوكولاتة والمثلجات.",
    },
  },
  "khake-peste": {
    name: { en: "Pistachio Fines", ar: "نثارة الفستق" },
    description: {
      en: "Pistachio fines from the slivering process — an economical option for food manufacturers.",
      ar: "نثارة الفستق الناتجة عن عملية التشريح، خيار اقتصادي للصناعات الغذائية.",
    },
  },
  "magz-badam-sefid": {
    name: { en: "Blanched Almond Kernels", ar: "لب اللوز المقشّر" },
    description: {
      en: "Blanched (peeled) almond kernels of export quality.",
      ar: "لب لوز مقشّر (مبيّض) بجودة تصديرية.",
    },
  },
  "lape-magz-zard": {
    name: { en: "Yellow Split Kernels", ar: "فلقة اللب الأصفر" },
    description: {
      en: "Yellow split kernels for confectionery and food industry use.",
      ar: "فلقة اللب الأصفر لاستخدامات الحلويات والصناعات الغذائية.",
    },
  },
  "khake-badam": {
    name: { en: "Almond Fines", ar: "نثارة اللوز" },
    description: {
      en: "Almond fines suited to pastry and cake production.",
      ar: "نثارة اللوز المناسبة لصناعة الحلويات والكيك.",
    },
  },
};

function pick(map: Record<string, Pair>, value: string, locale: Locale) {
  if (locale === "fa") return value;
  const hit = map[value];
  return hit ? hit[locale] : value;
}

export type LocalizedProduct = {
  name: string;
  description: string;
  category: string;
  grade: string;
  origin: string;
  unit: string;
};

export function localizeProduct(p: Product, locale: Locale): LocalizedProduct {
  if (locale === "fa") {
    return {
      name: p.name,
      description: p.description,
      category: p.category,
      grade: p.grade,
      origin: p.origin,
      unit: p.unit,
    };
  }
  const entry = PRODUCT_I18N[p.slug];
  return {
    name: entry ? entry.name[locale] : p.name,
    description: entry ? entry.description[locale] : p.description,
    category: pick(CATEGORY_I18N, p.category, locale),
    grade: pick(GRADE_I18N, p.grade, locale),
    origin: pick(ORIGIN_I18N, p.origin, locale),
    unit: pick(UNIT_I18N, p.unit, locale),
  };
}

export function localizeCategory(cat: string, locale: Locale) {
  return pick(CATEGORY_I18N, cat, locale);
}
