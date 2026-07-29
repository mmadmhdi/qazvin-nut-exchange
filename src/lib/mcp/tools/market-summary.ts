import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function supabasePublic() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "market_summary",
  title: "خلاصه بازار امروز",
  description:
    "Snapshot of today's dry-fruit market: number of products tracked, top gainers and top losers by 24h change percent, and the brand's business hours.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = supabasePublic();
    const [productsRes, settingsRes] = await Promise.all([
      supabase
        .from("products")
        .select("name, slug, category, unit, current_price, change_24h")
        .eq("is_active", true),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (productsRes.error) {
      return { content: [{ type: "text", text: productsRes.error.message }], isError: true };
    }
    const products = productsRes.data ?? [];
    const sorted = [...products].sort(
      (a, b) => (b.change_24h ?? 0) - (a.change_24h ?? 0),
    );
    const summary = {
      total_products: products.length,
      top_gainers: sorted.slice(0, 3),
      top_losers: sorted.slice(-3).reverse(),
      brand: settingsRes.data
        ? {
            name: settingsRes.data.brand_name,
            tagline: settingsRes.data.tagline,
            hours: settingsRes.data.business_hours,
            phone: settingsRes.data.phone,
          }
        : null,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
