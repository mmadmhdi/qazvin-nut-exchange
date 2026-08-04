// Contact + WhatsApp helpers. No backend: inquiries are delivered through a
// pre-filled WhatsApp message (or an e-mail fallback when no WhatsApp number
// is configured in the admin panel).

const FA_TO_EN: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

export function toEnDigits(input: string): string {
  return String(input ?? "").replace(/[۰-۹٠-٩]/g, (d) => FA_TO_EN[d] ?? d);
}

/** «۰۹۱۲۳۴۵۶۷۸۹» → «989123456789» (E.164 digits, no plus). */
export function toIntlDigits(input: string): string {
  let d = toEnDigits(input).replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (d.startsWith("0098")) d = d.slice(2);
  if (d.startsWith("98")) return d;
  if (d.startsWith("0")) return "98" + d.slice(1);
  return d;
}

/** tel: href that always works on mobile. */
export function telHref(phone: string): string {
  return "tel:+" + toIntlDigits(phone);
}

export function waHref(phone: string, message?: string): string {
  const n = toIntlDigits(phone);
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${n}${q}`;
}

export type Inquiry = {
  name: string;
  phone: string;
  message: string;
  subject?: string;
  quantity?: string;
  product?: string;
};

export function validateInquiry(v: Inquiry): string | null {
  const name = v.name.trim();
  const phone = toEnDigits(v.phone).replace(/[^\d+]/g, "");
  if (name.length < 2 || name.length > 100) return "نام را کامل وارد کنید.";
  if (!/^(\+?98|0)?9\d{9}$|^0?\d{8,11}$/.test(phone)) return "شماره تماس معتبر نیست.";
  if (v.message.trim().length > 1000) return "متن پیام بیش از حد طولانی است.";
  return null;
}

export function buildInquiryText(v: Inquiry, brand: string): string {
  const lines = [
    `سلام، درخواست جدید از وب‌سایت ${brand}`,
    "",
    `نام: ${v.name.trim()}`,
    `شماره تماس: ${toEnDigits(v.phone).trim()}`,
  ];
  if (v.subject) lines.push(`موضوع: ${v.subject}`);
  if (v.product) lines.push(`محصول: ${v.product}`);
  if (v.quantity) lines.push(`مقدار درخواستی: ${v.quantity}`);
  if (v.message.trim()) lines.push("", `توضیحات: ${v.message.trim()}`);
  return lines.join("\n");
}

export function mailtoHref(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Opens WhatsApp when a number exists, otherwise falls back to e-mail. */
export function sendInquiry(
  v: Inquiry,
  settings: { brandName: string; contactWhatsapp?: string; contactEmail: string },
): "whatsapp" | "email" {
  const text = buildInquiryText(v, settings.brandName);
  const wa = (settings.contactWhatsapp ?? "").trim();
  if (wa) {
    window.open(waHref(wa, text), "_blank", "noopener,noreferrer");
    return "whatsapp";
  }
  window.location.href = mailtoHref(
    settings.contactEmail,
    `درخواست از وب‌سایت ${settings.brandName}`,
    text,
  );
  return "email";
}
