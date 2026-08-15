// Server-only data layer. Supabase is the single source of truth for
// products, price history, site settings and custom articles.
import { createClient } from "@supabase/supabase-js";

import type { Article, Product, SiteData, SiteSettings } from "./site-types";

type Row = Record<string, unknown>;

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as ReturnType<typeof publicClient>;
}

function num(v: unknown): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function mapSettings(r: Row | null): SiteSettings | null {
  if (!r) return null;
  return {
    brandName: str(r["brand_name"]),
    brandLatin: str(r["brand_latin"]),
    brandTagline: str(r["brand_tagline"]),
    currency: str(r["currency"]),
    heroTitle: str(r["hero_title"]),
    heroSubtitle: str(r["hero_subtitle"]),
    aboutText: str(r["about_text"]),
    contactPhone: str(r["contact_phone"]),
    contactAddress: str(r["contact_address"]),
    contactEmail: str(r["contact_email"]),
    contactWhatsapp: str(r["contact_whatsapp"]),
    instagram: str(r["instagram"]),
    telegram: str(r["telegram"]),
    workingHours: str(r["working_hours"]),
    foundedYear: str(r["founded_year"]),
    missionText: str(r["mission_text"]),
    exportText: str(r["export_text"]),
    seoTitle: str(r["seo_title"]),
    seoDescription: str(r["seo_description"]),
    announcement: str(r["announcement"]),
    priceSource: str(r["price_source"]),
    siteUrl: str(r["site_url"]),
    wholesaleTiers: Array.isArray(r["wholesale_tiers"]) ? (r["wholesale_tiers"] as never) : [],
    wholesaleBenefits: Array.isArray(r["wholesale_benefits"])
      ? (r["wholesale_benefits"] as never)
      : [],
  };
}

function settingsToRow(s: Partial<SiteSettings>): Row {
  const map: Record<keyof SiteSettings, string> = {
    brandName: "brand_name",
    brandLatin: "brand_latin",
    brandTagline: "brand_tagline",
    currency: "currency",
    heroTitle: "hero_title",
    heroSubtitle: "hero_subtitle",
    aboutText: "about_text",
    contactPhone: "contact_phone",
    contactAddress: "contact_address",
    contactEmail: "contact_email",
    contactWhatsapp: "contact_whatsapp",
    instagram: "instagram",
    telegram: "telegram",
    workingHours: "working_hours",
    foundedYear: "founded_year",
    missionText: "mission_text",
    exportText: "export_text",
    seoTitle: "seo_title",
    seoDescription: "seo_description",
    announcement: "announcement",
    priceSource: "price_source",
    siteUrl: "site_url",
    wholesaleTiers: "wholesale_tiers",
    wholesaleBenefits: "wholesale_benefits",
  };
  const out: Row = {};
  for (const [k, col] of Object.entries(map)) {
    const v = (s as Row)[k];
    if (v !== undefined) out[col] = v;
  }
  return out;
}

