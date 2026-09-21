import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* --------------------------------- types --------------------------------- */

export type CrmContact = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  kind: string; // lead | customer | supplier | partner
  source: string;
  tags: string[];
  notes: string;
  last_contact_at: string | null;
  created_at: string;
};

export type CrmDeal = {
  id: string;
  contact_id: string | null;
  title: string;
  product_id: string | null;
  quantity_kg: number;
  unit_price: number;
  currency: string;
  stage: string; // new | contacted | quoted | negotiation | won | lost
  probability: number;
  expected_close: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type CrmActivity = {
  id: string;
  contact_id: string | null;
  deal_id: string | null;
  kind: string; // call | whatsapp | email | meeting | note | task
  body: string;
  due_at: string | null;
  done: boolean;
  created_at: string;
};

export type CrmMessage = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  product: string | null;
  quantity: string | null;
  message: string;
  status: string;
  read: boolean;
  crm_contact_id: string | null;
  created_at: string;
};

export type CrmSnapshot = {
  contacts: CrmContact[];
  deals: CrmDeal[];
  activities: CrmActivity[];
  messages: CrmMessage[];
};

type Db = { from: (t: string) => any };

/**
 * Every CRM handler goes through here: the cookie session decides the role
 * (admin = full access, sales = read + edit but never delete) and the request
 * is refused server-side when the role lacks the permission.
 */
async function db_(perm: "read" | "write" | "delete"): Promise<Db> {
  const { requireRole } = await import("./admin-session.server");
  await requireRole(perm);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Db;
}

/* ---------------------------------- read --------------------------------- */

export const crmSnapshot = createServerFn({ method: "GET" }).handler(async (): Promise<CrmSnapshot> => {
  const db = await db_("read");
  const [contacts, deals, activities, messages] = await Promise.all([
    db.from("crm_contacts").select("*").order("created_at", { ascending: false }).limit(1000),
    db.from("crm_deals").select("*").order("updated_at", { ascending: false }).limit(1000),
    db.from("crm_activities").select("*").order("created_at", { ascending: false }).limit(1000),
    db.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(500),
  ]);
  return {
    contacts: (contacts.data ?? []) as CrmContact[],
    deals: (deals.data ?? []).map((d: CrmDeal) => ({ ...d, quantity_kg: Number(d.quantity_kg) })) as CrmDeal[],
    activities: (activities.data ?? []) as CrmActivity[],
    messages: (messages.data ?? []) as CrmMessage[],
  };
});

/* -------------------------------- contacts ------------------------------- */

const ContactSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  company: z.string().max(160).default(""),
  phone: z.string().max(60).default(""),
  email: z.string().max(160).default(""),
  city: z.string().max(80).default(""),
  country: z.string().max(80).default("ایران"),
  kind: z.enum(["lead", "customer", "supplier", "partner"]).default("lead"),
  source: z.string().max(60).default("website"),
  tags: z.array(z.string().max(40)).max(20).default([]),
  notes: z.string().max(4000).default(""),
  last_contact_at: z.string().nullable().optional(),
});

export const crmSaveContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ContactSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await db_("write");
    const { id, ...rest } = data;
    if (id) {
      const { error } = await db.from("crm_contacts").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id };
    }
    const { data: row, error } = await db.from("crm_contacts").insert(rest).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true as const, id: row.id as string };
  });

export const crmDeleteContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const db = await db_("delete");
    const { error } = await db.from("crm_contacts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ---------------------------------- deals -------------------------------- */

const STAGES = ["new", "contacted", "quoted", "negotiation", "won", "lost"] as const;

const DealSchema = z.object({
  id: z.string().uuid().optional(),
  contact_id: z.string().uuid().nullable().default(null),
  title: z.string().min(1).max(200),
  product_id: z.string().uuid().nullable().default(null),
  quantity_kg: z.number().finite().min(0).default(0),
  unit_price: z.number().finite().min(0).default(0),
  currency: z.string().max(20).default("ریال"),
  stage: z.enum(STAGES).default("new"),
  probability: z.number().int().min(0).max(100).default(20),
  expected_close: z.string().nullable().default(null),
  notes: z.string().max(4000).default(""),
});

export const crmSaveDeal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DealSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await db_("write");
    const { id, ...rest } = data;
    const payload = { ...rest, expected_close: rest.expected_close || null };
    if (id) {
      const { error } = await db.from("crm_deals").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id };
    }
    const { data: row, error } = await db.from("crm_deals").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true as const, id: row.id as string };
  });

export const crmSetDealStage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), stage: z.enum(STAGES) }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = await db_("write");
    const probability = data.stage === "won" ? 100 : data.stage === "lost" ? 0 : undefined;
    const patch: Record<string, unknown> = { stage: data.stage };
    if (probability !== undefined) patch.probability = probability;
    const { error } = await db.from("crm_deals").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const crmDeleteDeal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const db = await db_("delete");
    const { error } = await db.from("crm_deals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* -------------------------------- activities ----------------------------- */

export const crmAddActivity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        contact_id: z.string().uuid().nullable().default(null),
        deal_id: z.string().uuid().nullable().default(null),
        kind: z.enum(["call", "whatsapp", "email", "meeting", "note", "task"]).default("note"),
        body: z.string().min(1).max(4000),
        due_at: z.string().nullable().default(null),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await db_("write");
    const { error } = await db.from("crm_activities").insert({ ...data, due_at: data.due_at || null });
    if (error) throw new Error(error.message);
    if (data.contact_id) {
      await db.from("crm_contacts").update({ last_contact_at: new Date().toISOString() }).eq("id", data.contact_id);
    }
    return { ok: true as const };
  });

export const crmToggleActivity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid(), done: z.boolean() }).parse(data))
  .handler(async ({ data }) => {
    const db = await db_("write");
    const { error } = await db.from("crm_activities").update({ done: data.done }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const crmDeleteActivity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const db = await db_("delete");
    const { error } = await db.from("crm_activities").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* --------------------------------- inbox --------------------------------- */

export const crmUpdateMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "in_progress", "answered", "archived"]).optional(),
        read: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await db_("write");
    const { id, ...patch } = data;
    const { error } = await db.from("contact_messages").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Turns an inbox message into a CRM contact (and links them together). */
export const crmConvertMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const db = await db_("write");
    const { data: msg, error: readErr } = await db
      .from("contact_messages")
      .select("*")
      .eq("id", data.id)
      .single();
    if (readErr) throw new Error(readErr.message);
    if (msg.crm_contact_id) return { ok: true as const, id: msg.crm_contact_id as string };

    const { data: row, error } = await db
      .from("crm_contacts")
      .insert({
        name: msg.name,
        phone: msg.phone ?? "",
        email: msg.email ?? "",
        kind: "lead",
        source: "contact-form",
        notes: msg.message ?? "",
        last_contact_at: msg.created_at,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await db.from("contact_messages").update({ crm_contact_id: row.id, status: "in_progress", read: true }).eq("id", data.id);
    await db.from("crm_activities").insert({
      contact_id: row.id,
      kind: "note",
      body: `پیام فرم تماس: ${msg.subject ? msg.subject + " — " : ""}${msg.message ?? ""}`.slice(0, 3000),
    });
    if (msg.product || msg.quantity) {
      await db.from("crm_deals").insert({
        contact_id: row.id,
        title: `درخواست ${msg.product ?? "خرید"}${msg.quantity ? ` — ${msg.quantity}` : ""}`,
        stage: "new",
        notes: msg.message ?? "",
      });
    }
    return { ok: true as const, id: row.id as string };
  });
