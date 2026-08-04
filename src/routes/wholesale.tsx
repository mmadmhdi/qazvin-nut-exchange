import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { Check } from "lucide-react";
import { telHref, waHref } from "@/lib/contact";

export const Route = createFileRoute("/wholesale")({
  head: () => ({
    meta: [
      { title: "فروش عمده خلال پسته — درج سبز قزوین" },
      { name: "description", content: "شرایط فروش عمده و صادراتی خلال پسته قزوین، بویین و مغز پسته سبز برای صنایع و بازار جهانی." },
      { property: "og:title", content: "فروش عمده و صادراتی | درج سبز قزوین" },
      { property: "og:description", content: "شرایط ویژه‌ی خرید عمده برای قنادان، صنایع غذایی و صادرکنندگان." },
    ],
  }),
  component: Wholesale,
});

const TIERS = [
  { name: "قنادی و بوتیک", min: 20, discount: 0, note: "قیمت تابلو، ارسال از انبار قزوین" },
  { name: "صنایع غذایی", min: 100, discount: 4, note: "تخفیف پلکانی، بسته‌بندی درخواستی" },
  { name: "صادرات و پروژه", min: 500, discount: 8, note: "قرارداد سالانه، ثبت سفارش صادراتی" },
];

const BENEFITS = [
  "مبدأ باغ‌های اصیل قزوین و بویین‌زهرا",
  "کنترل کیفیت سه‌مرحله‌ای رنگ، رطوبت و اندازه",
  "بسته‌بندی خلأ (Vacuum) و کارتن صادراتی",
  "امکان درج برند شخصی (Private Label)",
  "گواهی بهداشت و آنالیز آزمایشگاهی همراه محموله",
  "قرارداد قیمت تضمینی سه ماهه برای مشتریان دائم",
];

function Wholesale() {
  const { products, settings } = useStore();
  const pist = products.filter((p) => p.category === "پسته" && p.active);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">فروش عمده و صادراتی</div>
      <h1 className="font-display text-3xl sm:text-5xl text-olive-deep mt-2">شریک تجاری تجار خشکبار</h1>
      <div className="gold-rule my-6" />
      <p className="text-cocoa leading-8 max-w-2xl text-sm sm:text-base">
        درج سبز قزوین، خلال پسته با درجه‌ی صادراتی را برای قنادان، صنایع غذایی و صادرکنندگان تأمین می‌کند. شرایط تخفیف پلکانی، پرداخت مدت‌دار و قرارداد سالانه‌ی قیمت‌تضمینی بر اساس حجم سفارش قابل مذاکره است.
      </p>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mt-10">
        {TIERS.map((t, i) => (
          <div key={t.name} className={`card-paper rounded-sm p-6 ${i === 1 ? "border-brass/60" : ""}`}>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t.name}</div>
            <div className="font-display text-3xl text-olive-deep mt-2 num-fa">
              +{t.min}<span className="text-base text-cocoa mr-1">کیلوگرم</span>
            </div>
            <div className="gold-rule my-4" />
            <div className="text-cocoa text-sm leading-7">{t.note}</div>
            <div className="mt-4 num-fa text-bull">
              {t.discount > 0 ? `تا ${t.discount}٪ تخفیف` : "بدون تخفیف پایه"}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 sm:mt-14">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end mb-4 sm:mb-6 gap-3">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">پیش‌فاکتور</div>
            <h2 className="font-display text-xl sm:text-2xl text-olive-deep mt-1">لیست قیمت عمده</h2>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
            قیمت‌ها به {settings.currency}
          </div>
        </div>
        <div className="card-paper rounded-sm overflow-hidden">
          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3 text-[10px] tracking-[0.3em] uppercase text-brass-dark bg-cream/50 border-b border-border">
            <div>محصول</div>
            <div>منشأ</div>
            <div>درجه</div>
            <div className="text-left">قیمت / کیلو</div>
          </div>
          {pist.map((p) => (
            <Link
              to="/products/$slug"
              params={{ slug: p.slug }}
              key={p.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 sm:px-5 py-3 items-center hover:bg-cream/50 border-b border-border/60 last:border-0"
            >
              <div className="min-w-0">
                <div className="text-olive-deep truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 md:hidden">
                  {p.origin} · {p.grade}
                </div>
              </div>
              <div className="hidden md:block text-cocoa text-sm">{p.origin}</div>
              <div className="hidden md:block text-cocoa text-sm">{p.grade}</div>
              <div className="text-left num-fa text-olive-deep shrink-0">{formatPrice(p.price)}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-12 sm:mt-14 grid gap-6 md:grid-cols-2">
        <div className="card-paper rounded-sm p-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">تعهدات درج سبز</div>
          <div className="gold-rule my-4" />
          <ul className="space-y-3 text-cocoa">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-bull mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-paper rounded-sm p-6 bg-gradient-to-br from-cream to-background">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">ثبت درخواست</div>
          <h3 className="font-display text-2xl text-olive-deep mt-2">آماده گفتگو با تیم فروش</h3>
          <p className="text-sm text-cocoa mt-3 leading-8">
            برای دریافت پیش‌فاکتور صادراتی، نمونه محصول یا قرارداد سالانه، با ما تماس بگیرید.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={telHref(settings.contactPhone)} className="rounded-sm bg-olive-deep px-6 py-3 text-sm text-paper hover:bg-olive tracking-widest">تماس با فروش</a>
            {(settings.contactWhatsapp ?? "").trim() ? (
              <a
                href={waHref(settings.contactWhatsapp!, `سلام، برای خرید عمده از وب‌سایت ${settings.brandName} تماس می‌گیرم.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-brass/50 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest"
              >
                واتساپ فروش
              </a>
            ) : null}
            <Link to="/contact" className="rounded-sm border border-olive-deep/40 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest">فرم درخواست</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
