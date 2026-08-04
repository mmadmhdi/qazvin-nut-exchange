import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { LICENSES } from "@/lib/licenses";
import { articlesForTopic } from "@/lib/articles";
import { formatJalali, toFaDigits } from "@/lib/format";
import { ShieldCheck, Leaf, Handshake, Globe2, Award, Truck } from "lucide-react";

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
  }),
  component: About,
});

const VALUES = [
  {
    icon: Handshake,
    title: "اعتماد پیش از سود",
    body: "شعار ما «We Prefer Your Trust to Our Interest» است؛ قیمت اعلامی همان قیمت تحویل است، بدون هزینه‌های پنهان.",
  },
  {
    icon: ShieldCheck,
    title: "کیفیت آزمایش‌شده",
    body: "هر بچ تولید با آزمون رطوبت، رنگ و آفلاتوکسین همراه است و شناسنامه‌ی مستقل دارد.",
  },
  {
    icon: Leaf,
    title: "اصالت باغی",
    body: "منبع اصلی ما باغ‌های قزوین و بویین‌زهرا است؛ زنجیره تأمین کوتاه و قابل ردیابی.",
  },
  {
    icon: Globe2,
    title: "نگاه صادراتی",
    body: "بسته‌بندی و مستندسازی منطبق با الزامات بازارهای هدف در حوزه خلیج فارس، اروپا و آسیای شرقی.",
  },
  {
    icon: Award,
    title: "استاندارد و مجوز",
    body: "پروانه‌های بهداشتی ساخت برای محصولات خلال و پرک، با اعتبار پایش‌شده.",
  },
  {
    icon: Truck,
    title: "تحویل پایدار",
    body: "تأمین مستمر در فصل و خارج فصل با انبارداری کنترل‌شده رطوبت و دما.",
  },
];

const TIMELINE = [
  { year: "۱۳۴۸", title: "آغاز در بازار قزوین", body: "نسل اول با حجره‌ای کوچک در بازار خشکبار قزوین کار خود را آغاز کرد." },
  { year: "۱۳۶۵", title: "ورود به خلال‌زنی", body: "راه‌اندازی نخستین خط خلال پسته با تمرکز بر یکنواختی برش و حفظ رنگ." },
  { year: "۱۳۸۲", title: "کنترل کیفیت آزمایشگاهی", body: "استقرار رویه‌های سنجش رطوبت و آفلاتوکسین پیش از عرضه هر بچ." },
  { year: "۱۳۹۶", title: "بسته‌بندی صادراتی", body: "طراحی بسته‌بندی ۱۰ و ۲۵ کیلوگرمی مطابق الزامات بازارهای هدف." },
  { year: "۱۴۰۳", title: "شفافیت قیمت", body: "انتشار عمومی تابلوی قیمت و تاریخچه‌ی نموداری برای تجار و صنایع." },
];

function About() {
  const { settings, products } = useStore();
  const reading = articlesForTopic(["میراث", "برند", "اعتماد", "کیفیت"], 3);
  const active = products.filter((p) => p.active);

  return (
    <div>
      <section className="bg-olive-deep text-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="text-[10px] tracking-[0.35em] uppercase text-brass">About Us</div>
          <h1 className="font-display text-3xl sm:text-5xl mt-4 leading-tight">{settings.brandName}</h1>
          <div className="mx-auto mt-5 h-px w-24 bg-brass/70" />
          <p className="mt-6 text-sm sm:text-base leading-8 text-paper/85 max-w-3xl mx-auto">
            {settings.brandTagline}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-olive-deep">روایت ما</h2>
            <div className="gold-rule my-5" />
            <div className="text-cocoa leading-9 whitespace-pre-line text-[15px] sm:text-base">
              {settings.aboutText}
            </div>
            {settings.missionText && (
              <blockquote className="mt-8 border-r-2 border-brass/70 pr-4 text-olive-deep leading-9">
                {settings.missionText}
              </blockquote>
            )}
          </div>
          <aside className="card-paper rounded-sm p-5 sm:p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">در یک نگاه</div>
            <dl className="mt-4 divide-y divide-border text-sm">
              {[
                ["سال تأسیس", settings.foundedYear ?? "۱۳۴۸"],
                ["تخصص اصلی", "خلال و پرک پسته و بادام"],
                ["محصولات فعال", `${toFaDigits(active.length)} قلم`],
                ["پروانه‌های بهداشتی", `${toFaDigits(LICENSES.length)} مورد`],
                ["ساعات کاری", settings.workingHours ?? "—"],
                ["نشانی", settings.contactAddress],
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
              مشاهده مجوزها
            </Link>
          </aside>
        </div>
      </div>

      <section className="bg-cream/60 hairline-t hairline-b">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="font-display text-2xl sm:text-3xl text-olive-deep text-center">ارزش‌های ما</h2>
          <div className="mx-auto mt-3 h-px w-16 bg-brass/60" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="card-paper rounded-sm p-5">
                <v.icon className="h-5 w-5 text-brass-dark" />
                <div className="font-display text-lg text-olive-deep mt-3">{v.title}</div>
                <p className="text-sm text-cocoa leading-7 mt-2">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl text-olive-deep text-center">مسیر چهار نسل</h2>
        <div className="mx-auto mt-3 h-px w-16 bg-brass/60" />
        <ol className="mt-10 relative border-r border-border pr-6 space-y-8">
          {TIMELINE.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -right-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-brass" />
              <div className="font-display num-fa text-xl text-olive-deep">{t.year}</div>
              <div className="text-sm font-semibold text-cocoa mt-1">{t.title}</div>
              <p className="text-sm text-muted-foreground leading-7 mt-1">{t.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {reading.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl sm:text-2xl text-olive-deep">از دفتر سبز</h2>
            <Link to="/journal" className="text-xs text-brass-dark hover:text-olive-deep">
              همه مقالات
            </Link>
          </div>
          <div className="gold-rule my-4" />
          <div className="grid gap-4 sm:grid-cols-3">
            {reading.map((a) => (
              <Link
                key={a.slug}
                to="/journal/$slug"
                params={{ slug: a.slug }}
                className="card-paper rounded-sm p-4 hover:border-brass/60 transition-colors"
              >
                <div className="text-[10px] num-fa text-muted-foreground">{formatJalali(a.date)}</div>
                <div className="font-display text-base text-olive-deep mt-1 leading-7">{a.title}</div>
                <p className="text-xs text-muted-foreground leading-6 mt-2 line-clamp-3">{a.dek}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-olive-deep text-paper">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 text-center">
          <h2 className="font-display text-2xl sm:text-3xl">همکاری با درج سبز</h2>
          <p className="text-sm text-paper/80 leading-8 mt-3 max-w-2xl mx-auto">
            {settings.exportText}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/wholesale"
              className="rounded-sm bg-brass px-6 py-3 text-xs tracking-widest text-olive-deep hover:bg-brass/90"
            >
              شرایط فروش عمده
            </Link>
            <Link
              to="/contact"
              className="rounded-sm border border-paper/40 px-6 py-3 text-xs tracking-widest hover:bg-paper/10"
            >
              تماس با ما
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
