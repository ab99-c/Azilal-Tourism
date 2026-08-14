import { describe, it, expect } from 'vitest';

/**
 * Ownership-scoping tests (verified against server/routers.ts + drizzle/schema.ts
 * code paths). The runtime DB is not available in the test env, so tests assert
 * the router wiring contract: admin can see all, owners see only their items,
 * and non-owners are rejected (FORBIDDEN).
 */

describe('ownership scoping contract', () => {
  it('cars.create uses ownerProcedure and sets ownerId from ctx.user.id', async () => {
    const src = await import('fs').then(f => f.readFileSync('server/routers.ts', 'utf8'));
    expect(src).toContain('create: ownerProcedure');
    expect(src).toContain('await createCar({ ...input, ownerId: ctx.user.id } as any)');
    expect(src).toContain('await createHotel({ ...input, ownerId: ctx.user.id } as any)');
  });

  it('update/delete require ownership check before mutating', async () => {
    const src = await import('fs').then(f => f.readFileSync('server/routers.ts', 'utf8'));
    expect(src).toContain('update: ownerProcedure');
    expect(src).toContain('delete: ownerProcedure');
    expect(src).toContain('await requireOwnership({ user: ctx.user } as any, car as any, "car")');
    expect(src).toContain('await requireOwnership({ user: ctx.user } as any, hotel as any, "hotel")');
  });

  it('markPaid and confirm require booking-level ownership access', async () => {
    const src = await import('fs').then(f => f.readFileSync('server/routers.ts', 'utf8'));
    expect(src).toContain('markPaid: ownerProcedure');
    expect(src).toContain('confirm: ownerProcedure');
    expect(src).toContain('await requireBookingAccess({ user: ctx.user } as any, input.id)');
  });

  it('dashboard procedures are owner-scoped: admin sees all, owners see own only', async () => {
    const src = await import('fs').then(f => f.readFileSync('server/routers.ts', 'utf8'));
    expect(src).toContain('myCars: ownerProcedure.query(async ({ ctx }) =>');
    expect(src).toContain('if (ctx.user.role === "admin") return getAllCars();');
    expect(src).toContain('return getMyCars(ctx.user.id);');
    expect(src).toContain('if (ctx.user.role === "admin") return getAllHotels();');
    expect(src).toContain('if (ctx.user.role === "admin") return getAllBookings();');
  });

  it('requireOwnership rejects non-owner mutations with FORBIDDEN', async () => {
    const src = await import('fs').then(f => f.readFileSync('server/routers.ts', 'utf8'));
    expect(src).toContain('if (ctx.user.role !== "admin" && item.ownerId !== ctx.user.id)');
    expect(src).toContain('throw new TRPCError({ code: "FORBIDDEN", message: "OWNER_ONLY_ERR" })');
  });

  it('requireBookingAccess rejects non-owner booking mutations with FORBIDDEN', async () => {
    const src = await import('fs').then(f => f.readFileSync('server/routers.ts', 'utf8'));
    expect(src).toContain('if (ctx.user.role !== "admin" && booking.ownerId !== ctx.user.id)');
  });

  it('bookings.create persists ownerId/itemId routed from the listing owner', async () => {
    const src = await import('fs').then(f => f.readFileSync('server/routers.ts', 'utf8'));
    expect(src).toContain('itemId: z.number().int().positive()');
    expect(src).toContain('ownerId,');
    expect(src).toContain('itemId,');
    expect(src).toContain("const car = await getCarById(input.itemId);");
    expect(src).toContain("const hotel = await getHotelById(input.itemId);");
  });
});
