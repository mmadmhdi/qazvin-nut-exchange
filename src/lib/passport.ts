import type { Passport, Product } from "@/lib/store";
import { toFaDigits } from "@/lib/format";

// Deterministic "شناسنامه محصول" — like a wine label for nuts.
// Any field can be overridden per product from the admin panel.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}

const SOILS = ["رسی-آهکی", "لومی سبک", "شنی-رسی", "آهکی با زهکش طبیعی"];
const PROCESS = ["خشک آفتابی و بوجاری دستی", "خشک کنترل‌شده و برش سرد", "تفت ملایم و درجه‌بندی نوری"];
const NOTES = [
  "کره‌ای، مغز تازه، پایان شیرین",
  "سبز گیاهی، نمک طبیعی، بافت ترد",
  "برشته ملایم، عطر بادامی، ماندگاری بلند",
  "شیرین لطیف، رایحه باغ، بافت روغنی",
];

export function getPassport(p: Product): Passport {
  if (p.passport) return p.passport;
  const h = hash(p.slug || p.id);
  const year = 1404 - (h % 2);
  return {
    batch: `DS-${String(year).slice(-2)}-${String(100 + (h % 899))}`,
    harvestYear: toFaDigits(year),
    region: p.origin || "قزوین",
    altitude: toFaDigits(1150 + (h % 450)) + " متر",
    soil: SOILS[h % SOILS.length],
    process: PROCESS[h % PROCESS.length],
    size: p.grade || "درجه یک",
    notes: NOTES[h % NOTES.length],
    units: toFaDigits(((h % 18) + 6) * 100) + " بسته",
    certificates: "آزمون آفلاتوکسین · بهداشت · اصالت باغی",
  };
}

export function passportRows(pp: Passport): { label: string; value: string }[] {
  return [
    { label: "شماره بچ", value: pp.batch },
    { label: "سال برداشت", value: pp.harvestYear },
    { label: "منطقه", value: pp.region },
    { label: "ارتفاع باغ", value: pp.altitude },
    { label: "نوع خاک", value: pp.soil },
    { label: "روش فرآوری", value: pp.process },
    { label: "سایز / درجه", value: pp.size },
    { label: "نت‌های طعمی", value: pp.notes },
    { label: "تیراژ تولید", value: pp.units },
    { label: "گواهی‌ها", value: pp.certificates },
  ];
}
