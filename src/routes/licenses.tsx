import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { COMPANY, LICENSES } from "@/lib/licenses";
import { BadgeCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";

export const Route = createFileRoute("/licenses")({
  head: () => ({
    meta: [
      ...seoMeta("/licenses"),
      { title: "تولیدکننده مجاز خلال و مغز پسته | درج سبز" },
      {
        name: "description",
        content:
          "مشاهده مجوزهای بهداشتی تولید و بسته‌بندی خلال پسته، مغز پسته، بادام درختی و بادام زمینی درج سبز؛ همراه با شماره و اعتبار پروانه ساخت.",
      },
      { name: "keywords", content: "تولید کننده خلال پسته، تولید کننده مغز پسته، مجوز بهداشت پسته، کارخانه فرآوری پسته، بسته بندی پسته" },
      { property: "og:title", content: "تولیدکننده مجاز خلال و مغز پسته | درج سبز" },
      { property: "og:description", content: "مجوزهای بهداشتی تولید، فرآوری و بسته‌بندی خلال و مغز پسته درج سبز." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: seoLinks("/licenses"),
  }),
  component: Licenses,
});

function Licenses() {
  const { locale } = useTranslation();
  const c = locale === "fa" ? { title: "پروانه‌ها و مجوزها", intro: "همه‌ی فرآورده‌های ما با علامت تجاری درج سبز و در کارخانه درج تجارت لیا تولید می‌شوند و تحت نظارت مرجع بهداشتی هستند.", facts: ["کد ده‌رقمی ثبت منبع", "تاریخ صدور کد منبع", "تلفن کارخانه", "نشانی کارخانه"], rows: ["شماره پروانه ساخت", "شماره نامه", "تاریخ صدور", "اعتبار تا", "فرمول ترکیبی", "علامت تجاری"], weights: "اوزان بسته‌بندی (کیلوگرم)", note: "بسته‌بندی: کیسه‌ی پلیمری پلی‌اتیلن، درون کارتن مقوایی. اوزان بالاتر از یک کیلوگرم مخصوص صنایع غذایی و مراکز خاص است.", request: "درخواست نسخه‌ی اسناد" } : locale === "ar" ? { title: "التراخيص والشهادات", intro: "تُنتج جميع منتجاتنا تحت علامة درج سبز في مصنع درج تجارت ليا وبإشراف الجهة الصحية المختصة.", facts: ["رمز تسجيل المصدر", "تاريخ إصدار الرمز", "هاتف المصنع", "عنوان المصنع"], rows: ["رقم ترخيص الإنتاج", "رقم الخطاب", "تاريخ الإصدار", "صالح حتى", "التركيبة", "العلامة التجارية"], weights: "أوزان العبوات (كغم)", note: "التعبئة في كيس بولي إيثيلين داخل كرتون. الأوزان التي تزيد عن كيلوغرام مخصصة للصناعات الغذائية والمراكز المتخصصة.", request: "طلب نسخة من الوثائق" } : { title: "Licences & certifications", intro: "All products are made under the Darj Sabz trademark at the Darj Tejarat Lia factory under the relevant health authority.", facts: ["Source registration code", "Code issue date", "Factory telephone", "Factory address"], rows: ["Manufacturing licence", "Letter number", "Issue date", "Valid until", "Formula", "Trademark"], weights: "Pack weights (kg)", note: "Packed in a polyethylene bag inside a cardboard carton. Packs above one kilogram are intended for food manufacturers and specialist venues.", request: "Request document copies" };
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Licenses</div>
       <h1 className="font-display text-3xl sm:text-5xl text-olive-deep mt-2">{c.title}</h1>
      <div className="gold-rule my-6" />
      <p className="max-w-2xl text-sm sm:text-base leading-8 text-cocoa">
         {c.intro}
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
         <Fact k={c.facts[0]} v={COMPANY.sourceCode} />
         <Fact k={c.facts[1]} v={COMPANY.sourceCodeIssued} />
         <Fact k={c.facts[2]} v={COMPANY.factoryPhone} />
         <Fact k={c.facts[3]} v={COMPANY.factoryAddress} />
      </dl>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {LICENSES.map((l) => (
          <div key={l.id} className="card-paper rounded-sm p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="text-[10px] tracking-[0.25em] uppercase text-brass-dark">
                  {l.category}
                </div>
                <h2 className="mt-1 font-display text-2xl text-olive-deep">{l.product}</h2>
              </div>
              <BadgeCheck className="h-5 w-5 shrink-0 text-brass-dark" />
            </div>
            <dl className="mt-5 grid gap-x-6 text-xs sm:grid-cols-2">
               <Row k={c.rows[0]} v={l.licenseNo} />
               <Row k={c.rows[1]} v={l.letterNo} />
               <Row k={c.rows[2]} v={l.issuedAt} />
               <Row k={c.rows[3]} v={l.validUntil} />
               <Row k={c.rows[4]} v={l.formula} />
               <Row k={c.rows[5]} v={COMPANY.trademark} />
            </dl>
            <div className="mt-4">
              <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                 {c.weights}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {l.packaging.map((w) => (
                  <span
                    key={w}
                    className="num-fa rounded-sm border border-olive-deep/20 px-2 py-0.5 text-[11px] text-cocoa"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-6 text-muted-foreground">
               {c.note}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 card-paper rounded-sm p-6 sm:p-10 text-center">
        <div className="font-display text-2xl text-olive-deep">{COMPANY.mottoFa}</div>
        <div className="mt-2 text-[11px] tracking-[0.3em] uppercase text-brass-dark">
          {COMPANY.motto}
        </div>
        <div className="mt-6">
          <Link
            to="/contact"
            className="inline-flex rounded-sm bg-olive-deep px-5 py-2.5 text-xs tracking-widest text-paper hover:bg-olive"
          >
             {c.request}
          </Link>
        </div>
      </div>
      <div className="h-14" />
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="card-paper rounded-sm p-4">
      <dt className="text-[10px] tracking-widest uppercase text-muted-foreground">{k}</dt>
      <dd className="mt-1.5 text-sm leading-7 text-cocoa">{v}</dd>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,110px)_minmax(0,1fr)] gap-2 border-b border-border/40 py-1.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="min-w-0 text-cocoa">{v}</dd>
    </div>
  );
}
