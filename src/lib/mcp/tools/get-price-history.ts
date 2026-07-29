import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabasePublic } from "./_shared";

export default defineTool({
  name: "get_price_history",
  title: "تاریخچه قیمت",
  description:
    "Get OHLC daily price history in Iranian Rial (IRR) for a product by slug. Returns date, open, high, low, close, volume — oldest first. Useful for charts, technical analysis and trend detection.",
  inputSchema: {
    slug: z.string().describe("Product slug."),
    days: z
      .number()
      .int()
      .optional()
      .describe("Number of most recent days to return. Defaults to 90; hard-capped to 365."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug, days }) => {
    const supabase = supabasePublic();
    const limit = Math.min(Math.max(days ?? 90, 1), 365);
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("id, name, slug, unit")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };
    if (!product)
      return { content: [{ type: "text", text: `No product with slug '${slug}'` }], isError: true };

    const { data, error } = await supabase
      .from("price_history")
      .select("date, open, high, low, close, volume")
      .eq("product_id", product.id)
      .order("date", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const series = (data ?? []).slice().reverse();
    const payload = { product, count: series.length, series };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
