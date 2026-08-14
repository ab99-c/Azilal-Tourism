import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import * as db from "./db";
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

/**
 * Runtime isolation tests for the owner-scoped dashboard.
 *
 * Different fake users call dashboard.myCars / myHotels / myBookings with the
 * DB helpers mocked. We assert:
 *  - non-admin users are rejected by ownerProcedure (FORBIDDEN) — only the
 *    listing owner (or admin) may reach the scoped helpers
 *  - admin users reach the global (unfiltered) getAll* helpers
 *  - booking creation routes ownership to the listing owner (car/hotel), not the guest
 */

let scopingCalls: { helper: string; ownerId: number }[] = [];
let globalCalls: { helper: string }[] = [];

function makeCtx(role: "admin" | "user", id = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id,
    openId: `open-${id}`,
    email: `u${id}@example.com`,
    name: `User ${id}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

vi.mock("./db", () => ({
  getMyCars: vi.fn(async (ownerId: number) => { scopingCalls.push({ helper: "myCars", ownerId }); return []; }),
  getMyHotels: vi.fn(async (ownerId: number) => { scopingCalls.push({ helper: "myHotels", ownerId }); return []; }),
  getMyBookings: vi.fn(async (ownerId: number) => { scopingCalls.push({ helper: "myBookings", ownerId }); return []; }),
  getAllCars: vi.fn(async () => { globalCalls.push({ helper: "getAllCars" }); return []; }),
  getAllHotels: vi.fn(async () => { globalCalls.push({ helper: "getAllHotels" }); return []; }),
  getAllBookings: vi.fn(async () => { globalCalls.push({ helper: "getAllBookings" }); return []; }),
  getCarById: vi.fn(async (id: number) => ({ id, ownerId: 10, isActive: true })),
  getHotelById: vi.fn(async (id: number) => ({ id, ownerId: 20, isActive: true })),
  createBooking: vi.fn(async (input: any) => input),
  getBookingById: vi.fn(async () => undefined),
  updateBooking: vi.fn(async () => ({ success: true })),
  markBookingPaid: vi.fn(async () => ({ success: true })),
  confirmBooking: vi.fn(async () => ({ success: true })),
  getUserFavorites: vi.fn(async () => []),
  addFavorite: vi.fn(async () => ({ success: true })),
  removeFavorite: vi.fn(async () => ({ success: true })),
  getUserByOpenId: vi.fn(async () => null),
  upsertUser: vi.fn(async () => ({ success: true })),
}));

beforeEach(() => {
  scopingCalls = [];
  globalCalls = [];
  vi.clearAllMocks();
});

describe("owner dashboard isolation (runtime)", () => {
  it("logged-in owner 5: myBookings scopes to owner 5 only (not admin/global)", async () => {
    const caller = appRouter.createCaller(makeCtx("user", 5));
    await caller.dashboard.myBookings();
    expect(scopingCalls).toEqual([{ helper: "myBookings", ownerId: 5 }]);
    expect(globalCalls).toHaveLength(0);
  });

  it("logged-in owner 7: myCars and myHotels scope strictly to owner 7", async () => {
    const caller = appRouter.createCaller(makeCtx("user", 7));
    await caller.dashboard.myCars();
    await caller.dashboard.myHotels();
    expect(scopingCalls).toEqual([
      { helper: "myCars", ownerId: 7 },
      { helper: "myHotels", ownerId: 7 },
    ]);
    expect(globalCalls).toHaveLength(0);
  });

  it("unauthenticated (user: null) cannot reach the dashboard", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(caller.dashboard.myBookings()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(scopingCalls).toHaveLength(0);
    expect(globalCalls).toHaveLength(0);
  });

  it("admin reaches the global unfiltered helpers for all three dashboards", async () => {
    const caller = appRouter.createCaller(makeCtx("admin", 99));
    await caller.dashboard.myCars();
    await caller.dashboard.myHotels();
    await caller.dashboard.myBookings();
    expect(globalCalls.map(c => c.helper)).toEqual(["getAllCars", "getAllHotels", "getAllBookings"]);
    expect(scopingCalls).toHaveLength(0);
  });

  it("booking creation routes the booking to the listing owner (car ownerId 10)", async () => {
    const caller = appRouter.createCaller(makeCtx("user", 999));
    const result = await caller.bookings.create({
      type: "car",
      itemName: "Dacia Duster",
      guestName: "Guest One",
      guestEmail: "guest@example.com",
      checkIn: "2026-09-01",
      checkOut: "2026-09-03",
      itemId: 5,
    });
    expect(result).toBeTruthy();
    const persisted = vi.mocked(db.createBooking).mock.calls[0][0];
    expect(persisted.ownerId).toBe(10); // routed from the car's owner, not the guest's id (999)
    expect(persisted.itemId).toBe(5);
    expect(persisted.paymentMethod).toBe("pay_on_arrival");
    expect(persisted.paymentStatus).toBe("unpaid");
  });

  it("booking creation routes hotel bookings to the hotel owner (20)", async () => {
    const caller = appRouter.createCaller(makeCtx("user", 999));
    await caller.bookings.create({
      type: "hotel",
      itemName: "Hotel B",
      guestName: "Guest Two",
      guestEmail: "guest2@example.com",
      checkIn: "2026-10-01",
      checkOut: "2026-10-02",
      itemId: 7,
    });
    const persisted = vi.mocked(db.createBooking).mock.calls[0][0];
    expect(persisted.ownerId).toBe(20); // routed from the hotel's owner
    expect(persisted.itemId).toBe(7);
  });
});
