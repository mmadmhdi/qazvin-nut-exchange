import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,

  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";
import { Header, Footer } from "@/components/site/Chrome";
import { Toaster } from "sonner";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { GreenCurator } from "@/components/site/GreenCurator";
import { MobileNav } from "@/components/site/MobileNav";
import { LocaleProvider, useTranslation } from "@/lib/i18n-provider";
import { parseLocale } from "@/lib/i18n";

function NotFoundComponent() {
  const { t, locale } = useTranslation();
  const links: { to: string; label: string }[] = [
    { to: "/", label: t("nav.home") },
    { to: "/market", label: t("nav.market") },
    { to: "/products", label: t("nav.products") },
    { to: "/journal", label: t("nav.journal") },
    { to: "/wholesale", label: t("nav.wholesale") },
    { to: "/contact", label: t("nav.contact") },
  ];
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-olive-deep">{locale === "en" ? "404" : locale === "ar" ? "٤٠٤" : "۴۰۴"}</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{locale === "en" ? "Page not found" : locale === "ar" ? "الصفحة غير موجودة" : "صفحه یافت نشد"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "en" ? "The requested address is unavailable. Choose one of these pages." : locale === "ar" ? "العنوان المطلوب غير متاح. اختر إحدى الصفحات التالية." : "آدرس مورد نظر در دسترس نیست. یکی از مسیرهای زیر را انتخاب کنید."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-sm border border-brass/40 px-4 py-2 text-sm text-olive-deep hover:bg-cream tracking-widest"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  const { locale } = useTranslation();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl text-olive-deep">{locale === "en" ? "This page could not load" : locale === "ar" ? "تعذر تحميل هذه الصفحة" : "این صفحه بارگذاری نشد"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{locale === "en" ? "Please try again." : locale === "ar" ? "يرجى المحاولة مرة أخرى." : "می‌توانید دوباره تلاش کنید."}</p>
        <div className="mt-6">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
          >
            {locale === "en" ? "Try again" : locale === "ar" ? "حاول مرة أخرى" : "تلاش دوباره"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "Wo5DpZwngLhLKvwp-1c3qk6gT3_xLOpufe0uxNGBd1s" },
      { name: "google-site-verification", content: "L1KQDNlL23VU3WNb3B8u-WcILbYJ1GDZJLFvAuRTX80" },
      { title: "درج سبز قزوین — بازار خلال پسته" },
      { name: "description", content: "قیمت روز و نمودار تاریخی خلال پسته قزوین و بویین، به همراه سایر محصولات خشکبار." },
      { property: "og:title", content: "درج سبز قزوین — بازار خلال پسته" },
      { property: "og:description", content: "قیمت شفاف خلال پسته و خشکبار، با روایتی از میراث خانوادگی قزوین." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://qazvin-nut-exchange.lovable.app/#website",
              url: "https://qazvin-nut-exchange.lovable.app/",
              name: "درج سبز قزوین",
              alternateName: "Darj Sabz Qazvin",
              inLanguage: "fa-IR",
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://qazvin-nut-exchange.lovable.app/#business",
              name: "درج سبز قزوین (درج تجارت لیا)",
              url: "https://qazvin-nut-exchange.lovable.app/",
              image: "https://qazvin-nut-exchange.lovable.app/images/dorjesabz-logo.jpg",
              logo: "https://qazvin-nut-exchange.lovable.app/images/dorjesabz-logo.jpg",
              telephone: "+982833455010",
              email: "mmd85mmd@gmail.com",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IR",
                addressRegion: "قزوین",
                addressLocality: "شهر صنعتی لیا",
              },
              description:
                "تولید و عرضه خلال مغز پسته و خشکبار با قیمت شفاف روز و شناسنامه اصالت باغ.",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const locale = useRouterState({ select: (st) => parseLocale(st.location.searchStr) });
  return (
    <html lang={locale} dir={locale === "en" ? "ltr" : "rtl"} suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* English/Arabic variants exist for visitors only — keep them out of search results */}
        {locale !== "fa" && <meta name="robots" content="noindex, follow" />}
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <LocaleProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1"><Outlet /></main>
          <Footer />
          <div className="h-16 lg:hidden" aria-hidden="true" />
        </div>
        <WhatsAppFab />
        <GreenCurator />
        <MobileNav />
        <LocalizedToaster />
        </LocaleProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

function LocalizedToaster() {
  const { dir } = useTranslation();
  return <Toaster richColors position="top-center" dir={dir} />;
}
