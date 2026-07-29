import { createFileRoute, Link } from "@tanstack/react-router";
import { formatJalali } from "@/lib/format";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "اخبار بازار خشکبار — درج سبز قزوین" },
      { name: "description", content: "تازه‌ترین اخبار و یادداشت‌های بازار خلال پسته قزوین، صادرات و اقتصاد خشکبار." },
      { property: "og:title", content: "اخبار خشکبار | درج سبز قزوین" },
      { property: "og:description", content: "روایت‌های تازه از بازار پسته، صادرات و تحولات صنعت خشکبار." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: News,
});

const NEWS = [
  {
    slug: "harvest-1405",
    title: "برداشت پسته قزوین ۱۴۰۵؛ کیفیت بالا، تناژ محدود",
    excerpt:
      "گزارش‌های میدانی از باغ‌های قزوین و بویین‌زهرا نشان می‌دهد کیفیت مغز و رنگ سبز امسال از میانگین چند سال گذشته بالاتر است، هرچند بارندگی نامنظم بهار سبب کاهش تناژ شده است.",
    tag: "بنیادی",
    date: "2026-07-20",
  },
  {
    slug: "export-gulf",
    title: "افزایش تقاضای خلیج فارس برای خلال پسته درجه یک",
    excerpt:
      "بازارهای امارات و کویت در فصل جاری تقاضای ثابت‌تری نسبت به سال گذشته نشان داده‌اند؛ صادرکنندگان قزوینی از رشد ۱۲ درصدی سفارش‌ها خبر می‌دهند.",
    tag: "صادرات",
    date: "2026-07-10",
  },
  {
    slug: "packaging-standard",
    title: "استاندارد جدید بسته‌بندی خلال پسته صادراتی",
    excerpt:
      "اتحادیه خشکبار، پروتکل تازه‌ای برای بسته‌بندی خلال پسته صادراتی ابلاغ کرده که بر ضخامت لایه‌های مانع، درج تاریخ برداشت و کد ردیابی تأکید دارد.",
    tag: "مقررات",
    date: "2026-06-28",
  },
  {
    slug: "pistachio-index",
    title: "معرفی شاخص روزانه قیمت پسته درج سبز",
    excerpt:
      "درج سبز قزوین، شاخص روزانه‌ی قیمت خلال پسته را با میانگین‌گیری از عرضه‌کنندگان اصلی شهر قزوین راه‌اندازی کرد؛ داده‌ها روزانه ساعت ۱۰ صبح منتشر می‌شود.",
    tag: "درج سبز",
    date: "2026-06-15",
  },
  {
    slug: "currency-impact",
    title: "اثر نوسان ارز بر قیمت خلال پسته داخلی",
    excerpt:
      "تحلیل‌ها نشان می‌دهد همبستگی معنی‌داری میان نرخ ارز و قیمت داخلی پسته وجود دارد، به‌ویژه در محصولات درجه یک با تقاضای صادراتی بالا.",
    tag: "تحلیلی",
    date: "2026-05-30",
  },
  {
    slug: "cold-storage",
    title: "توسعه انبار سرد در قزوین برای حفظ کیفیت خلال پسته",
    excerpt:
      "چند شرکت خصوصی در سه ماه اخیر ظرفیت انبار سرد قزوین را ۲۰ درصد افزایش داده‌اند؛ این توسعه به کاهش افت کیفیت در فصل‌های گرم کمک می‌کند.",
    tag: "زیرساخت",
    date: "2026-05-18",
  },
];

function News() {
  const [lead, ...rest] = NEWS;
  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">اتاق خبر</div>
      <h1 className="font-display text-4xl md:text-5xl text-olive-deep mt-2">اخبار بازار خشکبار</h1>
      <div className="gold-rule my-6" />

      {/* Lead */}
      <article className="grid md:grid-cols-[1.4fr_1fr] gap-6 card-paper rounded-sm p-6">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{lead.tag}</div>
          <h2 className="font-display text-3xl text-olive-deep mt-2 leading-snug">{lead.title}</h2>
          <p className="text-cocoa leading-8 mt-4">{lead.excerpt}</p>
          <div className="text-xs text-muted-foreground mt-6">{formatJalali(new Date(lead.date))}</div>
        </div>
        <div className="hidden md:block bg-gradient-to-br from-olive-deep to-olive rounded-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,var(--brass),transparent_60%)]" />
          <div className="absolute bottom-4 right-4 font-display text-3xl text-brass">درج سبز</div>
        </div>
      </article>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {rest.map((n) => (
          <article key={n.slug} className="card-paper rounded-sm p-5 flex flex-col">
            <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">{n.tag}</div>
            <h3 className="font-display text-xl text-olive-deep mt-2 leading-snug">{n.title}</h3>
            <p className="text-sm text-cocoa leading-7 mt-3 flex-1">{n.excerpt}</p>
            <div className="text-xs text-muted-foreground mt-4">{formatJalali(new Date(n.date))}</div>
          </article>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link to="/analysis" className="rounded-sm bg-olive-deep px-6 py-3 text-sm text-paper hover:bg-olive tracking-widest">به تحلیل بازار</Link>
        <Link to="/market" className="rounded-sm border border-olive-deep/40 px-6 py-3 text-sm text-olive-deep hover:bg-cream tracking-widest">تابلوی قیمت</Link>
      </div>
    </div>
  );
}
