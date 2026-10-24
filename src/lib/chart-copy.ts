import type { Locale } from "./i18n";

const COPY = {
  fa: { market: "درج سبز / بازار", last: "آخرین قیمت ثبت‌شده", records: "روز معاملاتی", reset: "بازنشانی نمودار", download: "دریافت تاریخچه قیمت", period: "تغییر بازه", real: "معاملات ثبت‌شده", derived: "هیکن‌آشی · مقادیر محاسبه‌شده", ranges: ["۱ هفته", "۱ ماه", "۳ ماه", "۶ ماه", "۱ سال", "همه"] },
  en: { market: "Dorjesabz / Market", last: "Last recorded price", records: "trading days", reset: "Reset chart", download: "Download price history", period: "Period change", real: "Recorded trades", derived: "Heikin-Ashi · calculated values", ranges: ["1 week", "1 month", "3 months", "6 months", "1 year", "All"] },
  ar: { market: "درج سبز / السوق", last: "آخر سعر مسجل", records: "أيام تداول", reset: "إعادة ضبط الرسم", download: "تنزيل سجل الأسعار", period: "تغير الفترة", real: "معاملات مسجلة", derived: "هيكن آشي · قيم محسوبة", ranges: ["أسبوع", "شهر", "٣ أشهر", "٦ أشهر", "سنة", "الكل"] },
};
export const chartCopy = (locale: Locale) => COPY[locale];