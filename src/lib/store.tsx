import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PricePoint = {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  origin: string;
  grade: string;
  description: string;
  priority: number;
  active: boolean;
  featured: boolean;
  updatedAt: string;
  history: PricePoint[];
};

export type SiteSettings = {
  brandName: string;
  brandLatin: string;
  brandTagline: string;
  currency: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  contactPhone: string;
  contactAddress: string;
  contactEmail: string;
};

const FALLBACK_SETTINGS: SiteSettings = {
  brandName: "درج سبز قزوین",
  brandLatin: "Darj Sabz · Qazvin",
  brandTagline: "درج سبز؛ مرجع قیمت خلال پسته قزوین",
  currency: "ریال",
  heroTitle: "بازار خلال پسته، اصیل و شفاف",
  heroSubtitle: "تابلوی رسمی قیمت خلال پسته قزوین و بویین.",
  aboutText: "",
  contactPhone: "",
  contactAddress: "",
  contactEmail: "",
};

export function slugify(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .toLowerCase();
}

export function computeChange(history: PricePoint[]): { pct: number; abs: number } {
  if (history.length < 2) return { pct: 0, abs: 0 };
  const last = history[history.length - 1].price;
  const prev = history[history.length - 2].price;
  return { pct: ((last - prev) / prev) * 100, abs: last - prev };
}

type RawProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  unit: string;
  origin: string;
  grade: string;
  description: string;
  priority: number;
  active: boolean;
  featured: boolean;
  updated_at: string;
};
type RawHistory = {
  product_id: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
type RawSettings = {
  brand_name: string;
  brand_latin: string;
  brand_tagline: string;
  currency: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  contact_phone: string;
  contact_address: string;
  contact_email: string;
};

const K_PRODUCTS = ["products"] as const;
const K_HISTORY = ["price_history"] as const;
const K_SETTINGS = ["site_settings"] as const;

async function fetchProducts(): Promise<RawProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("priority", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RawProduct[];
}
async function fetchHistory(): Promise<RawHistory[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  const { data, error } = await supabase
    .from("price_history")
    .select("product_id,date,open,high,low,close,volume")
    .gte("date", cutoff.toISOString().slice(0, 10))
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RawHistory[];
}
async function fetchSettings(): Promise<RawSettings | null> {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data as RawSettings | null);
}

function mapSettings(r: RawSettings | null | undefined): SiteSettings {
  if (!r) return FALLBACK_SETTINGS;
  return {
    brandName: r.brand_name,
    brandLatin: r.brand_latin,
    brandTagline: r.brand_tagline,
    currency: r.currency,
    heroTitle: r.hero_title,
    heroSubtitle: r.hero_subtitle,
    aboutText: r.about_text,
    contactPhone: r.contact_phone,
    contactAddress: r.contact_address,
    contactEmail: r.contact_email,
  };
}

