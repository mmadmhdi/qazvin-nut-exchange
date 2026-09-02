import type { Locale } from "@/lib/i18n";

export type ValueItem = { key: string; title: string; body: string };
export type TimelineItem = { year: string; title: string; body: string };

const VALUES: Record<Locale, ValueItem[]> = {
  fa: [
    { key: "trust", title: "اعتماد پیش از سود", body: "شعار ما «We Prefer Your Trust to Our Interest» است؛ قیمت اعلامی همان قیمت تحویل است، بدون هزینه‌های پنهان." },
    { key: "quality", title: "کیفیت آزمایش‌شده", body: "هر بچ تولید با آزمون رطوبت، رنگ و آفلاتوکسین همراه است و شناسنامه‌ی مستقل دارد." },
    { key: "origin", title: "اصالت باغی", body: "منبع اصلی ما باغ‌های قزوین و بویین‌زهرا است؛ زنجیره تأمین کوتاه و قابل ردیابی." },
    { key: "export", title: "نگاه صادراتی", body: "بسته‌بندی و مستندسازی منطبق با الزامات بازارهای هدف در حوزه خلیج فارس، اروپا و آسیای شرقی." },
    { key: "standard", title: "استاندارد و مجوز", body: "پروانه‌های بهداشتی ساخت برای محصولات خلال و پرک، با اعتبار پایش‌شده." },
    { key: "delivery", title: "تحویل پایدار", body: "تأمین مستمر در فصل و خارج فصل با انبارداری کنترل‌شده رطوبت و دما." },
  ],
  en: [
    { key: "trust", title: "Trust before profit", body: "Our motto is “We Prefer Your Trust to Our Interest” — the quoted price is the delivered price, with no hidden costs." },
    { key: "quality", title: "Tested quality", body: "Every production batch is tested for moisture, colour and aflatoxin and carries its own certificate." },
    { key: "origin", title: "Orchard provenance", body: "Our main source is the orchards of Qazvin and Buin Zahra — a short, traceable supply chain." },
    { key: "export", title: "Export mindset", body: "Packaging and documentation aligned with the requirements of Gulf, European and East Asian markets." },
    { key: "standard", title: "Standards and permits", body: "Manufacturing health permits for sliver and flake products, with monitored validity." },
    { key: "delivery", title: "Reliable supply", body: "Continuous supply in and out of season, with humidity- and temperature-controlled storage." },
  ],
  ar: [
    { key: "trust", title: "الثقة قبل الربح", body: "شعارنا «نفضّل ثقتكم على مصلحتنا»؛ السعر المعلن هو سعر التسليم دون كلف خفية." },
    { key: "quality", title: "جودة مختبَرة", body: "كل دفعة إنتاج تُختبر للرطوبة واللون والأفلاتوكسين ولها شهادة مستقلة." },
    { key: "origin", title: "أصل البستان", body: "مصدرنا الأساسي بساتين قزوين وبوئين زهرا؛ سلسلة توريد قصيرة وقابلة للتتبع." },
    { key: "export", title: "رؤية تصديرية", body: "تعبئة وتوثيق يوافقان متطلبات أسواق الخليج وأوروبا وشرق آسيا." },
    { key: "standard", title: "المعايير والتراخيص", body: "تراخيص صحية للإنتاج لمنتجات الشرائح والرقائق مع متابعة صلاحيتها." },
    { key: "delivery", title: "توريد مستقر", body: "توريد مستمر داخل الموسم وخارجه مع تخزين مضبوط الرطوبة والحرارة." },
  ],
};

