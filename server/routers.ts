import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAllCars, getCarById, createCar, updateCar, deleteCar,
  getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel,
  createBooking, getAllBookings, updateBooking, markBookingPaid, confirmBooking, getBookingById,
  getGuestBookings, cancelBooking,
  getUserFavorites, addFavorite, removeFavorite,
  getUserByOpenId, upsertUser,
  getMyCars, getMyHotels, getMyBookings,
} from "./db";
import { cached, invalidateCache } from "./cache";

/**
 * Admin-gated procedure (principle #6: Authentication & Authorization).
 * Only users with role === 'admin' can perform write operations and view
 * all bookings. Public visitors can browse but never modify.
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "ADMIN_ONLY_ERR" });
  }
  return next({ ctx });
});

/**
 * Owner-gated procedure: any logged-in user can create listings they own.
 * Writes are scoped to the caller's userId (the owner).
 */
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  return next({ ctx: { ...ctx, ownerId: ctx.user.id } });
});

/** Ensure the actor may mutate a listing: admin OR the item's owner. */
async function requireOwnership(
  ctx: any,
  item: { ownerId: number } | undefined,
  itemKind: string,
) {
  if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "ITEM_NOT_FOUND" });
  if (ctx.user.role !== "admin" && item.ownerId !== ctx.user.id) {
    throw new TRPCError({ code: "FORBIDDEN", message: "OWNER_ONLY_ERR" });
  }
}

/** Resolve a booking and assert access: admin OR the booking's owner (item owner). */
async function requireBookingAccess(ctx: any, id: number) {
  const booking = await getBookingById(id);
  if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "BOOKING_NOT_FOUND" });
  if (ctx.user.role !== "admin" && booking.ownerId !== ctx.user.id) {
    throw new TRPCError({ code: "FORBIDDEN", message: "OWNER_ONLY_ERR" });
  }
  return booking;
}

// --- Query cache entries (principle #8: Caching) ---
const carsListCache = cached<any[]>("cars:list");
const hotelsListCache = cached<any[]>("hotels:list");

