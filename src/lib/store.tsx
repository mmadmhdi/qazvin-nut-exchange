import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  adminDeleteArticle,
  adminDeletePricePoint,
  adminDeleteProduct,
  adminImportData,
  adminSaveArticle,
  adminSavePricePoints,
  adminSaveProduct,
  adminUpdateSettings,
  getSiteData,
} from "./site-data.functions";
import type {
  Article,
  Passport,
  PricePoint,
  Product,
  SiteData,
  SiteSettings,
  WholesaleBenefit,
  WholesaleTier,
} from "./site-types";

export type {
  Article,
  Passport,
  PricePoint,
  Product,
  SiteData,
  SiteSettings,
  WholesaleBenefit,
  WholesaleTier,
};

/** Branding fallback used only while the first request is in flight. */
const FALLBACK_SETTINGS: SiteSettings = {
  brandName: "درج سبز قزوین",
  brandLatin: "DorjeSabz · Qazvin",
  brandTagline: "درج سبز؛ مرجع قیمت خلال پسته و بادام قزوین",
  currency: "ریال",
  heroTitle: "بازار خلال پسته، اصیل و شفاف",
  heroSubtitle: "",
  aboutText: "",
  contactPhone: "۰۲۸-۳۳۴۵۵۰۱۰",
  contactAddress: "استان قزوین، شهرک صنعتی لیا — شرکت درج تجارت لیا",
  contactEmail: "info@dorjesabz.com",
  wholesaleTiers: [],
  wholesaleBenefits: [],
};

type StoreCtx = SiteData & {
  ready: boolean;
  refresh: () => Promise<void>;
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addPricePoint: (id: string, point: PricePoint) => Promise<void>;
  removePricePoint: (id: string, date: string) => Promise<void>;
  bulkPricePoints: (id: string, points: PricePoint[]) => Promise<void>;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
  saveArticle: (a: Article) => Promise<void>;
  deleteArticle: (slug: string) => Promise<void>;
  exportData: () => string;
  importData: (json: string) => Promise<boolean>;
};

const StoreContext = createContext<StoreCtx | null>(null);

export function slugify(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .toLowerCase();
}

export const SITE_DATA_KEY = ["site-data"] as const;

export function StoreProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: SITE_DATA_KEY,
    queryFn: () => getSiteData(),
    staleTime: 60_000,
  });

  const data = query.data;

  const value: StoreCtx = useMemo(() => {
    const refresh = async () => {
      await queryClient.invalidateQueries({ queryKey: SITE_DATA_KEY });
    };
    return {
      products: data?.products ?? [],
      settings: data?.settings?.brandName ? data.settings : FALLBACK_SETTINGS,
      articles: data?.articles ?? [],
      ready: Boolean(data),
      refresh,
      async saveProduct(p) {
        await adminSaveProduct({ data: { product: p } });
        await refresh();
      },
      async deleteProduct(id) {
        await adminDeleteProduct({ data: { id } });
        await refresh();
      },
      async addPricePoint(id, point) {
        await adminSavePricePoints({ data: { productId: id, points: [point] } });
        await refresh();
      },
      async removePricePoint(id, date) {
        await adminDeletePricePoint({ data: { productId: id, date } });
        await refresh();
      },
      async bulkPricePoints(id, points) {
        if (!points.length) return;
        await adminSavePricePoints({ data: { productId: id, points } });
        await refresh();
      },
      async updateSettings(s) {
        await adminUpdateSettings({ data: { settings: s } });
        await refresh();
      },
      async saveArticle(a) {
        await adminSaveArticle({ data: { article: a } });
        await refresh();
      },
      async deleteArticle(slug) {
        await adminDeleteArticle({ data: { slug } });
        await refresh();
      },
      exportData() {
        return JSON.stringify(
          {
            products: data?.products ?? [],
            settings: data?.settings ?? {},
            articles: data?.articles ?? [],
          },
          null,
          2,
        );
      },
      async importData(json) {
        try {
          const parsed = JSON.parse(json) as Partial<SiteData>;
          if (!parsed?.products && !parsed?.settings) return false;
          await adminImportData({
            data: {
              products: parsed.products,
              settings: parsed.settings,
              articles: parsed.articles,
            },
          });
          await refresh();
          return true;
        } catch {
          return false;
        }
      },
    };
  }, [data, queryClient]);

  if (query.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-2xl text-olive-deep">اطلاعات بازار در دسترس نیست</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ارتباط با پایگاه داده برقرار نشد. لطفاً صفحه را دوباره بارگذاری کنید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StoreContext.Provider value={value}>
      {data ? (
        children
      ) : (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brass/40 border-t-olive-deep" />
            <p className="mt-4 text-xs tracking-[0.3em] uppercase text-muted-foreground">
              DORJESABZ
            </p>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useProductBySlug(slug: string): Product | undefined {
  const { products } = useStore();
  return products.find((p) => p.slug === slug || p.id === slug);
}

export function computeChange(history: PricePoint[]): { pct: number; abs: number } {
  if (history.length < 2) return { pct: 0, abs: 0 };
  const last = history[history.length - 1].price;
  const prev = history[history.length - 2].price;
  if (!prev) return { pct: 0, abs: 0 };
  return { pct: ((last - prev) / prev) * 100, abs: last - prev };
}
