import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function supabasePublic() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export async function enrichWithLatestPrice(
  supabase: ReturnType<typeof supabasePublic>,
  products: ProductRow[],
) {
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const { data } = await supabase
    .from("price_history")
    .select("product_id, date, close")
    .in("product_id", ids)
    .order("date", { ascending: false });
  const byProduct = new Map<string, { date: string; close: number }[]>();
  for (const row of data ?? []) {
    const arr = byProduct.get(row.product_id) ?? [];
    arr.push({ date: row.date, close: row.close });
    byProduct.set(row.product_id, arr);
  }
  return products.map((p) => {
    const rows = byProduct.get(p.id) ?? [];
    const latest = rows[0]?.close ?? null;
    const prev = rows[1]?.close ?? null;
    const change_24h =
      latest != null && prev != null && prev !== 0
        ? Number((((latest - prev) / prev) * 100).toFixed(2))
        : null;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      unit: p.unit,
      grade: p.grade,
      origin: p.origin,
      description: p.description,
      featured: p.featured,
      current_price_irr: latest,
      change_24h_percent: change_24h,
      last_updated: rows[0]?.date ?? null,
    };
  });
}
