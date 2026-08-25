import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createContext(userId = 1, role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `owner-${userId}`,
      email: `owner-${userId}@example.com`,
      name: "Owner",
      loginMethod: "local",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

vi.mock("./db", () => ({
  getCarById: vi.fn(async (id: number) => ({ id, ownerId: 1, isActive: true })),
  getHotelById: vi.fn(async (id: number) => ({ id, ownerId: 1, isActive: true })),
  findBookingAvailabilityConflict: vi.fn(async () => null),
  listAvailabilityBlocksForOwner: vi.fn(async () => []),
  getAvailabilityBlockById: vi.fn(async () => undefined),
  createAvailabilityBlock: vi.fn(async () => ({ success: true })),
  deleteAvailabilityBlock: vi.fn(async () => ({ success: true })),
  createBooking: vi.fn(async (input: unknown) => input),
  getAllBookings: vi.fn(async () => []),
  getBookingById: vi.fn(async () => undefined),
  markBookingPaid: vi.fn(async () => ({ success: true })),
  confirmBooking: vi.fn(async () => ({ success: true })),
  getAllCars: vi.fn(async () => []),
  getAllHotels: vi.fn(async () => []),
  getMyCars: vi.fn(async () => []),
  getMyHotels: vi.fn(async () => []),
  getMyBookings: vi.fn(async () => []),
  getUserFavorites: vi.fn(async () => []),
  addFavorite: vi.fn(async () => ({ success: true })),
  removeFavorite: vi.fn(async () => ({ success: true })),
  getUserByOpenId: vi.fn(async () => null),
  upsertUser: vi.fn(async () => ({ success: true })),
}));

beforeEach(() => vi.clearAllMocks());

describe("availability router", () => {
  it("returns only a safe public availability result", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({ ...createContext(), user: null });
    const result = await caller.availability.check({
      type: "car", itemId: 7, startsAt: "2026-09-01", endsAt: "2026-09-03",
    });

    expect(result).toEqual({ available: true, reason: null });
    expect(JSON.stringify(result)).not.toContain("guestEmail");
    expect(JSON.stringify(result)).not.toContain("guestPhone");
  });

  it("shows an unavailable result without exposing the conflicting booking", async () => {
    (db.findBookingAvailabilityConflict as any).mockResolvedValueOnce({
      kind: "confirmed_booking",
      booking: { guestEmail: "private@example.com", guestPhone: "0600000000" },
    });
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({ ...createContext(), user: null });
    const result = await caller.availability.check({
      type: "hotel", itemId: 3, startsAt: "2026-09-01", endsAt: "2026-09-03",
    });

    expect(result).toEqual({ available: false, reason: "BOOKING_DATES_UNAVAILABLE" });
    expect(JSON.stringify(result)).not.toContain("private@example.com");
  });

  it("creates a block only for the owner of the selected listing", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createContext(1));
    await caller.availability.createBlock({
      type: "car", itemId: 7, startsAt: "2026-09-01", endsAt: "2026-09-03", reason: "Maintenance",
    });

    expect(db.createAvailabilityBlock).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 1, itemId: 7 }));
  });

  it("rejects block creation by a different owner", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createContext(2));
    await expect(caller.availability.createBlock({
      type: "hotel", itemId: 3, startsAt: "2026-09-01", endsAt: "2026-09-03",
    })).rejects.toThrow();
    expect(db.createAvailabilityBlock).not.toHaveBeenCalled();
  });
});
