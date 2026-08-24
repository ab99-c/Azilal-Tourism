import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("database health monitoring", () => {
  const dbSource = fs.readFileSync("server/db.ts", "utf8");
  const handlerSource = fs.readFileSync("server/databaseHealth.ts", "utf8");
  const expressSource = fs.readFileSync("server/_core/index.ts", "utf8");
  const vercelSource = fs.readFileSync("server/vercel-api.ts", "utf8");
  const routerSource = fs.readFileSync("server/_core/systemRouter.ts", "utf8");
  const dashboardSource = fs.readFileSync("client/src/components/CarOwnerDashboard.tsx", "utf8");
  const stateSource = fs.readFileSync("client/src/components/ServerStateNotice.tsx", "utf8");

  it("runs a bounded SELECT 1 health probe", () => {
    expect(dbSource).toContain("export async function checkDatabaseHealth()");
    expect(dbSource).toContain("db.execute(sql`SELECT 1`)");
    expect(dbSource).toContain("withTransientDatabaseRetry");
  });

  it("mounts a cron-only callback on both runtimes", () => {
    expect(handlerSource).toContain("user.isCron");
    expect(handlerSource).toContain("notifyOwner");
    expect(expressSource).toContain('/api/scheduled/db-health');
    expect(vercelSource).toContain('/api/scheduled/db-health');
  });

  it("exposes admin status and friendly server states", () => {
    expect(routerSource).toContain("dbHealth: adminProcedure");
    expect(dashboardSource).toContain("refetchInterval: 60_000");
    expect(stateSource).toContain("role=\"status\"");
    expect(stateSource).toContain("role=\"alert\"");
    expect(stateSource).toContain("Try again");
  });
});