type StoreCtx = {
  ready: boolean;
  loading: boolean;
  error: Error | null;
  products: Product[];
  settings: SiteSettings;
  saveProduct: (p: Product & { isNew?: boolean }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addPricePoint: (id: string, point: PricePoint) => Promise<void>;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
};

// A pass-through provider is kept for API compat.
export function StoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useStore(): StoreCtx {
  const qc = useQueryClient();
  const productsQ = useQuery({ queryKey: K_PRODUCTS, queryFn: fetchProducts, staleTime: 60_000 });
  const historyQ = useQuery({ queryKey: K_HISTORY, queryFn: fetchHistory, staleTime: 60_000 });
  const settingsQ = useQuery({ queryKey: K_SETTINGS, queryFn: fetchSettings, staleTime: 300_000 });

  const products = useMemo<Product[]>(() => {
    const raw = productsQ.data ?? [];
    const hist = historyQ.data ?? [];
    const byProduct = new Map<string, PricePoint[]>();
    for (const h of hist) {
      const pt: PricePoint = {
        date: h.date,
        price: h.close,
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close,
        volume: h.volume,
      };
      const arr = byProduct.get(h.product_id) ?? [];
      arr.push(pt);
      byProduct.set(h.product_id, arr);
    }
    return raw.map((p) => {
      const history = byProduct.get(p.id) ?? [];
      const last = history[history.length - 1];
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: last?.close ?? 0,
        unit: p.unit,
        origin: p.origin,
        grade: p.grade,
        description: p.description,
        priority: p.priority,
        active: p.active,
        featured: p.featured,
        updatedAt: last?.date ?? p.updated_at?.slice(0, 10) ?? "",
        history,
      };
    });
  }, [productsQ.data, historyQ.data]);

  const settings = useMemo(() => mapSettings(settingsQ.data), [settingsQ.data]);

  const saveProductMut = useMutation({
    mutationFn: async (p: Product & { isNew?: boolean }) => {
      const row = {
        slug: p.slug || slugify(p.name),
        name: p.name,
        category: p.category,
        unit: p.unit,
        origin: p.origin,
        grade: p.grade,
        description: p.description,
        priority: p.priority,
        active: p.active,
        featured: p.featured,
      };
      if (p.isNew) {
        const { error } = await supabase.from("products").insert(row);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update(row).eq("id", p.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K_PRODUCTS }),
  });

  const deleteProductMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: K_PRODUCTS });
      qc.invalidateQueries({ queryKey: K_HISTORY });
    },
  });

  const addPricePointMut = useMutation({
    mutationFn: async ({ id, point }: { id: string; point: PricePoint }) => {
      const close = Math.round(point.close ?? point.price);
      const open = Math.round(point.open ?? close);
      const high = Math.round(point.high ?? Math.max(open, close));
      const low = Math.round(point.low ?? Math.min(open, close));
      const volume = Math.round(point.volume ?? 0);
      // upsert on (product_id,date)
      const { error } = await supabase
        .from("price_history")
        .upsert(
          { product_id: id, date: point.date, open, high, low, close, volume },
          { onConflict: "product_id,date" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K_HISTORY }),
  });

  const updateSettingsMut = useMutation({
    mutationFn: async (s: Partial<SiteSettings>) => {
      const row: Record<string, unknown> = {};
      if (s.brandName !== undefined) row.brand_name = s.brandName;
      if (s.brandLatin !== undefined) row.brand_latin = s.brandLatin;
      if (s.brandTagline !== undefined) row.brand_tagline = s.brandTagline;
      if (s.currency !== undefined) row.currency = s.currency;
      if (s.heroTitle !== undefined) row.hero_title = s.heroTitle;
      if (s.heroSubtitle !== undefined) row.hero_subtitle = s.heroSubtitle;
      if (s.aboutText !== undefined) row.about_text = s.aboutText;
      if (s.contactPhone !== undefined) row.contact_phone = s.contactPhone;
      if (s.contactAddress !== undefined) row.contact_address = s.contactAddress;
      if (s.contactEmail !== undefined) row.contact_email = s.contactEmail;
      const { error } = await supabase.from("site_settings").update(row).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K_SETTINGS }),
  });

  return {
    ready: !productsQ.isLoading && !historyQ.isLoading && !settingsQ.isLoading,
    loading: productsQ.isLoading || historyQ.isLoading || settingsQ.isLoading,
    error: (productsQ.error ?? historyQ.error ?? settingsQ.error) as Error | null,
    products,
    settings,
    saveProduct: (p) => saveProductMut.mutateAsync(p),
    deleteProduct: (id) => deleteProductMut.mutateAsync(id),
    addPricePoint: (id, point) => addPricePointMut.mutateAsync({ id, point }),
    updateSettings: (s) => updateSettingsMut.mutateAsync(s),
  };
}

export function useProductBySlug(slug: string): Product | undefined {
  const { products } = useStore();
  return products.find((p) => p.slug === slug || p.id === slug);
}
