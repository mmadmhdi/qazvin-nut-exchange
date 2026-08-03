import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const Input = z.object({
  intent: z.enum(["taste", "gift", "trade"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(24),
  context: z.string().max(4000).optional(),
});

const SYSTEM = `تو «سرآشناس سبز» (The Green Curator) هستی؛ مشاور دیجیتال برند «درج سبز قزوین»، خانه‌ی پسته و خشکبار ایران.
قواعد:
- همیشه فارسی روان، مؤدب و کوتاه بنویس؛ لحن لوکس و آرام، بدون شعارزدگی.
- پاسخ را در حداکثر ۶ خط یا فهرست کوتاه بده. از مارک‌داون ساده استفاده کن.
- برای مسیر «چشیدن» ترکیب و آیین مصرف پیشنهاد بده (مثلاً کروسان + کرم پسته + نمک دریا + اسپرسو).
- برای مسیر «هدیه» جعبه، رنگ روبان، متن کارت، نوع پسته و روش ارسال را پیشنهاد بده.
- برای مسیر «تجارت» سایز، بسته‌بندی، اینکوترمز، حجم حداقل سفارش و مدارک صادراتی را راهنمایی کن.
- قیمت قطعی نده؛ کاربر را به تابلوی قیمت (/market) یا فرم تماس (/contact) ارجاع بده.
- چیزی از خودت درباره‌ی گواهی یا موجودی که نمی‌دانی، ابداع نکن.`;

const INTENT_HINT: Record<string, string> = {
  taste: "کاربر برای چشیدن و مصرف شخصی آمده است.",
  gift: "کاربر به دنبال هدیه یا جعبه‌ی اختصاصی است.",
  trade: "کاربر خریدار عمده یا صادرکننده است.",
};

export const askCurator = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    try {
      const { text } = await generateText({
        model: gateway("openai/gpt-5.6-sol"),
        system: `${SYSTEM}\n\nزمینه: ${INTENT_HINT[data.intent]}\n${data.context ?? ""}`,
        messages: data.messages,
        providerOptions: { lovable: { reasoningEffort: "none" } },
      });
      return { text };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("429")) return { text: "", error: "rate_limit" as const };
      if (msg.includes("402")) return { text: "", error: "credits" as const };
      return { text: "", error: "unknown" as const };
    }
  });
