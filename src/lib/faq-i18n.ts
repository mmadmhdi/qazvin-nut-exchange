import type { Locale } from "@/lib/i18n";
import type { FaqItem } from "@/components/site/Faq";

const PRICE_FAQ: Record<Locale, FaqItem[]> = {
  fa: [
    {
      q: "قیمت روز خلال پسته امروز چند است؟",
      a: "نرخ روز هر قلم در همین تابلو با تاریخ آخرین معامله نمایش داده می‌شود؛ اعداد بر مبنای ریال به‌ازای هر کیلوگرم و برگرفته از دفاتر فروش رسمی شرکت درج تجارت لیا هستند.",
    },
    {
      q: "قیمت‌ها هر چند وقت به‌روزرسانی می‌شوند؟",
      a: "پس از هر معامله‌ی ثبت‌شده، نرخ و نمودار همان قلم به‌روز می‌شود؛ تاریخ آخرین به‌روزرسانی همیشه کنار عدد درج شده است.",
    },
    {
      q: "چرا قیمت خلال پسته با مغز پسته تفاوت دارد؟",
      a: "برای تولید هر کیلوگرم خلال درجه‌یک، حدود ۱٫۱۵ تا ۱٫۳۵ کیلوگرم مغز سالم مصرف می‌شود و هزینه‌ی برش، خشک‌کن و سرند نیز اضافه می‌گردد؛ به همین دلیل نرخ خلال بالاتر است.",
    },
    {
      q: "نمودار قیمت بر پایه چه داده‌ای رسم شده است؟",
      a: "بر پایه‌ی معاملات واقعی ثبت‌شده در دفاتر فروش شرکت (سال‌های ۱۴۰۴ و ۱۴۰۵)؛ برای هر روز، بازگشایی، سقف، کف، بسته‌شدن و حجم معامله محاسبه می‌شود.",
    },
    {
      q: "چه عواملی قیمت پسته را تغییر می‌دهند؟",
      a: "برآورد محصول و سرمازدگی بهاره، ضریب تبدیل مغز به خلال، هزینه‌ی فرآوری و انبارداری، تقاضای فصلی داخلی و نرخ ارز و تقاضای صادراتی.",
    },
  ],
  en: [
    {
      q: "What is today's price of pistachio slivers?",
      a: "The daily rate of every item is shown on this board together with the date of its latest trade. Figures are Iranian rials per kilogram, taken from the official sales ledgers of Darj Tejarat Lia.",
    },
    {
      q: "How often are prices updated?",
      a: "After every recorded trade, the rate and chart of that item are updated; the date of the latest update is always shown next to the figure.",
    },
    {
      q: "Why do slivers cost more than whole pistachio kernels?",
      a: "Producing one kilogram of grade-one slivers consumes about 1.15–1.35 kg of sound kernels, plus cutting, drying and sieving costs — which is why the sliver price is higher.",
    },
    {
      q: "What data is the price chart based on?",
      a: "On real trades recorded in the company's sales ledgers (Iranian years 1404 and 1405). For each day, the open, high, low, close and traded volume are computed.",
    },
    {
      q: "What moves the pistachio price?",
      a: "Crop estimates and spring frost, the kernel-to-sliver conversion ratio, processing and storage costs, seasonal domestic demand, the exchange rate and export demand.",
    },
  ],
  ar: [
    {
      q: "كم سعر شرائح الفستق اليوم؟",
      a: "يظهر سعر اليوم لكل بند على هذه اللوحة مع تاريخ آخر معاملة؛ الأرقام بالريال لكل كيلوغرام ومأخوذة من دفاتر البيع الرسمية لشركة درج تجارت ليا.",
    },
    {
      q: "كل متى تُحدَّث الأسعار؟",
      a: "بعد كل معاملة مسجّلة يُحدَّث سعر البند ورسمه البياني؛ ويظهر تاريخ آخر تحديث دائماً بجانب الرقم.",
    },
    {
      q: "لماذا يختلف سعر الشرائح عن لب الفستق؟",
      a: "لإنتاج كل كيلوغرام من الشرائح من الدرجة الأولى يُستهلك نحو 1.15 إلى 1.35 كغم من اللب السليم، وتُضاف كلفة القطع والتجفيف والغربلة؛ لذلك يكون سعر الشرائح أعلى.",
    },
    {
      q: "على أي بيانات يُرسم مخطط السعر؟",
      a: "على المعاملات الحقيقية المسجّلة في دفاتر البيع (عامي ١٤٠٤ و١٤٠٥)؛ ولكل يوم يُحسب الافتتاح والأعلى والأدنى والإغلاق وحجم التداول.",
    },
    {
      q: "ما العوامل التي تغيّر سعر الفستق؟",
      a: "تقديرات المحصول والصقيع الربيعي، ونسبة تحويل اللب إلى شرائح، وكلفة المعالجة والتخزين، والطلب المحلي الموسمي، وسعر الصرف والطلب التصديري.",
    },
  ],
};

