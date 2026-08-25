import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { hashPassword, isValidBootstrapSecret, verifyPassword } from "./localAuth";

describe("independent email/password authentication", () => {
  it("hashes passwords without retaining the original value and verifies only the right password", async () => {
    const hash = await hashPassword("Atlas!Secure2026");
    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain("Atlas!Secure2026");
    await expect(verifyPassword("Atlas!Secure2026", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("requires an exact sufficiently long administrator bootstrap secret", () => {
    const previous = process.env.AUTH_BOOTSTRAP_SECRET;
    process.env.AUTH_BOOTSTRAP_SECRET = "Azilal!Bootstrap#2026";
    expect(isValidBootstrapSecret("Azilal!Bootstrap#2026")).toBe(true);
    expect(isValidBootstrapSecret("Azilal!Bootstrap#2025")).toBe(false);
    expect(isValidBootstrapSecret("short-secret")).toBe(false);
    process.env.AUTH_BOOTSTRAP_SECRET = previous;
  });

  it("wires independent actions and removes the Vercel-to-Manus redirects", () => {
    const router = fs.readFileSync("server/routers.ts", "utf8");
    const navbar = fs.readFileSync("client/src/components/Navbar.tsx", "utf8");
    const bookingModal = fs.readFileSync("client/src/components/BookingModal.tsx", "utf8");
    const main = fs.readFileSync("client/src/main.tsx", "utf8");
    const authDialog = fs.readFileSync("client/src/components/LocalAuthDialog.tsx", "utf8");
    expect(router).toContain("register: publicProcedure");
    expect(router).toContain("login: publicProcedure");
    expect(router).toContain("activateExistingAdmin");
    expect(navbar).toContain("openLocalAuth");
    expect(navbar).not.toContain("MAIN_SITE_URL");
    expect(bookingModal).not.toContain("redirectToMainSite");
    expect(main).not.toContain("startLogin");
    expect(authDialog).toContain("استعمل بريدك الإلكتروني وكلمة السر ديال ADRAR.");
    expect(authDialog).not.toContain("No Manus or Google");
    expect(authDialog).not.toContain("لا Manus لا Google");
    expect(authDialog).toContain("authIntent === 'activate-admin'");
    expect(authDialog).not.toContain("{mode !== 'activate' && <button");
    expect(authDialog).not.toContain("{c.admin}</button>");
    expect(fs.existsSync("api/trpc/[trpc].ts")).toBe(false);
    expect(fs.existsSync("api/server.ts")).toBe(false);
    expect(fs.readFileSync("server/vercel-api.ts", "utf8")).not.toContain("registerOAuthRoutes");
  });
});
