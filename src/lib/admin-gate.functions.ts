import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

import type { GateSession } from "./admin-session.server";

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { sessionConfig } = await import("./admin-session.server");
  const session = await useSession<GateSession>(sessionConfig());
  return { unlocked: Boolean(session.data.unlocked) };
});

export const unlockAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({
    password: String(data?.password ?? "").slice(0, 200),
  }))
  .handler(async ({ data }) => {
    const { sessionConfig, passwordMatches, checkLoginRate, logLoginAttempt } = await import(
      "./admin-session.server"
    );
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected) return { ok: false as const, reason: "unconfigured" as const };

    const { allowed, ip } = await checkLoginRate();
    if (!allowed) return { ok: false as const, reason: "rate_limited" as const };

    if (!passwordMatches(data.password, expected)) {
      await logLoginAttempt(ip, false);
      return { ok: false as const, reason: "invalid" as const };
    }

    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true, at: Date.now() });
    await logLoginAttempt(ip, true);
    return { ok: true as const };
  });

export const lockAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { sessionConfig } = await import("./admin-session.server");
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});
