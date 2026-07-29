// Persian formatting + Jalali date helpers
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatPrice(value: number): string {
  const s = Math.round(value).toLocaleString("en-US");
  return toFaDigits(s.replace(/,/g, "٬"));
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return sign + toFaDigits(Math.abs(value).toFixed(2)) + "٪";
}

export function formatJalali(date: Date): string {
  try {
    const fmt = new Intl.DateTimeFormat("fa-IR-u-nu-arabext-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return fmt.format(date);
  } catch {
    return toFaDigits(date.toISOString().slice(0, 10));
  }
}

export function formatJalaliShort(date: Date): string {
  try {
    const fmt = new Intl.DateTimeFormat("fa-IR-u-nu-arabext-ca-persian", {
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(date);
  } catch {
    return toFaDigits(date.toISOString().slice(5, 10));
  }
}