export async function readSiteData(): Promise<SiteData> {
  const db = publicClient();
  const [products, history, settings, articles] = await Promise.all([
    db.from("products").select("*").order("priority", { ascending: false }),
    db.from("price_history").select("*").order("date", { ascending: true }),
    db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    db.from("articles").select("*").order("date", { ascending: false }),
  ]);

  const byProduct = new Map<string, Row[]>();
  for (const h of (history.data ?? []) as Row[]) {
    const key = str(h["product_id"]);
    const list = byProduct.get(key) ?? [];
    list.push(h);
    byProduct.set(key, list);
  }

  const mapped: Product[] = ((products.data ?? []) as Row[]).map((p) => {
    const hist = (byProduct.get(str(p["id"])) ?? []).map((h) => ({
      date: str(h["date"]).slice(0, 10),
      price: num(h["close"]),
      open: num(h["open"]),
      high: num(h["high"]),
      low: num(h["low"]),
      close: num(h["close"]),
      volume: num(h["volume"]),
    }));
    const last = hist[hist.length - 1];
    return {
      id: str(p["id"]),
      slug: str(p["slug"]),
      name: str(p["name"]),
      category: str(p["category"]) as Product["category"],
      price: num(p["price"]) || last?.price || 0,
      unit: str(p["unit"]),
      origin: str(p["origin"]),
      grade: str(p["grade"]),
      description: str(p["description"]),
      priority: num(p["priority"]),
      active: Boolean(p["active"]),
      featured: Boolean(p["featured"]),
      updatedAt: str(p["updated_at"]).slice(0, 10) || last?.date || "",
      history: hist,
      passport: (p["passport"] as Product["passport"]) ?? undefined,
    };
  });

  return {
    products: mapped,
    settings: mapSettings((settings.data as Row) ?? null) ?? ({} as SiteSettings),
    articles: ((articles.data ?? []) as Row[]).map((a) => ({
      slug: str(a["slug"]),
      title: str(a["title"]),
      dek: str(a["dek"]),
      category: str(a["category"]) as Article["category"],
      date: str(a["date"]).slice(0, 10),
      minutes: num(a["minutes"]),
      tags: (a["tags"] as string[]) ?? [],
      body: (a["body"] as string[]) ?? [],
    })),
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Keeps products.price and the newest price_history close in sync. */
async function syncProductPrice(productId: string): Promise<void> {
  const db = await admin();
  const { data: newest } = await db
    .from("price_history")
    .select("date, close")
    .eq("product_id", productId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  const close = num((newest as Row | null)?.["close"]);
  if (!close) return;
  await db
    .from("products")
    .update({ price: Math.round(close), updated_at: new Date().toISOString() })
    .eq("id", productId);
}

/** Writes today's OHLC row so a manual price edit shows up on the chart. */
async function stampTodayPrice(productId: string, price: number): Promise<void> {
  if (!price || price <= 0) return;
  const db = await admin();
  const today = new Date().toISOString().slice(0, 10);
  const { data: prev } = await db
    .from("price_history")
    .select("date, close, open, high, low, volume")
    .eq("product_id", productId)
    .lte("date", today)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  const prevRow = prev as Row | null;
  const isToday = str(prevRow?.["date"]).slice(0, 10) === today;
  const open = isToday ? num(prevRow?.["open"]) || price : num(prevRow?.["close"]) || price;
  const high = Math.max(open, price, isToday ? num(prevRow?.["high"]) : 0);
  const low = Math.min(open, price, isToday ? num(prevRow?.["low"]) || price : price);
  await db.from("price_history").delete().eq("product_id", productId).eq("date", today);
  const { error } = await db.from("price_history").insert({
    product_id: productId,
    date: today,
    open: Math.round(open),
    high: Math.round(high),
    low: Math.round(low),
    close: Math.round(price),
    volume: isToday ? Math.round(num(prevRow?.["volume"])) : 0,
  });
  if (error) throw new Error(error.message);
}

export async function writeProduct(p: Product): Promise<void> {
  const db = await admin();
  const row: Row = {
    slug: p.slug || p.id,
    name: p.name,
    category: p.category,
    price: Math.round(p.price),
    unit: p.unit,
    origin: p.origin,
    grade: p.grade,
    description: p.description,
    priority: p.priority,
    active: p.active,
    featured: p.featured,
    passport: p.passport ?? null,
    updated_at: new Date().toISOString(),
  };
  if (p.id && UUID.test(p.id)) {
    const { error } = await db.from("products").update(row).eq("id", p.id);
    if (error) throw new Error(error.message);
    await stampTodayPrice(p.id, Math.round(p.price));
    return;
  }
  const { data: created, error } = await db.from("products").insert(row).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  const newId = str((created as Row | null)?.["id"]);
  if (newId) await stampTodayPrice(newId, Math.round(p.price));
}


export async function removeProduct(id: string): Promise<void> {
  const db = await admin();
  await db.from("price_history").delete().eq("product_id", id);
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function writePricePoints(
  productId: string,
  points: {
    date: string;
    price: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  }[],
): Promise<void> {
  if (!points.length) return;
  const db = await admin();
  const dates = points.map((p) => p.date);
  await db.from("price_history").delete().eq("product_id", productId).in("date", dates);
  const rows = points.map((p) => ({
    product_id: productId,
    date: p.date,
    open: Math.round(p.open ?? p.price),
    high: Math.round(p.high ?? p.price),
    low: Math.round(p.low ?? p.price),
    close: Math.round(p.close ?? p.price),
    volume: Math.round(p.volume ?? 0),
  }));
  const { error } = await db.from("price_history").insert(rows);
  if (error) throw new Error(error.message);

  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const { data: newest } = await db
    .from("price_history")
    .select("date, close")
    .eq("product_id", productId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  const close = num((newest as Row | null)?.["close"]) || last.price;
  await db
    .from("products")
    .update({ price: Math.round(close), updated_at: new Date().toISOString() })
    .eq("id", productId);
}

export async function removePricePoint(productId: string, date: string): Promise<void> {
  const db = await admin();
  const { error } = await db
    .from("price_history")
    .delete()
    .eq("product_id", productId)
    .eq("date", date);
  if (error) throw new Error(error.message);
}

export async function writeSettings(patch: Partial<SiteSettings>): Promise<void> {
  const db = await admin();
  const row = settingsToRow(patch);
  if (!Object.keys(row).length) return;
  row["updated_at"] = new Date().toISOString();
  const { error } = await db.from("site_settings").update(row).eq("id", 1);
  if (error) throw new Error(error.message);
}

export async function writeArticle(a: Article): Promise<void> {
  const db = await admin();
  const { error } = await db.from("articles").upsert(
    {
      slug: a.slug,
      title: a.title,
      dek: a.dek,
      category: a.category,
      date: a.date,
      minutes: a.minutes,
      tags: a.tags,
      body: a.body,
      published: true,
    },
    { onConflict: "slug" },
  );
  if (error) throw new Error(error.message);
}

export async function removeArticle(slug: string): Promise<void> {
  const db = await admin();
  const { error } = await db.from("articles").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}
