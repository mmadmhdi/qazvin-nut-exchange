import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function supabasePublic() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "get_price_history",
  title: "تاریخچه قیمت",
  description:
    "Get OHLC daily price history (in IRR) for a product by slug. Returns date, open, high, low, close, volume — newest last. Useful for charts and trend analysis.",
  inputSchema: {
    slug: z.string().describe("Product slug."),
    days: z
      .number()
      .int()
      .optional()
      .describe("Number of most recent days to return. Defaults to 90, hard-capped to 365."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug, days }) => {
    const supabase = supabasePublic();
    const limit = Math.min(Math.max(days ?? 90, 1), 365);
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("id, name, slug, unit")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };
    if (!product) return { content: [{ type: "text", text: `No product with slug '${slug}'` }], isError: true };

    const { data, error } = await supabase
      .from("price_history")
      .select("date, open, high, low, close, volume")
      .eq("product_id", product.id)
      .order("date", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const series = (data ?? []).slice().reverse();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ product, count: series.length, series }, null, 2),
        },
      ],
      structuredContent: { product, series },
    };
  },
});
