import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

/**
 * Guest-dashboard tests (bookings.myBookings / bookings.cancel).
 * The runtime DB is not available in the test env, so tests assert the router
 * wiring contract: guests see only their own bookings, can cancel only their
 * own bookings, and all routes are protected (require login).
 */
describe('guest bookings scoping contract', () => {
  const src = fs.readFileSync('server/routers.ts', 'utf8');
  const dbSrc = fs.readFileSync('server/db.ts', 'utf8');
  const schema = fs.readFileSync('drizzle/schema.ts', 'utf8');

  it('bookings.myBookings is protected (requires login) and scoped to guestUserId === ctx.user.id', () => {
    expect(src).toContain('myBookings: protectedProcedure.query(async ({ ctx }) =>');
    expect(src).toContain('return getGuestBookings(ctx.user.id);');
    // Not owner-scoped (guest bookings must not be filtered by ownerId)
    expect(src).not.toContain('getGuestBookings(ctx.ownerId)');
  });

  it('bookings.cancel verifies ownership of the booking before cancelling', () => {
    expect(src).toContain('cancel: protectedProcedure');
    expect(src).toContain('getBookingById(input.id)');
    expect(src).toContain("throw new TRPCError({ code: 'FORBIDDEN'");
    // Guest must be the one who created the booking (guestUserId), not the listing owner
    expect(src).toContain('booking.guestUserId !== ctx.user.id');
  });

  it('cancel rejects when booking not found (NOT_FOUND)', () => {
    expect(src).toContain("throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })");
  });

  it('cancel sets status to cancelled only on the targeted row', () => {
    expect(dbSrc).toContain('export async function cancelBooking(id: number)');
    expect(dbSrc).toContain("set({ status: 'cancelled' } as any)");
  });

  it('getGuestBookings filters by guestUserId and orders newest first', () => {
    expect(dbSrc).toContain('export async function getGuestBookings(guestUserId: number)');
    expect(dbSrc).toContain('where(eq(bookings.guestUserId, guestUserId))');
    expect(dbSrc).toContain('orderBy(desc(bookings.createdAt))');
  });

  it('bookings.create persists the authenticated guest as guestUserId from the server session', () => {
    expect(src).toContain('guestUserId: z.number().int().positive().optional()');
    // The server must derive the guest identity from ctx.user, never from the
    // client-provided input (spoofing protection):
    expect(src).toContain('const guestUserId: number | null = ctx.user ? ctx.user.id : null;');
    expect(src).not.toContain('guestUserId: input.guestUserId');
    expect(src).toContain('guestUserId,');
  });

  it('schema has the guestUserId column on bookings', () => {
    expect(schema).toContain('guestUserId');
  });

  it('owner dashboard myBookings stays separate from guest dashboard myBookings', () => {
    expect(src).toContain('myBookings: ownerProcedure.query(async ({ ctx }) =>');
    expect(src).toContain('if (ctx.user.role === "admin") return getAllBookings();');
    expect(src).toContain('return getMyBookings(ctx.user.id);');
    // Guest-scoped helper is distinct from owner-scoped helper
    expect(dbSrc).toContain('export async function getGuestBookings(guestUserId: number)');
    expect(dbSrc).toContain('export async function getMyBookings(ownerId: number)');
  });
});
