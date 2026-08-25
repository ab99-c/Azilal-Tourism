import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { TRPCError } from "@trpc/server";

// Mock DB so create does not hit the real database
vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createBooking: vi.fn(async (input: any) => input),
    getBookingById: vi.fn(async (id: number) => ({ id, ownerId: 1, status: "pending", paymentStatus: "unpaid" })),
    getCarById: vi.fn(async () => ({ id: 1, ownerId: 1, isActive: true })),
    getHotelById: vi.fn(async () => ({ id: 1, ownerId: 1, isActive: true })),
    markBookingPaid: vi.fn(async (id: number) => ({ id })),
    confirmBooking: vi.fn(async (id: number) => ({ id })),
    findBookingAvailabilityConflict: vi.fn(async () => null),
    getAllCars: vi.fn(async () => []),
    getUserFavorites: vi.fn(async () => []),
    addFavorite: vi.fn(async () => ({ success: true })),
    removeFavorite: vi.fn(async () => ({ success: true })),
  };
});

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
  const adminUser = { id: 1, openId: "admin-1", name: "Admin", email: "a@x.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
  const otherUser = { id: 2, openId: "owner-2", name: "Other", email: "o@x.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

  it("unauthenticated visitor cannot create a car", async () => {
    const caller = createCaller({ user: null });
    await expect(
      caller.cars.create({
        nameAr: "ت", nameEn: "x", nameFr: "x", nameBer: "x",
        typeAr: "a", typeEn: "a", typeFr: "a", typeBer: "a",
        price: "100 MAD",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("logged-in owner can create a car they own", async () => {
    const caller = createCaller({ user: otherUser });
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
  const baseUser = { id: 1, openId: "u-1", name: "U", email: "u@x.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
  const caller = createCaller({ user: baseUser });

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
    const authenticatedCaller = createCaller({ user: { id: 1, openId: "u-1", name: "U", email: "u@x.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } });
    const result = await authenticatedCaller.bookings.create({
      type: "hotel",
      itemId: 1,
      itemName: "Hotel B",
      guestName: "Valid Guest",
      guestEmail: "valid@example.com",
      checkIn: "2026-09-01",
      checkOut: "2026-09-05",
    });
    expect(result.success).toBe(true);
  });
});
