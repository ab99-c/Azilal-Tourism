import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { hashPassword, isValidBootstrapSecret, verifyPassword } from "./localAuth";
import { classifyDatabaseError } from "./db";

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
    expect(authDialog).toContain("استخدم بريدك الإلكتروني وكلمة السر الخاصة بك في ADRAR.");
    expect(authDialog).not.toContain("No Manus or Google");
    expect(authDialog).not.toContain("لا Manus لا Google");
    expect(authDialog).toContain('params.get("auth") === "activate-admin"');
    expect(authDialog).not.toContain("{mode !== 'activate' && <button");
    expect(authDialog).not.toContain("{c.admin}</button>");
    expect(fs.existsSync("api/trpc/[trpc].ts")).toBe(false);
    expect(fs.existsSync("api/server.ts")).toBe(false);
    expect(fs.readFileSync("server/vercel-api.ts", "utf8")).not.toContain("registerOAuthRoutes");
  });

  it("normalizes duplicate signup failures to a safe conflict", () => {
    const router = fs.readFileSync("server/routers.ts", "utf8");
    const authDialog = fs.readFileSync("client/src/components/LocalAuthDialog.tsx", "utf8");
    expect(router).toContain('code: "CONFLICT"');
    expect(router).toContain('message: "EMAIL_ALREADY_REGISTERED"');
    expect(authDialog).toContain("c.accountExists");
    expect(authDialog).toContain("c.registerError");
    expect(authDialog).toContain("AUTH_SERVICE_UNAVAILABLE");
    expect(authDialog).toContain("c.authServiceUnavailable");
  });

  it("classifies infrastructure failures without exposing credentials", () => {
    const previous = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "mysql://configured.example/db";
    expect(classifyDatabaseError({ code: "ER_BAD_FIELD_ERROR", errno: 1054, message: "Unknown column 'providerType'" })).toBe("database_schema_mismatch");
    expect(classifyDatabaseError({ code: "ECONNREFUSED", message: "connect failed" })).toBe("database_connection_failed");
    process.env.DATABASE_URL = "";
    expect(classifyDatabaseError(new Error("anything"))).toBe("database_not_configured");
    process.env.DATABASE_URL = previous;
  });

  it("keeps the production bundle aligned with the current auth schema and OAuth guidance", () => {
    const productionBundle = fs.readFileSync("api/index.js", "utf8");
    expect(productionBundle).toContain('providerType: mysqlEnum');
    expect(productionBundle).toContain('providerType: input.providerType ?? "tourist"');
    expect(productionBundle).toContain("OAUTH_ACCOUNT_USE_OAUTH");
    expect(productionBundle).toContain("searchParams.has(\"sslaccept\")");
  });
});
