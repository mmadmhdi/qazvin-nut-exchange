import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { formatPrice, toFaDigits } from "@/lib/format";
import { Check } from "lucide-react";
import { telHref, waHref } from "@/lib/contact";
import { Faq } from "@/components/site/Faq";
import { wholesaleFaq } from "@/lib/faq-i18n";
import { defaultTiers, defaultBenefits } from "@/lib/wholesale-i18n";
import { useTranslation } from "@/lib/i18n-provider";
import { localizeProduct } from "@/lib/product-i18n";
import { seoLinks } from "@/lib/seo";

export const Route = createFileRoute("/wholesale")({
  head: () => ({
    meta: [
      { title: "فروش عمده خلال پسته — درج سبز قزوین" },
      { name: "description", content: "شرایط فروش عمده و صادراتی خلال پسته قزوین، بویین و مغز پسته سبز برای صنایع و بازار جهانی." },
      { property: "og:title", content: "فروش عمده و صادراتی | درج سبز قزوین" },
      { property: "og:description", content: "شرایط ویژه‌ی خرید عمده برای قنادان، صنایع غذایی و صادرکنندگان." },
    ],
    links: seoLinks("/wholesale"),
  }),
  component: Wholesale,
});

function Wholesale() {
  const { products, settings } = useStore();
  const { t, locale } = useTranslation();
  const pist = products.filter((p) => p.category === "پسته" && p.active);
  const tiers = locale === "fa" ? settings.wholesaleTiers ?? defaultTiers("fa") : defaultTiers(locale);
  const benefits =
    locale === "fa" ? settings.wholesaleBenefits ?? defaultBenefits("fa") : defaultBenefits(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("wholesale.eyebrow")}</div>
      <h1 className="font-display text-3xl sm:text-5xl text-olive-deep mt-2">{t("wholesale.title")}</h1>
      <div className="gold-rule my-6" />
      <p className="text-cocoa leading-8 max-w-2xl text-sm sm:text-base">{t("wholesale.intro")}</p>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mt-10">
        {tiers.map((tier, i) => (
          <div key={tier.name} className={`card-paper rounded-sm p-6 ${i === 1 ? "border-brass/60" : ""}`}>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{tier.name}</div>
            <div className="font-display text-3xl text-olive-deep mt-2 num-fa">
              +{tier.min}<span className="text-base text-cocoa mx-1">{t("wholesale.kg")}</span>
            </div>
            <div className="gold-rule my-4" />
            <div className="text-cocoa text-sm leading-7">{tier.note}</div>
            <div className="mt-4 num-fa text-bull">
              {tier.discount > 0
                ? t("wholesale.discountUpTo", { n: locale === "fa" ? toFaDigits(tier.discount) : tier.discount })
                : t("wholesale.noBaseDiscount")}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 sm:mt-14">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end mb-4 sm:mb-6 gap-3">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("wholesale.invoice")}</div>
            <h2 className="font-display text-xl sm:text-2xl text-olive-deep mt-1">{t("wholesale.priceList")}</h2>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
            {t("wholesale.pricesIn", { currency: locale === "fa" ? settings.currency : t("market.unit.rial") })}
          </div>
        </div>
        <div className="card-paper rounded-sm overflow-hidden">
          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3 text-[10px] tracking-[0.3em] uppercase text-brass-dark bg-cream/50 border-b border-border">
            <div>{t("wholesale.col.product")}</div>
            <div>{t("wholesale.col.origin")}</div>
            <div>{t("wholesale.col.grade")}</div>
            <div className="text-end">{t("wholesale.col.price")}</div>
          </div>
          {pist.map((p) => {
            const l = localizeProduct(p, locale);
            return (
              <Link
                to="/products/$slug"
                params={{ slug: p.slug }}
                key={p.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 sm:px-5 py-3 items-center hover:bg-cream/50 border-b border-border/60 last:border-0"
              >
                <div className="min-w-0">
                  <div className="text-olive-deep truncate">{l.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 md:hidden">
                    {l.origin} · {l.grade}
                  </div>
                </div>
                <div className="hidden md:block text-cocoa text-sm">{l.origin}</div>
                <div className="hidden md:block text-cocoa text-sm">{l.grade}</div>
                <div className="text-end num-fa text-olive-deep shrink-0">{formatPrice(p.price)}</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-12 sm:mt-14 grid gap-6 md:grid-cols-2">
        <div className="card-paper rounded-sm p-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("wholesale.commitments")}</div>
          <div className="gold-rule my-4" />
          <ul className="space-y-3 text-cocoa">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-bull mt-0.5 shrink-0" />
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-paper rounded-sm p-6 bg-gradient-to-br from-cream to-background">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("wholesale.requestEyebrow")}</div>
          <h3 className="font-display text-2xl text-olive-deep mt-2">{t("wholesale.requestTitle")}</h3>
          <p className="text-sm text-cocoa mt-3 leading-8">{t("wholesale.requestText")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={telHref(settings.contactPhone)} className="rounded-sm bg-olive-deep px-6 py-3 text-sm text-paper hover:bg-olive tracking-widest">
              {t("wholesale.callSales")}
            </a>
            {(settings.contactWhatsapp ?? "").trim() ? (
              <a
                href={waHref(settings.contactWhatsapp!, t("wholesale.waMessage", { brand: settings.brandName }))}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-brass/50 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest"
              >
                {t("wholesale.waSales")}
              </a>
            ) : null}
            <Link to="/contact" className="rounded-sm border border-olive-deep/40 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest">
              {t("wholesale.form")}
            </Link>
          </div>
        </div>
      </div>

      <Faq items={wholesaleFaq(locale)} title={t("wholesale.faqTitle")} />
    </div>
  );
}
