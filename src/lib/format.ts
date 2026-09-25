// Persian formatting + Jalali date helpers.
// The Jalali conversion is implemented locally (no Intl) so that server and
// client always render identical strings — Intl calendar support differs
// between the edge runtime and browsers, which caused hydration mismatches.
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

// Numerals follow the active site language: Latin for English, Persian
// numerals for Persian/Arabic. Set from the locale provider.
let DIGIT_LOCALE: "fa" | "en" | "ar" = "fa";

export function setDigitLocale(l: "fa" | "en" | "ar") {
  DIGIT_LOCALE = l;
}

function digits(input: string | number): string {
  return DIGIT_LOCALE === "en" ? String(input) : toFaDigits(input);
}

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const s = Math.round(value).toLocaleString("en-US");
  return DIGIT_LOCALE === "en" ? s : toFaDigits(s.replace(/,/g, "٬"));
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return sign + digits(Math.abs(value).toFixed(2)) + (DIGIT_LOCALE === "en" ? "%" : "٪");
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const JALALI_MONTHS_SHORT = [
  "فرو",
  "ارد",
  "خرد",
  "تیر",
  "مرد",
  "شهر",
  "مهر",
  "آبا",
  "آذر",
  "دی",
  "بهم",
  "اسف",
];

const JALALI_MONTHS_EN = [
  "Farvardin","Ordibehesht","Khordad","Tir","Mordad","Shahrivar",
  "Mehr","Aban","Azar","Dey","Bahman","Esfand",
];

const JALALI_MONTHS_SHORT_EN = [
  "Far","Ord","Kho","Tir","Mor","Sha","Meh","Aba","Aza","Dey","Bah","Esf",
];

function monthName(i: number, short = false): string {
  if (DIGIT_LOCALE === "en") return short ? JALALI_MONTHS_SHORT_EN[i] : JALALI_MONTHS_EN[i];
  return short ? JALALI_MONTHS_SHORT[i] : JALALI_MONTHS[i];
}

type Jalali = { jy: number; jm: number; jd: number };

function div(a: number, b: number) {
  return Math.trunc(a / b);
}

/** Gregorian (y, m 1-12, d) → Jalali. Pure integer arithmetic. */
export function gregorianToJalali(gy: number, gm: number, gd: number): Jalali {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const gy2 = gy <= 1600 ? gy - 621 : gy - 1600;
  const gm2 = gm > 2 ? 1 : 0;
  let days =
    365 * gy2 +
    div(gy2 + 3 + gm2, 4) -
    div(gy2 + 99 + gm2, 100) +
    div(gy2 + 399 + gm2, 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/** Accepts Date, ISO string ("YYYY-MM-DD"), or timestamp. */
function toParts(input: Date | string | number): Jalali | null {
  if (typeof input === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(input.trim());
    if (m) return gregorianToJalali(Number(m[1]), Number(m[2]), Number(m[3]));
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    return gregorianToJalali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return gregorianToJalali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** «۱۲ مرداد ۱۴۰۵» */
export function formatJalali(input: Date | string | number): string {
  const p = toParts(input);
  if (!p) return "—";
  return `${digits(p.jd)} ${monthName(p.jm - 1)} ${digits(p.jy)}`;
}

/** «۱۲ مرد ۰۵» — compact but keeps the year visible (chart axes). */
export function formatJalaliShort(input: Date | string | number): string {
  const p = toParts(input);
  if (!p) return "—";
  const yy = String(p.jy).slice(-2);
  return `${digits(p.jd)} ${monthName(p.jm - 1, true)} ${digits(yy)}`;
}

/** «مرداد ۱۴۰۵» */
export function formatJalaliMonth(input: Date | string | number): string {
  const p = toParts(input);
  if (!p) return "—";
  return `${monthName(p.jm - 1)} ${digits(p.jy)}`;
}

/** Jalali parts (year/month/day) for any accepted date input. */
export function jalaliParts(input: Date | string | number): { jy: number; jm: number; jd: number } | null {
  return toParts(input);
}

/** Localized Jalali month name (0-based index). */
export function jalaliMonthName(index: number, short = false): string {
  return monthName(index, short);
}

export function jalaliYear(input: Date | string | number = new Date()): string {
  const p = toParts(input);
  return p ? digits(p.jy) : "";
}

/** Persian/Arabic digits → ASCII. */
export function toEnDigits(input: string): string {
  return String(input ?? "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** Parses admin-typed amounts: «۱۲۰٬۰۰۰٬۰۰۰», "120,000,000", "120 000 000". NaN if invalid. */
export function parseAmount(input: string | number | undefined | null): number {
  if (typeof input === "number") return input;
  const s = toEnDigits(String(input ?? "")).replace(/[,،٬\s_']/g, "").replace(/٫/g, ".");
  if (!s || !/^\d+(\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

/** Jalali → Gregorian. */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy + div(jy, 33) * 8 + div((jy % 33) + 3, 4) + 78 + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const ml = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  for (; gm <= 12 && gd > ml[gm]; gm++) gd -= ml[gm];
  return { gy, gm, gd };
}

/** Accepts "2026-09-25" or Jalali "1405/07/03" (any digits/separators) → ISO date, or null. */
export function parseDateInput(input: string): string | null {
  const m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(toEnDigits(String(input ?? "")).trim());
  if (!m) return null;
  let y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  if (y < 1700) ({ gy: y, gm: mo, gd: d } = jalaliToGregorian(y, mo, d));
  const iso = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

/** Today's date in Tehran (the market's calendar day), ISO. */
export function todayTehran(): string {
  return new Date(Date.now() + 3.5 * 3600_000).toISOString().slice(0, 10);
}
