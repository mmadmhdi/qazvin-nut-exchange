import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

import type { GateRole, GateSession } from "./admin-session.server";

export type { GateRole };

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { sessionConfig } = await import("./admin-session.server");
  const session = await useSession<GateSession>(sessionConfig());
  const unlocked = Boolean(session.data.unlocked);
  const role: GateRole = session.data.role ?? "admin";
  return {
    unlocked,
    role: unlocked ? role : null,
    canWrite: unlocked,
    canDelete: unlocked && role === "admin",
  };
});

export const unlockAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({
    password: String(data?.password ?? "").slice(0, 200),
  }))
  .handler(async ({ data }) => {
    const { sessionConfig, resolveRole, checkLoginRate, logLoginAttempt } = await import(
      "./admin-session.server"
    );
    if (!process.env["ADMIN_PASSWORD"]) return { ok: false as const, reason: "unconfigured" as const };

    const { allowed, ip } = await checkLoginRate();
    if (!allowed) return { ok: false as const, reason: "rate_limited" as const };

    const role = resolveRole(data.password);
    if (!role) {
      await logLoginAttempt(ip, false);
      return { ok: false as const, reason: "invalid" as const };
    }

    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true, role, at: Date.now() });
    await logLoginAttempt(ip, true);
    return { ok: true as const, role };
  });

export const lockAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { sessionConfig } = await import("./admin-session.server");
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});
