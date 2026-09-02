import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { LICENSES } from "@/lib/licenses";
import { articlesForTopic } from "@/lib/articles";
import { formatJalali, toFaDigits } from "@/lib/format";
import { ShieldCheck, Leaf, Handshake, Globe2, Award, Truck } from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";
import { aboutValues, aboutTimeline, aboutCopy } from "@/lib/about-i18n";
import { seoLinks } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره درج سبز قزوین — چهار نسل تجارت پسته" },
      {
        name: "description",
        content:
          "روایت درج سبز قزوین: چهار نسل تجارت خلال پسته، مجوزهای بهداشتی، کنترل کیفیت، ظرفیت تولید و مسیر صادرات خشکبار ایران.",
      },
      { property: "og:title", content: "درباره درج سبز قزوین" },
      {
        property: "og:description",
        content: "میراث خانوادگی، کنترل کیفیت آزمایشگاهی و شفافیت قیمت؛ روایت برند درج سبز قزوین.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: seoLinks("/about"),
  }),
  component: About,
});

const ICONS = [Handshake, ShieldCheck, Leaf, Globe2, Award, Truck];

function About() {
  const { settings, products } = useStore();
  const { t, locale } = useTranslation();
  const reading = articlesForTopic(["میراث", "برند", "اعتماد", "کیفیت"], 3);
  const active = products.filter((p) => p.active);
  const values = aboutValues(locale);
  const timeline = aboutTimeline(locale);
  const copy = aboutCopy(locale);
  const isFa = locale === "fa";
  const num = (n: number) => (isFa ? toFaDigits(n) : String(n));

  return (
    <div>
      <section className="bg-olive-deep text-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="text-[10px] tracking-[0.35em] uppercase text-brass">{t("about.eyebrow")}</div>
          <h1 className="font-display text-3xl sm:text-5xl mt-4 leading-tight">
            {settings.brandName} {t("about.titleSuffix")}
          </h1>
          <div className="mx-auto mt-5 h-px w-24 bg-brass/70" />
          <p className="mt-6 text-sm sm:text-base leading-8 text-paper/85 max-w-3xl mx-auto">
            {isFa ? settings.brandTagline : copy.tagline}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-olive-deep">{t("about.story")}</h2>
            <div className="gold-rule my-5" />
            <div className="text-cocoa leading-9 whitespace-pre-line text-[15px] sm:text-base">
              {isFa ? settings.aboutText : copy.story}
            </div>
            {(isFa ? settings.missionText : copy.mission) && (
              <blockquote className="mt-8 border-s-2 border-brass/70 ps-4 text-olive-deep leading-9">
                {isFa ? settings.missionText : copy.mission}
              </blockquote>
            )}
          </div>
          <aside className="card-paper rounded-sm p-5 sm:p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{t("about.glance")}</div>
            <dl className="mt-4 divide-y divide-border text-sm">
              {[
                [t("about.founded"), isFa ? settings.foundedYear ?? "۱۳۴۸" : "1969"],
                [t("about.expertise"), t("about.expertiseValue")],
                [t("about.activeProducts"), `${num(active.length)} ${t("about.items")}`],
                [t("about.permits"), `${num(LICENSES.length)} ${t("about.cases")}`],
                [t("about.hours"), settings.workingHours ?? "—"],
                [t("about.address"), settings.contactAddress],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3 py-2.5">
                  <dt className="w-28 shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="num-fa text-cocoa">{v}</dd>
                </div>
              ))}
            </dl>
            <Link
              to="/licenses"
              className="mt-5 inline-flex w-full items-center justify-center rounded-sm bg-olive-deep px-4 py-2.5 text-xs tracking-widest text-paper hover:bg-olive"
            >
              {t("about.viewLicenses")}
            </Link>
          </aside>
        </div>
      </div>

      <section className="bg-cream/60 hairline-t hairline-b">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="font-display text-2xl sm:text-3xl text-olive-deep text-center">{t("about.values")}</h2>
          <div className="mx-auto mt-3 h-px w-16 bg-brass/60" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={v.key} className="card-paper rounded-sm p-5">
                  <Icon className="h-5 w-5 text-brass-dark" />
                  <div className="font-display text-lg text-olive-deep mt-3">{v.title}</div>
                  <p className="text-sm text-cocoa leading-7 mt-2">{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl text-olive-deep text-center">{t("about.timeline")}</h2>
        <div className="mx-auto mt-3 h-px w-16 bg-brass/60" />
        <ol className="mt-10 relative border-s border-border ps-6 space-y-8">
          {timeline.map((item) => (
            <li key={item.year} className="relative">
              <span className="absolute -start-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-brass" />
              <div className="font-display num-fa text-xl text-olive-deep">{item.year}</div>
              <div className="text-sm font-semibold text-cocoa mt-1">{item.title}</div>
              <p className="text-sm text-muted-foreground leading-7 mt-1">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {reading.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl sm:text-2xl text-olive-deep">{t("about.fromJournal")}</h2>
            <Link to="/journal" className="text-xs text-brass-dark hover:text-olive-deep">
              {t("about.allArticles")}
            </Link>
          </div>
          <div className="gold-rule my-4" />
          {!isFa && <p className="text-[11px] text-muted-foreground mb-4">{t("lang.note")}</p>}
          <div className="grid gap-4 sm:grid-cols-3">
            {reading.map((a) => (
              <Link
                key={a.slug}
                to="/journal/$slug"
                params={{ slug: a.slug }}
                className="card-paper rounded-sm p-4 hover:border-brass/60 transition-colors"
              >
                <div className="text-[10px] num-fa text-muted-foreground">{formatJalali(a.date)}</div>
                <div className="font-display text-base text-olive-deep mt-1 leading-7" lang="fa" dir="rtl">
                  {a.title}
                </div>
                <p className="text-xs text-muted-foreground leading-6 mt-2 line-clamp-3" lang="fa" dir="rtl">
                  {a.dek}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-olive-deep text-paper">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 text-center">
          <h2 className="font-display text-2xl sm:text-3xl">{t("about.cooperate")}</h2>
          <p className="text-sm text-paper/80 leading-8 mt-3 max-w-2xl mx-auto">
            {isFa ? settings.exportText : copy.export}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/wholesale"
              className="rounded-sm bg-brass px-6 py-3 text-xs tracking-widest text-olive-deep hover:bg-brass/90"
            >
              {t("about.wholesaleTerms")}
            </Link>
            <Link
              to="/contact"
              className="rounded-sm border border-paper/40 px-6 py-3 text-xs tracking-widest hover:bg-paper/10"
            >
              {t("about.contactUs")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
