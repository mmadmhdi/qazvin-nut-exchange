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
  name: "list_products",
  title: "فهرست محصولات",
  description:
    "List all active dry-fruit products (Persian pistachios, saffron, etc.) with slug, category, unit, latest close price (IRR) and 24h change percent.",
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
      .select("id, slug, name, category, unit, description, featured, current_price, change_24h")
      .eq("is_active", true)
      .order("featured", { ascending: false })
      .order("name");
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
