import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Article, Product, SiteData, SiteSettings } from "./site-types";

export const getSiteData = createServerFn({ method: "GET" }).handler(async (): Promise<SiteData> => {
  const { readSiteData } = await import("./site-data.server");
  return readSiteData();
});

export const adminSaveProduct = createServerFn({ method: "POST" })
  .inputValidator((data: { product: Product }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { writeProduct } = await import("./site-data.server");
    await writeProduct(data.product);
    return { ok: true as const };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { removeProduct } = await import("./site-data.server");
    await removeProduct(data.id);
    return { ok: true as const };
  });

const PointSchema = z.object({
  date: z.string().min(8).max(10),
  price: z.number().finite(),
  open: z.number().finite().optional(),
  high: z.number().finite().optional(),
  low: z.number().finite().optional(),
  close: z.number().finite().optional(),
  volume: z.number().finite().optional(),
});

export const adminSavePricePoints = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({ productId: z.string().min(1), points: z.array(PointSchema).min(1).max(2000) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { writePricePoints } = await import("./site-data.server");
    await writePricePoints(data.productId, data.points);
    return { ok: true as const };
  });

export const adminDeletePricePoint = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ productId: z.string().min(1), date: z.string().min(8).max(10) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { removePricePoint } = await import("./site-data.server");
    await removePricePoint(data.productId, data.date);
    return { ok: true as const };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .inputValidator((data: { settings: Partial<SiteSettings> }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { writeSettings } = await import("./site-data.server");
    await writeSettings(data.settings);
    return { ok: true as const };
  });

export const adminSaveArticle = createServerFn({ method: "POST" })
  .inputValidator((data: { article: Article }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { writeArticle } = await import("./site-data.server");
    await writeArticle(data.article);
    return { ok: true as const };
  });

export const adminDeleteArticle = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const { removeArticle } = await import("./site-data.server");
    await removeArticle(data.slug);
    return { ok: true as const };
  });

export const adminImportData = createServerFn({ method: "POST" })
  .inputValidator((data: { products?: Product[]; settings?: Partial<SiteSettings>; articles?: Article[] }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const mod = await import("./site-data.server");
    if (data.settings) await mod.writeSettings(data.settings);
    for (const p of data.products ?? []) {
      await mod.writeProduct(p);
      if (p.history?.length) await mod.writePricePoints(p.id, p.history);
    }
    for (const a of data.articles ?? []) await mod.writeArticle(a);
    return { ok: true as const };
  });
