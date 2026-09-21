import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InquirySchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().max(40).default(""),
  email: z.string().max(160).default(""),
  subject: z.string().max(160).default(""),
  product: z.string().max(160).default(""),
  quantity: z.string().max(80).default(""),
  message: z.string().max(2000).default(""),
});

/**
 * Public: stores a contact-form inquiry so it shows up in the CRM inbox.
 * Writes go through the service client because the table denies public
 * inserts; the database rate-limit trigger still guards abuse.
 */
export const recordInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InquirySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name.trim(),
      phone: data.phone.trim() || null,
      email: data.email.trim() || null,
      subject: data.subject.trim() || null,
      product: data.product.trim() || null,
      quantity: data.quantity.trim() || null,
      message: data.message.trim() || "—",
      status: "new",
      read: false,
    });
    if (error) {
      // Rate-limit / duplicate guards must not look like a broken form.
      if (/rate_limited|duplicate_recent_message/.test(error.message)) {
        return { ok: false as const, reason: "throttled" as const };
      }
      return { ok: false as const, reason: "error" as const };
    }
    return { ok: true as const };
  });
