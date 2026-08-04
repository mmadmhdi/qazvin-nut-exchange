import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPANY, LICENSES } from "@/lib/licenses";
import { BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/licenses")({
  head: () => ({
    meta: [
      { title: "پروانه‌ها و مجوزها — درج سبز قزوین" },
      {
        name: "description",
        content:
          "پروانه‌های بهداشتی ساخت کارخانه درج تجارت لیا با علامت تجاری درج سبز برای خلال و پرک مغز پسته، بادام درختی و بادام زمینی.",
      },
      { property: "og:title", content: "پروانه‌ها و مجوزهای درج سبز" },
      { property: "og:description", content: "شماره پروانه، اوزان بسته‌بندی و اعتبار هر مجوز." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Licenses,
});

function Licenses() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Licenses</div>
      <h1 className="font-display text-3xl sm:text-5xl text-olive-deep mt-2">پروانه‌ها و مجوزها</h1>
      <div className="gold-rule my-6" />
      <p className="max-w-2xl text-sm sm:text-base leading-8 text-cocoa">
        همه‌ی فرآورده‌های ما با علامت تجاری «{COMPANY.trademark}» و در کارخانه‌ی «
        {COMPANY.legalName}» تولید می‌شوند؛ زیر نظر {COMPANY.authority}.
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact k="کد ده‌رقمی ثبت منبع" v={COMPANY.sourceCode} />
        <Fact k="تاریخ صدور کد منبع" v={COMPANY.sourceCodeIssued} />
        <Fact k="تلفن کارخانه" v={COMPANY.factoryPhone} />
        <Fact k="نشانی کارخانه" v={COMPANY.factoryAddress} />
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
              <Row k="شماره پروانه ساخت" v={l.licenseNo} />
              <Row k="شماره نامه" v={l.letterNo} />
              <Row k="تاریخ صدور" v={l.issuedAt} />
              <Row k="اعتبار تا" v={l.validUntil} />
              <Row k="فرمول ترکیبی" v={l.formula} />
              <Row k="علامت تجاری" v={COMPANY.trademark} />
            </dl>
            <div className="mt-4">
              <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                اوزان بسته‌بندی (کیلوگرم)
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
              بسته‌بندی: کیسه‌ی پلیمری پلی‌اتیلن، درون کارتن مقوایی. اوزان بالاتر از یک کیلوگرم
              مخصوص عرضه به صنایع غذایی و مراکز خاص (هتل، رستوران، قنادی) است.
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
            درخواست نسخه‌ی اسناد
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