const WHOLESALE_FAQ: Record<Locale, FaqItem[]> = {
  fa: [
    {
      q: "حداقل سفارش خرید عمده خلال پسته چقدر است؟",
      a: "حداقل سفارش عمده از ۲۰ کیلوگرم آغاز می‌شود؛ تخفیف پلکانی از ۱۰۰ کیلوگرم و شرایط قرارداد سالانه از ۵۰۰ کیلوگرم اعمال می‌شود.",
    },
    {
      q: "قیمت عمده خلال پسته چگونه محاسبه می‌شود؟",
      a: "مبنا، قیمت روز تابلوی سایت است که از دفاتر فروش رسمی شرکت درج تجارت لیا استخراج می‌شود؛ سپس تخفیف پله‌ی مربوط به حجم سفارش از آن کسر می‌گردد.",
    },
    {
      q: "امکان دریافت نمونه پیش از سفارش وجود دارد؟",
      a: "بله. برای خریداران صنعتی نمونه‌ی مهرشده همراه برگه‌ی مشخصات (رنگ، رطوبت، درصد خرده) ارسال می‌شود و همان نمونه مبنای تطبیق محموله است.",
    },
    {
      q: "بسته‌بندی و ارسال به چه شکل انجام می‌شود؟",
      a: "بسته‌بندی وکیوم، کارتن صادراتی و امکان درج برند شخصی فراهم است. ارسال از انبار قزوین با باربری سراسری و برای محموله‌های صادراتی با هماهنگی ترخیص انجام می‌شود.",
    },
    {
      q: "آیا گواهی بهداشت و آنالیز آزمایشگاهی ارائه می‌شود؟",
      a: "بله؛ پروانه‌های بهداشتی شرکت در صفحه‌ی پروانه‌ها قابل مشاهده است و برای هر محموله‌ی صادراتی، گواهی آنالیز آزمایشگاه معتبر همراه بار ارسال می‌شود.",
    },
    {
      q: "قیمت تا چه مدت معتبر است؟",
      a: "قیمت اعلامی برای همان روز معامله معتبر است؛ برای مشتریان دائم امکان قرارداد قیمت تضمینی سه‌ماهه وجود دارد.",
    },
  ],
  en: [
    {
      q: "What is the minimum wholesale order for pistachio slivers?",
      a: "Wholesale orders start at 20 kg; tiered discounts apply from 100 kg and annual contract terms from 500 kg.",
    },
    {
      q: "How is the wholesale price calculated?",
      a: "The basis is the daily board price, derived from the official sales ledgers of Darj Tejarat Lia; the discount tier matching your order volume is then deducted.",
    },
    {
      q: "Can I receive a sample before ordering?",
      a: "Yes. Industrial buyers receive a sealed sample with a specification sheet (colour, moisture, breakage percentage), and that sample becomes the reference for the shipment.",
    },
    {
      q: "How are packaging and shipping handled?",
      a: "Vacuum packing, export cartons and private-label printing are available. Shipments leave our Qazvin warehouse via nationwide freight; export consignments are coordinated with customs clearance.",
    },
    {
      q: "Do you provide health permits and laboratory analysis?",
      a: "Yes — the company's health permits are published on the licenses page, and every export consignment travels with an accredited laboratory analysis certificate.",
    },
    {
      q: "How long is a quoted price valid?",
      a: "A quoted price is valid for the trading day it is issued; regular customers can arrange a three-month fixed-price contract.",
    },
  ],
  ar: [
    {
      q: "ما الحد الأدنى للطلب بالجملة من شرائح الفستق؟",
      a: "يبدأ الطلب بالجملة من ٢٠ كغم؛ وتُطبَّق الخصومات التدريجية من ١٠٠ كغم وشروط العقد السنوي من ٥٠٠ كغم.",
    },
    {
      q: "كيف يُحسب سعر الجملة؟",
      a: "الأساس هو سعر اليوم المعروض في لوحة الموقع المستخرج من دفاتر البيع الرسمية لشركة درج تجارت ليا، ثم يُخصم الخصم الموافق لحجم الطلب.",
    },
    {
      q: "هل يمكن الحصول على نموذج قبل الطلب؟",
      a: "نعم. يُرسل للمشترين الصناعيين نموذج مختوم مع ورقة مواصفات (اللون والرطوبة ونسبة الكسر)، ويكون هذا النموذج مرجع مطابقة الشحنة.",
    },
    {
      q: "كيف تتم التعبئة والشحن؟",
      a: "تتوفر التعبئة بالتفريغ الهوائي والكرتون التصديري وإمكانية طبع العلامة الخاصة. يتم الشحن من مستودع قزوين عبر النقل الوطني، وللشحنات التصديرية بالتنسيق مع التخليص الجمركي.",
    },
    {
      q: "هل تُقدَّم شهادات صحية وتحليل مختبري؟",
      a: "نعم؛ تراخيص الشركة الصحية معروضة في صفحة التراخيص، ولكل شحنة تصديرية تُرفق شهادة تحليل من مختبر معتمد.",
    },
    {
      q: "إلى متى يبقى السعر ساري المفعول؟",
      a: "السعر المعلن ساري ليوم المعاملة نفسه؛ وللعملاء الدائمين إمكانية عقد سعر مضمون لثلاثة أشهر.",
    },
  ],
};

export function priceFaq(locale: Locale) {
  return PRICE_FAQ[locale] ?? PRICE_FAQ.fa;
}
export function wholesaleFaq(locale: Locale) {
  return WHOLESALE_FAQ[locale] ?? WHOLESALE_FAQ.fa;
}
