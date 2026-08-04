/**
 * Official manufacturing licenses (پروانه بهداشتی ساخت) issued to
 * «درج تجارت لیا» under the trademark «درج سبز», transcribed from the
 * documents provided by the company. Data is factual — do not embellish.
 */

export type License = {
  id: string;
  product: string;
  productSlugHint: string;
  category: "پسته" | "بادام درختی" | "بادام زمینی";
  licenseNo: string; // شماره پروانه بهداشتی ساخت
  letterNo: string; // شماره نامه
  issuedAt: string; // تاریخ نامه (جلالی)
  validUntil: string; // اعتبار
  packaging: string[]; // اوزان کارتن (کیلوگرم)
  formula: string;
};

export const COMPANY = {
  legalName: "درج تجارت لیا",
  trademark: "درج سبز",
  latin: "DorjeSabz · Almond & Pistachio Peel",
  sourceCode: "۵۱۶۸۴۴۳۰۵۲",
  sourceCodeIssued: "۱۴۰۱/۱۲/۱۵",
  authority: "معاونت غذا و دارو، دانشگاه علوم پزشکی قزوین",
  factoryAddress:
    "استان قزوین، شهرستان قزوین، شهرک صنعتی لیا، خیابان کاوشگران، نبش خیابان خلاقیت",
  factoryPhone: "۰۲۸-۳۳۴۵۵۰۱۰",
  web: "www.dorjesabz.com",
  motto: "We Prefer Your Trust to Our Interest",
  mottoFa: "ما اعتماد شما را به سرمایه‌ی خود ترجیح می‌دهیم",
};

export const LICENSES: License[] = [
  {
    id: "khelal-maghz-peste",
    product: "خلال مغز پسته",
    productSlugHint: "khelal-peste-qazvin",
    category: "پسته",
    licenseNo: "۳۸/۱۳۸۵۱",
    letterNo: "۲۸/۵۳/۴۴۲۴۳۴",
    issuedAt: "۱۴۰۳/۰۸/۰۵",
    validUntil: "۱۴۰۷/۰۱/۰۶",
    packaging: ["۲", "۲/۵", "۳", "۳/۵", "۴", "۴/۵", "۵", "۵/۵", "۶/۵", "۱۱", "۱۳", "۱۵", "۲۰"],
    formula: "خلال مغز پسته ۱۰۰٪",
  },
  {
    id: "khelal-maghz-badam-derakhti",
    product: "خلال مغز بادام درختی",
    productSlugHint: "khelal-badam-derakhti",
    category: "بادام درختی",
    licenseNo: "۳۸/۱۷۲۶۵",
    letterNo: "۲۸/۵۳/۴۴۲۱۹۴",
    issuedAt: "۱۴۰۳/۰۸/۰۲",
    validUntil: "۱۴۰۷/۰۱/۰۶",
    packaging: ["۲/۵", "۳/۵", "۴/۵", "۵/۵", "۶/۵", "۱۱", "۱۳", "۱۵", "۲۰"],
    formula: "خلال مغز بادام درختی ۱۰۰٪",
  },
  {
    id: "khelal-maghz-badam-zamini",
    product: "خلال مغز بادام زمینی",
    productSlugHint: "khelal-badam-zamini-doroshte",
    category: "بادام زمینی",
    licenseNo: "۳۸/۱۷۲۶۶",
    letterNo: "۲۸/۵۳/۴۴۲۴۳۸",
    issuedAt: "۱۴۰۳/۰۸/۰۵",
    validUntil: "۱۴۰۷/۰۱/۰۶",
    packaging: ["۲", "۲/۵", "۳", "۳/۵", "۴", "۵/۵", "۶/۵", "۱۰", "۱۱", "۱۵", "۲۰"],
    formula: "خلال مغز بادام زمینی ۱۰۰٪",
  },
  {
    id: "perak-maghz-badam-derakhti",
    product: "پرک مغز بادام درختی",
    productSlugHint: "perak-badam-derakhti",
    category: "بادام درختی",
    licenseNo: "۳۸/۱۷۷۴۶",
    letterNo: "۲۸/۵۳/۴۴۴۸۱",
    issuedAt: "۱۴۰۳/۰۸/۲۷",
    validUntil: "یک سال از تاریخ صدور",
    packaging: ["۴/۵", "۵", "۵/۵", "۱۱", "۱۳", "۱۵", "۱۸", "۲۰"],
    formula: "پرک مغز بادام درختی ۱۰۰٪",
  },
  {
    id: "perak-maghz-badam-zamini",
    product: "پرک مغز بادام زمینی",
    productSlugHint: "perak-badam-zamini",
    category: "بادام زمینی",
    licenseNo: "۳۸/۱۷۷۴۵",
    letterNo: "۲۸/۵۳/۴۴۴۸۰۷",
    issuedAt: "۱۴۰۳/۰۸/۲۷",
    validUntil: "یک سال از تاریخ صدور",
    packaging: ["۴/۵", "۵", "۵/۵", "۱۱", "۱۳", "۱۵", "۱۸", "۲۰"],
    formula: "پرک مغز بادام زمینی ۱۰۰٪",
  },
];

export function licenseForProduct(slug: string): License | undefined {
  return LICENSES.find((l) => l.productSlugHint === slug);
}
