import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCtx(role: "admin" | "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
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

// Mock DB helpers
vi.mock("./db", () => ({
  createBooking: vi.fn(async (input: any) => input),
  getAllBookings: vi.fn(async () => []),
  markBookingPaid: vi.fn(async (id: number) => ({ id, paymentStatus: "paid" })),
  confirmBooking: vi.fn(async (id: number) => ({ id, paymentStatus: "paid", status: "confirmed" })),
  getAllCars: vi.fn(async () => []),
  getUserFavorites: vi.fn(async () => []),
  addFavorite: vi.fn(async () => ({ success: true })),
  removeFavorite: vi.fn(async () => ({ success: true })),
  getUserByOpenId: vi.fn(async () => null),
  upsertUser: vi.fn(async () => ({ success: true })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("bookings.create payment fields", () => {
  it("persists paymentMethod pay_on_arrival and paymentStatus unpaid", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx("user"));

    const result = await caller.bookings.create({
      type: "hotel",
      itemName: "فندق أدرار",
      guestName: "Youssef B.",
      guestEmail: "youssef@example.com",
      checkIn: "2026-09-01T14:00:00.000Z",
      checkOut: "2026-09-04T12:00:00.000Z",
      guests: 2,
      totalPrice: "900 MAD",
    });

    expect(result.success).toBe(true);
    expect(db.createBooking).toHaveBeenCalledOnce();
    const persisted = (db.createBooking as any).mock.calls[0][0];
    expect(persisted.paymentMethod).toBe("pay_on_arrival");
    expect(persisted.paymentStatus).toBe("unpaid");
    expect(persisted.status).toBe("pending");
    expect(persisted.totalPrice).toBe("900 MAD");
    expect(persisted.checkIn).toEqual(new Date("2026-09-01T14:00:00.000Z"));
  });

  it("rejects checkOut before checkIn", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx("user"));

    await expect(
      caller.bookings.create({
        type: "car",
        itemName: "Dacia Duster",
        guestName: "Youssef B.",
        guestEmail: "youssef@example.com",
        checkIn: "2026-09-04T09:00:00.000Z",
        checkOut: "2026-09-01T09:00:00.000Z",
        guests: 1,
      })
    ).rejects.toThrow();
    expect(db.createBooking).not.toHaveBeenCalled();
  });

  it("guest phone is optional", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx("user"));

    const result = await caller.bookings.create({
      type: "hotel",
      itemName: "Hotel Test",
      guestName: "Amina A.",
      guestEmail: "amina@example.com",
      checkIn: "2026-09-01T14:00:00.000Z",
      checkOut: "2026-09-02T12:00:00.000Z",
      guests: 1,
    });

    expect(result.success).toBe(true);
    const persisted = (db.createBooking as any).mock.calls[0][0];
    expect(persisted.guestPhone).toBeUndefined();
  });
});

describe("bookings admin payment actions", () => {
  it("admin can mark a booking as paid", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx("admin"));

    const result = await caller.bookings.markPaid({ id: 7 });
    expect(result.success).toBe(true);
    expect(db.markBookingPaid).toHaveBeenCalledWith(7);
  });

  it("admin can confirm a booking", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx("admin"));

    const result = await caller.bookings.confirm({ id: 9 });
    expect(result.success).toBe(true);
    expect(db.confirmBooking).toHaveBeenCalledWith(9);
  });

  it("regular user cannot list bookings", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx("user"));

    await expect(caller.bookings.list()).rejects.toThrow();
    expect(db.getAllBookings).not.toHaveBeenCalled();
  });

  it("regular user cannot mark booking as paid", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx("user"));

    await expect(caller.bookings.markPaid({ id: 1 })).rejects.toThrow();
    expect(db.markBookingPaid).not.toHaveBeenCalled();
  });

  it("unauthenticated visitor cannot mark booking as paid", async () => {
    const { appRouter } = await import("./routers");
    const ctx = createCtx("user");
    ctx.user = null;
    const caller = appRouter.createCaller(ctx);

    await expect(caller.bookings.markPaid({ id: 1 })).rejects.toThrow();
  });
});