const TIMELINE: Record<Locale, TimelineItem[]> = {
  fa: [
    { year: "۱۳۴۸", title: "آغاز در بازار قزوین", body: "نسل اول با حجره‌ای کوچک در بازار خشکبار قزوین کار خود را آغاز کرد." },
    { year: "۱۳۶۵", title: "ورود به خلال‌زنی", body: "راه‌اندازی نخستین خط خلال پسته با تمرکز بر یکنواختی برش و حفظ رنگ." },
    { year: "۱۳۸۲", title: "کنترل کیفیت آزمایشگاهی", body: "استقرار رویه‌های سنجش رطوبت و آفلاتوکسین پیش از عرضه هر بچ." },
    { year: "۱۳۹۶", title: "بسته‌بندی صادراتی", body: "طراحی بسته‌بندی ۱۰ و ۲۵ کیلوگرمی مطابق الزامات بازارهای هدف." },
    { year: "۱۴۰۳", title: "شفافیت قیمت", body: "انتشار عمومی تابلوی قیمت و تاریخچه‌ی نموداری برای تجار و صنایع." },
  ],
  en: [
    { year: "1969", title: "Beginnings in the Qazvin bazaar", body: "The first generation started with a small stall in the Qazvin nut bazaar." },
    { year: "1986", title: "Into slivering", body: "Our first pistachio sliver line, focused on cut uniformity and colour retention." },
    { year: "2003", title: "Laboratory quality control", body: "Moisture and aflatoxin testing established before any batch is released." },
    { year: "2017", title: "Export packaging", body: "10 kg and 25 kg packaging designed to target-market requirements." },
    { year: "2024", title: "Price transparency", body: "Public price board and chart history published for traders and industry." },
  ],
  ar: [
    { year: "١٩٦٩", title: "البداية في سوق قزوين", body: "بدأ الجيل الأول بحُجرة صغيرة في سوق المكسرات في قزوين." },
    { year: "١٩٨٦", title: "الدخول في تقطيع الشرائح", body: "تشغيل أول خط لشرائح الفستق بالتركيز على انتظام القطع وحفظ اللون." },
    { year: "٢٠٠٣", title: "ضبط الجودة المختبري", body: "إرساء إجراءات قياس الرطوبة والأفلاتوكسين قبل طرح أي دفعة." },
    { year: "٢٠١٧", title: "التعبئة التصديرية", body: "تصميم عبوات ١٠ و٢٥ كغم وفق متطلبات الأسواق المستهدفة." },
    { year: "٢٠٢٤", title: "شفافية السعر", body: "نشر لوحة الأسعار وسجل الرسوم البيانية للتجار والصناعات." },
  ],
};

const COPY: Record<Locale, { tagline: string; story: string; mission: string; export: string }> = {
  fa: { tagline: "", story: "", mission: "", export: "" },
  en: {
    tagline: "Four generations of nut trading in Qazvin — transparent pricing, tested quality.",
    story:
      "Darj Sabz Qazvin (Darj Tejarat Lia) has traded pistachios and nuts in Qazvin for four generations. What began as a small stall in the city bazaar is today a processing unit in the Lia industrial estate, specialising in pistachio and almond slivers and flakes.\n\nOur work rests on three pillars: buying directly from the orchards of Qazvin and Buin Zahra, laboratory control of moisture, colour and aflatoxin for every batch, and publishing our real transaction prices so buyers can judge the market for themselves.",
    mission: "We prefer your trust to our interest — the quoted price is the delivered price.",
    export:
      "For confectioners, food manufacturers and exporters we offer tiered wholesale pricing, vacuum and export packaging, private labelling and accredited laboratory analysis with every consignment.",
  },
  ar: {
    tagline: "أربعة أجيال في تجارة المكسرات في قزوين — أسعار شفافة وجودة مختبَرة.",
    story:
      "تعمل درج سبز قزوين (درج تجارت ليا) في تجارة الفستق والمكسرات في قزوين منذ أربعة أجيال. ما بدأ حُجرةً صغيرة في سوق المدينة هو اليوم وحدة معالجة في مدينة ليا الصناعية متخصصة في شرائح ورقائق الفستق واللوز.\n\nيقوم عملنا على ثلاث ركائز: الشراء المباشر من بساتين قزوين وبوئين زهرا، والضبط المختبري للرطوبة واللون والأفلاتوكسين لكل دفعة، ونشر أسعار معاملاتنا الحقيقية ليتمكن المشتري من تقييم السوق بنفسه.",
    mission: "نفضّل ثقتكم على مصلحتنا؛ السعر المعلن هو سعر التسليم.",
    export:
      "لأصحاب الحلويات والصناعات الغذائية والمصدّرين نوفّر أسعار جملة تدريجية، وتعبئة بالتفريغ الهوائي وكرتوناً تصديرياً، وطبع العلامة الخاصة، وتحليلاً مختبرياً معتمداً مع كل شحنة.",
  },
};

export const aboutValues = (l: Locale) => VALUES[l] ?? VALUES.fa;
export const aboutTimeline = (l: Locale) => TIMELINE[l] ?? TIMELINE.fa;
export const aboutCopy = (l: Locale) => COPY[l] ?? COPY.fa;
