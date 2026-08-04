// Persian formatting + Jalali date helpers.
// The Jalali conversion is implemented locally (no Intl) so that server and
// client always render identical strings — Intl calendar support differs
// between the edge runtime and browsers, which caused hydration mismatches.
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const s = Math.round(value).toLocaleString("en-US");
  return toFaDigits(s.replace(/,/g, "٬"));
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return sign + toFaDigits(Math.abs(value).toFixed(2)) + "٪";
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
  return `${toFaDigits(p.jd)} ${JALALI_MONTHS[p.jm - 1]} ${toFaDigits(p.jy)}`;
}

/** «۱۲ مرد ۰۵» — compact but keeps the year visible (chart axes). */
export function formatJalaliShort(input: Date | string | number): string {
  const p = toParts(input);
  if (!p) return "—";
  const yy = String(p.jy).slice(-2);
  return `${toFaDigits(p.jd)} ${JALALI_MONTHS_SHORT[p.jm - 1]} ${toFaDigits(yy)}`;
}

/** «مرداد ۱۴۰۵» */
export function formatJalaliMonth(input: Date | string | number): string {
  const p = toParts(input);
  if (!p) return "—";
  return `${JALALI_MONTHS[p.jm - 1]} ${toFaDigits(p.jy)}`;
}

export function jalaliYear(input: Date | string | number = new Date()): string {
  const p = toParts(input);
  return p ? toFaDigits(p.jy) : "";
}
