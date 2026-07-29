import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabasePublic, enrichWithLatestPrice } from "./_shared";

export default defineTool({
  name: "get_product",
  title: "جزئیات محصول",
  description:
    "Get a single product's full metadata by slug, along with its latest close price (IRR) and 24h change percent.",
  inputSchema: {
    slug: z.string().describe("Product slug, e.g. 'khalal-pesteh-qazvin'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = supabasePublic();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data)
      return { content: [{ type: "text", text: `No product with slug '${slug}'` }], isError: true };
    const [enriched] = await enrichWithLatestPrice(supabase, [data]);
    return {
      content: [{ type: "text", text: JSON.stringify(enriched, null, 2) }],
      structuredContent: { product: enriched },
    };
  },
});
