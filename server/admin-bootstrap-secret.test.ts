import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("admin bootstrap secret", () => {
  it("is accepted by the activate-admin endpoint without mutating a real account", async () => {
    const secret = process.env.AUTH_BOOTSTRAP_SECRET?.trim();
    expect(secret).toBeTruthy();
    expect(secret!.length).toBeGreaterThanOrEqual(12);

    const caller = appRouter.createCaller({
      user: null,
      req: { headers: { "x-forwarded-for": "127.0.0.1" } } as any,
      res: { cookie: () => undefined } as any,
    } as any);

    await expect(
      caller.auth.activateExistingAdmin({
        email: "nonexistent-admin-probe@example.invalid",
        password: "ProbePassword!2026",
        bootstrapSecret: secret!,
      })
    ).rejects.toMatchObject({ message: "ADMIN_ACCOUNT_NOT_FOUND" });
  });
});
