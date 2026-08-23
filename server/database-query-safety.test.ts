import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("database query safety", () => {
  const dbSource = fs.readFileSync("server/db.ts", "utf8");

  it("bounds public cars and cafes reads", () => {
    expect(dbSource).toContain("cars.isActive, true)).orderBy(desc(cars.createdAt)).limit(100)");
    expect(dbSource).toContain("db.select().from(cafes).where(eq(cafes.isActive, true)).orderBy(desc(cafes.createdAt)).limit(100)");
    expect(dbSource).toContain("withTransientDatabaseRetry");
  });

  it("bounds admin and guest booking reads", () => {
    expect(dbSource).toContain("from(bookings).orderBy(desc(bookings.createdAt)).limit(200)");
    expect(dbSource).toContain("bookings.guestUserId, guestUserId)).orderBy(desc(bookings.createdAt)).limit(100)");
  });

  it("uses bounded connection-pool settings", () => {
    expect(dbSource).toContain("connectionLimit: 8");
    expect(dbSource).toContain("connectTimeout: 10000");
    expect(dbSource).toContain("queueLimit: 16");
  });
});
