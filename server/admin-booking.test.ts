import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { TRPCError } from "@trpc/server";

function createContext(overrides: any = {}) {
  return {
    req: { headers: {} } as any,
    res: { clearCookie: () => {} } as any,
    user: null,
    ...overrides,
  };
}

function createCaller(ctx: any = {}) {
  return appRouter.createCaller(createContext(ctx) as any);
}

describe("admin authorization gating", () => {
  it("public user cannot create a car", async () => {
    const caller = createCaller({ user: { openId: "public-1", role: "user" } });
    await expect(
      caller.cars.create({
        nameAr: "ت", nameEn: "x", nameFr: "x", nameBer: "x",
        typeAr: "a", typeEn: "a", typeFr: "a", typeBer: "a",
        price: "100 MAD",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("admin can create a car (invalidation runs)", async () => {
    const caller = createCaller({ user: { openId: "owner-1", role: "admin" } });
    const result = await caller.cars.create({
      nameAr: "تست", nameEn: "test", nameFr: "test", nameBer: "test",
      typeAr: "a", typeEn: "a", typeFr: "a", typeBer: "a",
      price: "100 MAD",
    });
    expect(result.success).toBe(true);
  });

  it("public user cannot list bookings", async () => {
    const caller = createCaller({ user: { openId: "public-2", role: "user" } });
    await expect(caller.bookings.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("unauthenticated user cannot delete a hotel", async () => {
    const caller = createCaller({ user: null });
    await expect(caller.hotels.delete({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("booking input validation", () => {
  const caller = createCaller();

  it("rejects checkOut before checkIn", async () => {
    await expect(
      caller.bookings.create({
        type: "car",
        itemName: "سيارة",
        guestName: "Test Guest",
        guestEmail: "guest@example.com",
        checkIn: "2026-09-10",
        checkOut: "2026-09-01",
      }),
    ).rejects.toThrow();
  });

  it("rejects invalid email", async () => {
    await expect(
      caller.bookings.create({
        type: "hotel",
        itemName: "Hotel A",
        guestName: "Test",
        guestEmail: "not-an-email",
        checkIn: "2026-09-01",
        checkOut: "2026-09-02",
      }),
    ).rejects.toThrow();
  });

  it("accepts valid booking", async () => {
    const result = await caller.bookings.create({
      type: "hotel",
      itemName: "Hotel B",
      guestName: "Valid Guest",
      guestEmail: "valid@example.com",
      checkIn: "2026-09-01",
      checkOut: "2026-09-05",
    });
    expect(result.success).toBe(true);
  });
});
