import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,

  createRootRouteWithContext,
  useRouter,
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

function NotFoundComponent() {
  const links: { to: string; label: string }[] = [
    { to: "/", label: "خانه" },
    { to: "/market", label: "تابلوی بازار" },
    { to: "/products", label: "محصولات" },
    { to: "/journal", label: "دفتر سبز" },
    { to: "/wholesale", label: "خرید عمده" },
    { to: "/contact", label: "تماس" },
  ];
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-olive-deep">۴۰۴</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">صفحه یافت نشد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          آدرس مورد نظر در دسترس نیست. یکی از مسیرهای زیر را انتخاب کنید.
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


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl text-olive-deep">این صفحه بارگذاری نشد</h1>
        <p className="mt-2 text-sm text-muted-foreground">می‌توانید دوباره تلاش کنید.</p>
        <div className="mt-6">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-sm bg-olive-deep px-4 py-2 text-sm text-paper hover:bg-olive"
          >
            تلاش دوباره
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
              "@id": "https://peste.es/#website",
              url: "https://peste.es/",
              name: "درج سبز قزوین",
              alternateName: "Darj Sabz Qazvin",
              inLanguage: "fa-IR",
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://peste.es/#business",
              name: "درج سبز قزوین (درج تجارت لیا)",
              url: "https://peste.es/",
              image: "https://peste.es/images/dorjesabz-logo.jpg",
              logo: "https://peste.es/images/dorjesabz-logo.jpg",
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
  return (
    <html lang="fa" dir="rtl">
      <head><HeadContent /></head>
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
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1"><Outlet /></main>
          <Footer />
        </div>
        <WhatsAppFab />
        <GreenCurator />
        <Toaster richColors position="top-center" dir="rtl" />
      </StoreProvider>
    </QueryClientProvider>
  );
}
