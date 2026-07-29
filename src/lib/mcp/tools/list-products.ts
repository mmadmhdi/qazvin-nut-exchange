import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabasePublic, enrichWithLatestPrice } from "./_shared";

export default defineTool({
  name: "list_products",
  title: "فهرست محصولات",
  description:
    "List all active dry-fruit products (Persian pistachios, saffron, etc.) with slug, category, unit, latest close price in Iranian Rial (IRR) and 24h change percent computed from daily price history.",
  inputSchema: {
    category: z
      .string()
      .optional()
      .describe("Optional category filter, e.g. 'pistachio', 'saffron', 'nuts'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category }) => {
    const supabase = supabasePublic();
    let query = supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("priority", { ascending: false })
      .order("name");
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const products = await enrichWithLatestPrice(supabase, data ?? []);
    return {
      content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
      structuredContent: { products },
    };
  },
});
