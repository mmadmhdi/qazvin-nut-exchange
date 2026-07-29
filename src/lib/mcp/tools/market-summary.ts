import { defineTool } from "@lovable.dev/mcp-js";
import { supabasePublic, enrichWithLatestPrice } from "./_shared";

export default defineTool({
  name: "market_summary",
  title: "خلاصه بازار امروز",
  description:
    "Snapshot of today's Darj Sabz Qazvin dry-fruit market: number of tracked products, top gainers and top losers by 24h change percent (computed from OHLC history), and brand contact info.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = supabasePublic();
    const [productsRes, settingsRes] = await Promise.all([
      supabase.from("products").select("*").eq("active", true),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (productsRes.error) {
      return { content: [{ type: "text", text: productsRes.error.message }], isError: true };
    }
    const enriched = await enrichWithLatestPrice(supabase, productsRes.data ?? []);
    const sorted = [...enriched].sort(
      (a, b) => (b.change_24h_percent ?? 0) - (a.change_24h_percent ?? 0),
    );
    const s = settingsRes.data;
    const summary = {
      total_products: enriched.length,
      top_gainers: sorted.slice(0, 3),
      top_losers: sorted.slice(-3).reverse(),
      brand: s
        ? {
            name: s.brand_name,
            latin: s.brand_latin,
            tagline: s.brand_tagline,
            phone: s.contact_phone,
            email: s.contact_email,
            address: s.contact_address,
            currency: s.currency,
          }
        : null,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
