import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) =>
  readFileSync(resolve(process.cwd(), file), "utf8");

describe("partner onboarding and booking lifecycle contract", () => {
  it("supports provider types without replacing the base user role", () => {
    const schema = read("drizzle/schema.ts");
    const router = read("server/routers.ts");
    const dialog = read("client/src/components/LocalAuthDialog.tsx");
    expect(schema).toContain('providerType: mysqlEnum("providerType"');
    expect(schema).toContain('"tourist", "hotel_owner", "restaurant_owner"');
    expect(router).toContain("providerType: z");
    expect(dialog).toContain("providerOptions");
    expect(dialog).toContain("setProviderType");
  });

  it("exposes safe booking status transitions and scoped metrics", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    const dashboard = read("client/src/components/CarOwnerDashboard.tsx");
    expect(schema).toContain(
      '"pending", "confirmed", "cancelled", "completed"'
    );
    expect(db).toContain("completeBooking");
    expect(router).toContain('message: "BOOKING_MUST_BE_CONFIRMED"');
    expect(router).toContain("metrics: ownerProcedure.query");
    expect(dashboard).toContain("trpc.dashboard.metrics.useQuery");
    expect(dashboard).toContain("completeMutation.mutate");
  });
});