// Input validation helpers (principle #7: API Design)
const MAX_NAME = 255;
const MAX_TEXT = 5000;
const MAX_SHORT = 200;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    ensureUser: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.user) {
        await upsertUser({
          openId: ctx.user.openId,
          name: ctx.user.name,
          email: ctx.user.email,
          loginMethod: ctx.user.loginMethod,
          lastSignedIn: new Date(),
        });
      }
      return { success: true } as const;
    }),
  }),

  cars: router({
    list: publicProcedure.query(async () => {
      const hit = carsListCache.get();
      if (hit) return hit;
      const allCars = await getAllCars();
      const mapped = allCars.map(car => ({
        id: car.id,
        nameAr: car.nameAr,
        nameEn: car.nameEn,
        nameFr: car.nameFr,
        nameBer: car.nameBer,
        typeAr: car.typeAr,
        typeEn: car.typeEn,
        typeFr: car.typeFr,
        typeBer: car.typeBer,
        descriptionAr: car.descriptionAr,
        descriptionEn: car.descriptionEn,
        descriptionFr: car.descriptionFr,
        descriptionBer: car.descriptionBer,
        seats: car.seats,
        fuel: car.fuel,
        price: car.price,
        phone: car.phone,
        image: car.image,
      }));
      carsListCache.set(mapped);
      return mapped;
    }),
    create: ownerProcedure
      .input(z.object({
        nameAr: z.string().max(MAX_NAME), nameEn: z.string().max(MAX_NAME),
        nameFr: z.string().max(MAX_NAME), nameBer: z.string().max(MAX_NAME),
        typeAr: z.string().max(MAX_NAME), typeEn: z.string().max(MAX_NAME),
        typeFr: z.string().max(MAX_NAME), typeBer: z.string().max(MAX_NAME),
        descriptionAr: z.string().max(MAX_TEXT).optional(), descriptionEn: z.string().max(MAX_TEXT).optional(),
        descriptionFr: z.string().max(MAX_TEXT).optional(), descriptionBer: z.string().max(MAX_TEXT).optional(),
        seats: z.string().max(MAX_SHORT).default('5 مقاعد'), fuel: z.string().max(MAX_SHORT).default('ديزل'),
        price: z.string().max(MAX_SHORT), phone: z.string().max(MAX_SHORT).optional(),
        image: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await createCar({ ...input, ownerId: ctx.user.id } as any);
        invalidateCache("cars");
        return { success: true } as const;
      }),
    update: ownerProcedure
      .input(z.object({
        id: z.number().int().positive(),
        nameAr: z.string().max(MAX_NAME), nameEn: z.string().max(MAX_NAME),
        nameFr: z.string().max(MAX_NAME), nameBer: z.string().max(MAX_NAME),
        typeAr: z.string().max(MAX_NAME), typeEn: z.string().max(MAX_NAME),
        typeFr: z.string().max(MAX_NAME), typeBer: z.string().max(MAX_NAME),
        descriptionAr: z.string().max(MAX_TEXT).optional(), descriptionEn: z.string().max(MAX_TEXT).optional(),
        descriptionFr: z.string().max(MAX_TEXT).optional(), descriptionBer: z.string().max(MAX_TEXT).optional(),
        seats: z.string().max(MAX_SHORT), fuel: z.string().max(MAX_SHORT),
        price: z.string().max(MAX_SHORT), phone: z.string().max(MAX_SHORT).optional(),
        image: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const car = await getCarById(id);
        await requireOwnership({ user: ctx.user } as any, car as any, "car");
        await updateCar(id, data);
        invalidateCache("cars");
        return { success: true } as const;
      }),
    delete: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const car = await getCarById(input.id);
        await requireOwnership({ user: ctx.user } as any, car as any, "car");
        await deleteCar(input.id);
        invalidateCache("cars");
        return { success: true } as const;
      }),
  }),

  hotels: router({
    list: publicProcedure.query(async () => {
      const hit = hotelsListCache.get();
      if (hit) return hit;
      const allHotels = await getAllHotels();
      const mapped = allHotels.map(hotel => ({
        id: hotel.id,
        nameAr: hotel.nameAr, nameEn: hotel.nameEn, nameFr: hotel.nameFr, nameBer: hotel.nameBer,
        descriptionAr: hotel.descriptionAr, descriptionEn: hotel.descriptionEn,
        descriptionFr: hotel.descriptionFr, descriptionBer: hotel.descriptionBer,
        locationAr: hotel.locationAr, locationEn: hotel.locationEn,
        locationFr: hotel.locationFr, locationBer: hotel.locationBer,
        rating: hotel.rating,
        priceAr: hotel.priceAr, priceEn: hotel.priceEn, priceFr: hotel.priceFr, priceBer: hotel.priceBer,
        amenities: hotel.amenities,
        image: hotel.image,
      }));
      hotelsListCache.set(mapped);
      return mapped;
    }),
    create: ownerProcedure
      .input(z.object({
        nameAr: z.string().max(MAX_NAME), nameEn: z.string().max(MAX_NAME),
        nameFr: z.string().max(MAX_NAME), nameBer: z.string().max(MAX_NAME),
        descriptionAr: z.string().max(MAX_TEXT).optional(), descriptionEn: z.string().max(MAX_TEXT).optional(),
        descriptionFr: z.string().max(MAX_TEXT).optional(), descriptionBer: z.string().max(MAX_TEXT).optional(),
        locationAr: z.string().max(MAX_NAME).optional(), locationEn: z.string().max(MAX_NAME).optional(),
        locationFr: z.string().max(MAX_NAME).optional(), locationBer: z.string().max(MAX_NAME).optional(),
        rating: z.string().max(10).default('4.5'),
        priceAr: z.string().max(MAX_SHORT), priceEn: z.string().max(MAX_SHORT),
        priceFr: z.string().max(MAX_SHORT), priceBer: z.string().max(MAX_SHORT),
        amenities: z.any().optional(), image: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await createHotel({ ...input, ownerId: ctx.user.id } as any);
        invalidateCache("hotels");
        return { success: true } as const;
      }),
    update: ownerProcedure
      .input(z.object({
        id: z.number().int().positive(),
        nameAr: z.string().max(MAX_NAME), nameEn: z.string().max(MAX_NAME),
        nameFr: z.string().max(MAX_NAME), nameBer: z.string().max(MAX_NAME),
        descriptionAr: z.string().max(MAX_TEXT).optional(), descriptionEn: z.string().max(MAX_TEXT).optional(),
        descriptionFr: z.string().max(MAX_TEXT).optional(), descriptionBer: z.string().max(MAX_TEXT).optional(),
        locationAr: z.string().max(MAX_NAME).optional(), locationEn: z.string().max(MAX_NAME).optional(),
        locationFr: z.string().max(MAX_NAME).optional(), locationBer: z.string().max(MAX_NAME).optional(),
        rating: z.string().max(10),
        priceAr: z.string().max(MAX_SHORT), priceEn: z.string().max(MAX_SHORT),
        priceFr: z.string().max(MAX_SHORT), priceBer: z.string().max(MAX_SHORT),
        amenities: z.any().optional(), image: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const hotel = await getHotelById(id);
        await requireOwnership({ user: ctx.user } as any, hotel as any, "hotel");
        await updateHotel(id, data);
        invalidateCache("hotels");
        return { success: true } as const;
      }),
    delete: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const hotel = await getHotelById(input.id);
        await requireOwnership({ user: ctx.user } as any, hotel as any, "hotel");
        await deleteHotel(input.id);
        invalidateCache("hotels");
        return { success: true } as const;
      }),
  }),

  bookings: router({
    create: publicProcedure
      .input(z.object({
        type: z.enum(['hotel', 'car']),
        guestUserId: z.number().int().positive().optional(),
        itemName: z.string().min(1).max(MAX_NAME),
        guestName: z.string().min(2).max(MAX_NAME),
        guestEmail: z.string().email().max(320),
        guestPhone: z.string().max(MAX_SHORT).optional(),
        checkIn: z.string(),
        checkOut: z.string(),
        pickUpTime: z.string().max(10).optional(),
        dropOffTime: z.string().max(10).optional(),
        guests: z.number().int().min(1).max(50).default(1),
        notes: z.string().max(MAX_TEXT).optional(),
        totalPrice: z.string().max(MAX_SHORT).optional(),
        itemId: z.number().int().positive(),
      }).refine(d => {
        const a = new Date(d.checkIn);
        const b = new Date(d.checkOut);
        return !isNaN(a.getTime()) && !isNaN(b.getTime()) && b.getTime() >= a.getTime();
      }, { message: "checkOut must be after checkIn" }))
      .mutation(async ({ input, ctx }) => {
        // Resolve the listing (car/hotel) so the booking is routed to its owner.
        // The persisted guest identity comes from the server-side session only —
        // any client-provided guestUserId is ignored so anonymous callers cannot
        // spoof another user's account link.
        const guestUserId: number | null = ctx.user ? ctx.user.id : null;
        let ownerId = 1;
        let itemId = 0;
        if (input.type === 'car') {
          const car = await getCarById(input.itemId);
          if (car) { ownerId = car.ownerId; itemId = car.id; }
        } else {
          const hotel = await getHotelById(input.itemId);
          if (hotel) { ownerId = hotel.ownerId; itemId = hotel.id; }
        }
        await createBooking({
          type: input.type,
          itemName: input.itemName,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          checkIn: new Date(input.checkIn),
          checkOut: new Date(input.checkOut),
          pickUpTime: input.pickUpTime || undefined,
          dropOffTime: input.dropOffTime || undefined,
          guests: input.guests,
          notes: input.notes,
          totalPrice: input.totalPrice,
          paymentMethod: 'pay_on_arrival',
          paymentStatus: 'unpaid',
          status: 'pending',
          ownerId,
          itemId,
          guestUserId,
        } as any);
        return { success: true, message: 'Booking request submitted successfully' } as const;
      }),
    // Only admins can list all bookings (customer PII protection)
    list: adminProcedure.query(async () => {
      return getAllBookings();
    }),
    // Mark a booking as paid: admin OR the listing's owner
    markPaid: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        await requireBookingAccess({ user: ctx.user } as any, input.id);
        await markBookingPaid(input.id);
        return { success: true } as const;
      }),
    // Confirm a booking and mark it paid: admin OR the listing's owner
    confirm: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        await requireBookingAccess({ user: ctx.user } as any, input.id);
        await confirmBooking(input.id);
        return { success: true } as const;
      }),
    // Guest dashboard: logged-in guest sees ONLY their own bookings
    myBookings: protectedProcedure.query(async ({ ctx }) => {
      return getGuestBookings(ctx.user.id);
    }),
    // Cancel a booking: guest may cancel only their own bookings
    cancel: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const booking = await getBookingById(input.id);
        if (!booking) throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
        if (booking.guestUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only cancel your own booking' });
        }
        await cancelBooking(input.id);
        return { success: true } as const;
      }),
  }),

  favorites: router({
    list: publicProcedure.query(async () => {
      return [] as any[];
    }),
    add: publicProcedure
      .input(z.object({ itemType: z.enum(['car', 'hotel']), itemId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        return { success: true } as const;
      }),
    remove: publicProcedure
      .input(z.object({ itemType: z.enum(['car', 'hotel']), itemId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        return { success: true } as const;
      }),
  }),

  // Owner-scoped dashboard: each owner sees ONLY their own listings and bookings.
  // Admins see everything (full listing), other users see nothing of their own.
  dashboard: router({
    myCars: ownerProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllCars();
      return getMyCars(ctx.user.id);
    }),
    myHotels: ownerProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllHotels();
      return getMyHotels(ctx.user.id);
    }),
    myBookings: ownerProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllBookings();
      return getMyBookings(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
