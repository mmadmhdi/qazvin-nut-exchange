import { defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import getPriceHistoryTool from "./tools/get-price-history";
import marketSummaryTool from "./tools/market-summary";

export default defineMcp({
  name: "darj-sabz-qazvin-mcp",
  title: "درج سبز قزوین — قیمت خشکبار",
  version: "0.1.0",
  instructions:
    "Public read-only market data for Darj Sabz Qazvin, a Persian dry-fruit and pistachio brand. Use list_products to browse the catalog, get_product for details on a single item, get_price_history for OHLC candles powering charts, and market_summary for today's gainers/losers and business info. All prices are in Iranian Rial (IRR). No authentication required.",
  tools: [listProductsTool, getProductTool, getPriceHistoryTool, marketSummaryTool],
});
