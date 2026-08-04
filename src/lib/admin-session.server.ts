// Shared admin gate session (cookie based) + brute-force throttling.
import { useSession, getRequestIP } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

export type GateSession = { unlocked?: boolean; at?: number };

export function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "darj-admin",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      // Localhost (http) drops `secure` cookies — only enforce it in production.
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** Throws when the caller has not unlocked the admin panel. */
export async function requireAdmin(): Promise<void> {
  const session = await useSession<GateSession>(sessionConfig());
  if (!session.data.unlocked) throw new Error("unauthorized");
}

function clientIp(): string {
  try {
    return getRequestIP({ xForwardedFor: true }) ?? "unknown";
  } catch {
    return "unknown";
  }
}

/** Returns false when too many failed attempts came from this IP recently. */
export async function checkLoginRate(): Promise<{ allowed: boolean; ip: string }> {
  const ip = clientIp();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("ok", false)
      .gte("created_at", since);
    return { allowed: (count ?? 0) < 8, ip };
  } catch {
    return { allowed: true, ip };
  }
}

export async function logLoginAttempt(ip: string, ok: boolean): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_login_attempts").insert({ ip, ok });
  } catch {
    /* logging must never block the login flow */
  }
}
