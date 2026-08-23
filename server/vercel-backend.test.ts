import { describe, expect, it } from "vitest";
import fs from "node:fs";

const vercelConfig = fs.readFileSync("vercel.json", "utf8");
const apiHandler = fs.readFileSync("server/vercel-api.ts", "utf8");
const clientMain = fs.readFileSync("client/src/main.tsx", "utf8");
const staticUtils = fs.readFileSync("client/src/lib/utils.ts", "utf8");

describe("Vercel backend deployment", () => {
  it("routes the catch-all API to a serverless handler", () => {
    expect(apiHandler).toContain("createExpressMiddleware");
    expect(apiHandler).toContain("registerOAuthRoutes(app)");
    expect(apiHandler).toContain("registerStorageProxy(app)");
    expect(apiHandler).toContain("/api/scheduled/escalateSafetyTrips");
    expect(vercelConfig).toContain('"api/index.mjs"');
    expect(vercelConfig).not.toContain('"source": "/api/trpc/:path*"');
    expect(vercelConfig).not.toContain('"source": "/api/oauth/:path*"');
  });

  it("uses the Vercel-local tRPC endpoint and does not force the old Manus API", () => {
    expect(clientMain).toContain('url: "/api/trpc"');
    expect(clientMain).not.toContain('"https://azilaltour-j2sx2a5n.manus.space/api/trpc"');
    expect(staticUtils).toContain('import.meta.env.VITE_STATIC_MIRROR === "true"');
  });
});
