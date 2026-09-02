import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getAllCafes,
  getCafeById,
  createCafe,
  updateCafe,
  deleteCafe,
  createBooking,
  getAllBookings,
  updateBooking,
  markBookingPaid,
  confirmBooking,
  completeBooking,
  getBookingById,
  getGuestBookings,
  cancelBooking,
  getMyRestaurants,
  getMyCafes,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getUserByOpenId,
  getUserByEmail,
  classifyDatabaseError,
  getUserById,
  createLocalUser,
  setLocalPassword,
  markEmailVerified,
  issueEmailAuthToken,
  consumeEmailAuthToken,
  upsertUser,
  getMyCars,
  getMyHotels,
  getMyBookings,
  getPendingListingReviewQueue,
  findBookingAvailabilityConflict,
  listAvailabilityBlocksForOwner,
  getAvailabilityBlockById,
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  createSafetyTrip,
  getSafetyTripByToken,
  updateSafetyTrip,
  listSafetyTrips,
} from "./db";
import { cached, invalidateCache } from "./cache";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";
import {
  hashPassword,
  isValidBootstrapSecret,
  verifyPassword,
} from "./localAuth";
import { assertAuthRateLimit, clearAuthRateLimit } from "./authRateLimit";

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
// Image upload helpers (restaurants & cafes)
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB hard limit
const ALLOWED_IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp"]);
const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function extractExt(fileName: string): string | null {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? null : fileName.slice(lastDot + 1);
}

function safeName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "image";
}

function base64ToBuffer(base64: string): Buffer {
  const idx = base64.indexOf(",");
  const data = idx === -1 ? base64 : base64.slice(idx + 1);
  return Buffer.from(data, "base64");
}

const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  return next({ ctx: { ...ctx, ownerId: ctx.user.id } });
});

/** Ensure the actor may mutate a listing: admin OR the item's owner. */
async function requireOwnership(
  ctx: any,
  item: { ownerId: number } | undefined,
  itemKind: string
) {
  if (!item)
    throw new TRPCError({ code: "NOT_FOUND", message: "ITEM_NOT_FOUND" });
  if (ctx.user.role !== "admin" && item.ownerId !== ctx.user.id) {
    throw new TRPCError({ code: "FORBIDDEN", message: "OWNER_ONLY_ERR" });
  }
}

/** Resolve a booking and assert access: admin OR the booking's owner (item owner). */
async function requireBookingAccess(ctx: any, id: number) {
  const booking = await getBookingById(id);
  if (!booking)
    throw new TRPCError({ code: "NOT_FOUND", message: "BOOKING_NOT_FOUND" });
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
const localEmail = z
  .string()
  .trim()
  .email()
  .max(320)
  .transform(value => value.toLowerCase());
const localPassword = z.string().min(10).max(200);
const LOCAL_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const availabilityDateRange = z
  .object({
    type: z.enum(["hotel", "car"]),
    itemId: z.number().int().positive(),
    startsAt: z.string(),
    endsAt: z.string(),
  })
  .refine(
    input => {
      const start = new Date(input.startsAt);
      const end = new Date(input.endsAt);
      return (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end.getTime() > start.getTime()
      );
    },
    { message: "endsAt must be after startsAt" }
  );
const whatsappInput = z
  .string()
  .trim()
  .max(50)
  .refine(
    value => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    },
    { message: "Enter a valid WhatsApp number" }
  )
  .optional();

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
    prepareEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserByOpenId(ctx.user.openId);
      if (!user?.email)
        return {
          ready: false,
          reason: "EMAIL_MISSING" as const,
          dispatchEnabled: false,
        };
      await issueEmailAuthToken({
        userId: user.id,
        kind: "email_verification",
        ttlMs: 24 * 60 * 60 * 1000,
      });
      return {
        ready: true,
        dispatchEnabled: false,
        expiresInMs: 24 * 60 * 60 * 1000,
      } as const;
    }),
    requestPasswordReset: publicProcedure
      .input(z.object({ email: localEmail }))
      .mutation(async ({ input, ctx }) => {
        assertAuthRateLimit(ctx.req, "password-reset");
        const user = await getUserByEmail(input.email);
        if (user)
          await issueEmailAuthToken({
            userId: user.id,
            kind: "password_reset",
            ttlMs: 60 * 60 * 1000,
          });
        clearAuthRateLimit(ctx.req, "password-reset");
        return { accepted: true, dispatchEnabled: false } as const;
      }),
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string().trim().min(32).max(128) }))
      .mutation(async ({ input }) => {
        const token = await consumeEmailAuthToken({
          rawToken: input.token,
          kind: "email_verification",
        });
        if (!token)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "INVALID_OR_EXPIRED_TOKEN",
          });
        await markEmailVerified(token.userId);
        const user = await getUserById(token.userId);
        return { verified: Boolean(user?.emailVerifiedAt) } as const;
      }),
    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string().trim().min(32).max(128),
          password: localPassword,
        })
      )
      .mutation(async ({ input }) => {
        const token = await consumeEmailAuthToken({
          rawToken: input.token,
          kind: "password_reset",
        });
        if (!token)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "INVALID_OR_EXPIRED_TOKEN",
          });
        await setLocalPassword(
          token.userId,
          await hashPassword(input.password)
        );
        return { reset: true } as const;
      }),
    register: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(2).max(120),
          email: localEmail,
          password: localPassword,
          providerType: z
            .enum([
              "tourist",
              "hotel_owner",
              "restaurant_owner",
              "activity_provider",
              "guide",
              "transport_provider",
            ])
            .optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        assertAuthRateLimit(ctx.req, "register");
        let existing;
        try {
          existing = await getUserByEmail(input.email);
        } catch (error) {
          const reason = classifyDatabaseError(error);
          console.error("[Auth] Registration lookup failed", { reason });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AUTH_SERVICE_UNAVAILABLE",
          });
        }
        if (existing)
          throw new TRPCError({
            code: "CONFLICT",
            message: "EMAIL_ALREADY_REGISTERED",
          });
        let user;
        try {
          user = await createLocalUser({
            openId: `local_${randomBytes(24).toString("base64url")}`,
            name: input.name,
            email: input.email,
            passwordHash: await hashPassword(input.password),
            providerType: input.providerType,
          });
        } catch (error) {
          const message = String(error instanceof Error ? error.message : error);
          if (/duplicate|unique|already exists/i.test(message)) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "EMAIL_ALREADY_REGISTERED",
            });
          }
          const reason = classifyDatabaseError(error);
          console.error("[Auth] Local account creation failed", { reason });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AUTH_SERVICE_UNAVAILABLE",
          });
        }
        if (!user)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ACCOUNT_CREATION_FAILED",
          });
        const token = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: LOCAL_SESSION_MS,
        });
        ctx.res.cookie(COOKIE_NAME, token, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: LOCAL_SESSION_MS,
        });
        clearAuthRateLimit(ctx.req, "register");
        return { user };
      }),
    login: publicProcedure
      .input(z.object({ email: localEmail, password: localPassword }))
      .mutation(async ({ input, ctx }) => {
        assertAuthRateLimit(ctx.req, "login");
        let user;
        try {
          user = await getUserByEmail(input.email);
        } catch (error) {
          const reason = classifyDatabaseError(error);
          console.error("[Auth] Login lookup failed", { reason });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AUTH_SERVICE_UNAVAILABLE",
          });
        }
        if (user && !user.passwordHash && user.loginMethod !== "email_password") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "OAUTH_ACCOUNT_USE_OAUTH",
          });
        }
        if (
          !user ||
          !(await verifyPassword(input.password, user.passwordHash))
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "INVALID_CREDENTIALS",
          });
        }
        const token = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: LOCAL_SESSION_MS,
        });
        ctx.res.cookie(COOKIE_NAME, token, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: LOCAL_SESSION_MS,
        });
        clearAuthRateLimit(ctx.req, "login");
        return { user };
      }),
    activateExistingAdmin: publicProcedure
      .input(
        z.object({
          email: localEmail,
          password: localPassword,
          bootstrapSecret: z.string().min(12).max(200),
        })
      )
      .mutation(async ({ input, ctx }) => {
        assertAuthRateLimit(ctx.req, "admin-activation");
        if (!isValidBootstrapSecret(input.bootstrapSecret)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "INVALID_BOOTSTRAP_SECRET",
          });
        }
        const user = await getUserByEmail(input.email);
        if (!user || user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ADMIN_ACCOUNT_NOT_FOUND",
          });
        }
        if (user.passwordHash)
          throw new TRPCError({
            code: "CONFLICT",
            message: "ADMIN_ALREADY_ACTIVATED",
          });
        await setLocalPassword(user.id, await hashPassword(input.password));
        const token = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: LOCAL_SESSION_MS,
        });
        ctx.res.cookie(COOKIE_NAME, token, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: LOCAL_SESSION_MS,
        });
        clearAuthRateLimit(ctx.req, "admin-activation");
        return {
          user: { ...user, passwordHash: null, loginMethod: "email_password" },
        };
      }),
  }),

  safetyTrips: router({
    create: publicProcedure
      .input(
        z
          .object({
            travelerName: z.string().trim().min(2).max(MAX_NAME),
            travelerEmail: z.string().trim().email().max(320),
            emergencyName: z.string().trim().max(MAX_NAME).optional(),
            emergencyPhone: z.string().trim().max(50).optional(),
            route: z.string().trim().min(2).max(500),
            departureAt: z.coerce.date(),
            expectedArrivalAt: z.coerce.date(),
            locationConsent: z.boolean().default(false),
            consentAccepted: z.literal(true),
          })
          .refine(input => input.expectedArrivalAt > input.departureAt, {
            message: "Expected arrival must be after departure",
            path: ["expectedArrivalAt"],
          })
      )
      .mutation(async ({ input }) => {
        const now = new Date();
        if (
          input.expectedArrivalAt.getTime() - now.getTime() >
          7 * 24 * 60 * 60 * 1000
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Trip duration cannot exceed 7 days",
          });
        }
        const publicToken = randomBytes(36).toString("base64url");
        const trip = await createSafetyTrip({
          publicToken,
          travelerName: input.travelerName,
          travelerEmail: input.travelerEmail,
          emergencyName: input.emergencyName || null,
          emergencyPhone: input.emergencyPhone || null,
          route: input.route,
          departureAt: input.departureAt,
          expectedArrivalAt: input.expectedArrivalAt,
          consentAt: now,
          locationConsent: input.locationConsent,
          lastCheckInAt: now,
          status: "active",
        });
        return { trip };
      }),

    get: publicProcedure
      .input(z.object({ token: z.string().min(32).max(96) }))
      .query(async ({ input }) => {
        const trip = await getSafetyTripByToken(input.token);
        if (!trip)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "SAFETY_TRIP_NOT_FOUND",
          });
        return trip;
      }),

    checkIn: publicProcedure
      .input(
        z.object({
          token: z.string().min(32).max(96),
          latitude: z.number().min(-90).max(90).optional(),
          longitude: z.number().min(-180).max(180).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const trip = await getSafetyTripByToken(input.token);
        if (!trip)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "SAFETY_TRIP_NOT_FOUND",
          });
        if (trip.status === "safe" || trip.status === "closed") return trip;
        const now = new Date();
        return updateSafetyTrip(input.token, {
          lastCheckInAt: now,
          ...(trip.locationConsent &&
          input.latitude !== undefined &&
          input.longitude !== undefined
            ? {
                lastLocationLat: String(input.latitude),
                lastLocationLng: String(input.longitude),
                lastLocationSharedAt: now,
              }
            : {}),
          status: "active",
        });
      }),

    markSafe: publicProcedure
      .input(z.object({ token: z.string().min(32).max(96) }))
      .mutation(async ({ input }) => {
        const trip = await getSafetyTripByToken(input.token);
        if (!trip)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "SAFETY_TRIP_NOT_FOUND",
          });
        return updateSafetyTrip(input.token, {
          status: "safe",
          lastCheckInAt: new Date(),
        });
      }),

    adminList: adminProcedure.query(async () => listSafetyTrips()),
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
        whatsapp: car.whatsapp,
        image: car.image,
      }));
      carsListCache.set(mapped);
      return mapped;
    }),
    create: ownerProcedure
      .input(
        z.object({
          nameAr: z.string().max(MAX_NAME),
          nameEn: z.string().max(MAX_NAME),
          nameFr: z.string().max(MAX_NAME),
          nameBer: z.string().max(MAX_NAME),
          typeAr: z.string().max(MAX_NAME),
          typeEn: z.string().max(MAX_NAME),
          typeFr: z.string().max(MAX_NAME),
          typeBer: z.string().max(MAX_NAME),
          descriptionAr: z.string().max(MAX_TEXT).optional(),
          descriptionEn: z.string().max(MAX_TEXT).optional(),
          descriptionFr: z.string().max(MAX_TEXT).optional(),
          descriptionBer: z.string().max(MAX_TEXT).optional(),
          seats: z.string().max(MAX_SHORT).default("5 مقاعد"),
          fuel: z.string().max(MAX_SHORT).default("ديزل"),
          price: z.string().max(MAX_SHORT),
          phone: z.string().max(MAX_SHORT).optional(),
          whatsapp: whatsappInput,
          image: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createCar({
          ...input,
          ownerId: ctx.user.id,
          isActive: ctx.user.role === "admin",
        } as any);
        invalidateCache("cars");
        return { success: true } as const;
      }),
    update: ownerProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          nameAr: z.string().max(MAX_NAME),
          nameEn: z.string().max(MAX_NAME),
          nameFr: z.string().max(MAX_NAME),
          nameBer: z.string().max(MAX_NAME),
          typeAr: z.string().max(MAX_NAME),
          typeEn: z.string().max(MAX_NAME),
          typeFr: z.string().max(MAX_NAME),
          typeBer: z.string().max(MAX_NAME),
          descriptionAr: z.string().max(MAX_TEXT).optional(),
          descriptionEn: z.string().max(MAX_TEXT).optional(),
          descriptionFr: z.string().max(MAX_TEXT).optional(),
          descriptionBer: z.string().max(MAX_TEXT).optional(),
          seats: z.string().max(MAX_SHORT),
          fuel: z.string().max(MAX_SHORT),
          price: z.string().max(MAX_SHORT),
          phone: z.string().max(MAX_SHORT).optional(),
          whatsapp: whatsappInput,
          image: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const car = await getCarById(id);
        await requireOwnership({ user: ctx.user } as any, car as any, "car");
        await updateCar(id, {
          ...data,
          isActive: ctx.user.role === "admin",
        } as any);
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
        nameAr: hotel.nameAr,
        nameEn: hotel.nameEn,
        nameFr: hotel.nameFr,
        nameBer: hotel.nameBer,
        descriptionAr: hotel.descriptionAr,
        descriptionEn: hotel.descriptionEn,
        descriptionFr: hotel.descriptionFr,
        descriptionBer: hotel.descriptionBer,
        locationAr: hotel.locationAr,
        locationEn: hotel.locationEn,
        locationFr: hotel.locationFr,
        locationBer: hotel.locationBer,
        rating: hotel.rating,
        priceAr: hotel.priceAr,
        priceEn: hotel.priceEn,
        priceFr: hotel.priceFr,
        priceBer: hotel.priceBer,
        amenities: hotel.amenities,
        whatsapp: hotel.whatsapp,
        image: hotel.image,
      }));
      hotelsListCache.set(mapped);
      return mapped;
    }),
    create: ownerProcedure
      .input(
        z.object({
          nameAr: z.string().max(MAX_NAME),
          nameEn: z.string().max(MAX_NAME),
          nameFr: z.string().max(MAX_NAME),
          nameBer: z.string().max(MAX_NAME),
          descriptionAr: z.string().max(MAX_TEXT).optional(),
          descriptionEn: z.string().max(MAX_TEXT).optional(),
          descriptionFr: z.string().max(MAX_TEXT).optional(),
          descriptionBer: z.string().max(MAX_TEXT).optional(),
          locationAr: z.string().max(MAX_NAME).optional(),
          locationEn: z.string().max(MAX_NAME).optional(),
          locationFr: z.string().max(MAX_NAME).optional(),
          locationBer: z.string().max(MAX_NAME).optional(),
          rating: z.string().max(10).default("4.5"),
          priceAr: z.string().max(MAX_SHORT),
          priceEn: z.string().max(MAX_SHORT),
          priceFr: z.string().max(MAX_SHORT),
          priceBer: z.string().max(MAX_SHORT),
          whatsapp: whatsappInput,
          amenities: z.any().optional(),
          image: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createHotel({
          ...input,
          ownerId: ctx.user.id,
          isActive: ctx.user.role === "admin",
        } as any);
        invalidateCache("hotels");
        return { success: true } as const;
      }),
    update: ownerProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          nameAr: z.string().max(MAX_NAME),
          nameEn: z.string().max(MAX_NAME),
          nameFr: z.string().max(MAX_NAME),
          nameBer: z.string().max(MAX_NAME),
          descriptionAr: z.string().max(MAX_TEXT).optional(),
          descriptionEn: z.string().max(MAX_TEXT).optional(),
          descriptionFr: z.string().max(MAX_TEXT).optional(),
          descriptionBer: z.string().max(MAX_TEXT).optional(),
          locationAr: z.string().max(MAX_NAME).optional(),
          locationEn: z.string().max(MAX_NAME).optional(),
          locationFr: z.string().max(MAX_NAME).optional(),
          locationBer: z.string().max(MAX_NAME).optional(),
          rating: z.string().max(10),
          priceAr: z.string().max(MAX_SHORT),
          priceEn: z.string().max(MAX_SHORT),
          priceFr: z.string().max(MAX_SHORT),
          priceBer: z.string().max(MAX_SHORT),
          whatsapp: whatsappInput,
          amenities: z.any().optional(),
          image: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const hotel = await getHotelById(id);
        await requireOwnership(
          { user: ctx.user } as any,
          hotel as any,
          "hotel"
        );
        await updateHotel(id, {
          ...data,
          isActive: ctx.user.role === "admin",
        } as any);
        invalidateCache("hotels");
        return { success: true } as const;
      }),
    updateContact: ownerProcedure
      .input(
        z.object({ id: z.number().int().positive(), whatsapp: whatsappInput })
      )
      .mutation(async ({ input, ctx }) => {
        const hotel = await getHotelById(input.id);
        await requireOwnership(
          { user: ctx.user } as any,
          hotel as any,
          "hotel"
        );
        await updateHotel(input.id, {
          whatsapp: input.whatsapp || null,
        } as any);
        invalidateCache("hotels");
        return { success: true } as const;
      }),
    delete: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const hotel = await getHotelById(input.id);
        await requireOwnership(
          { user: ctx.user } as any,
          hotel as any,
          "hotel"
        );
        await deleteHotel(input.id);
        invalidateCache("hotels");
        return { success: true } as const;
      }),
  }),

  restaurants: router({
    list: publicProcedure.query(async () => {
      return getAllRestaurants();
    }),
    create: ownerProcedure
      .input(
        z.object({
          nameAr: z.string().max(MAX_NAME),
          nameEn: z.string().max(MAX_NAME),
          nameFr: z.string().max(MAX_NAME),
          nameBer: z.string().max(MAX_NAME),
          descriptionAr: z.string().max(MAX_TEXT).optional(),
          descriptionEn: z.string().max(MAX_TEXT).optional(),
          descriptionFr: z.string().max(MAX_TEXT).optional(),
          descriptionBer: z.string().max(MAX_TEXT).optional(),
          locationAr: z.string().max(MAX_NAME).optional(),
          locationEn: z.string().max(MAX_NAME).optional(),
          locationFr: z.string().max(MAX_NAME).optional(),
          locationBer: z.string().max(MAX_NAME).optional(),
          cuisineAr: z.string().max(MAX_SHORT).optional(),
          cuisineEn: z.string().max(MAX_SHORT).optional(),
          cuisineFr: z.string().max(MAX_SHORT).optional(),
          cuisineBer: z.string().max(MAX_SHORT).optional(),
          rating: z.string().max(10).default("4.5"),
          hours: z.string().max(MAX_SHORT).default("9:00 - 23:00"),
          phone: z.string().max(MAX_SHORT).optional(),
          whatsapp: whatsappInput,
          image: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id } = await createRestaurant({
          ...input,
          ownerId: ctx.user.id,
          isActive: ctx.user.role === "admin",
        } as any);
        return { success: true, id } as const;
      }),
    update: ownerProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          nameAr: z.string().max(MAX_NAME),
          nameEn: z.string().max(MAX_NAME),
          nameFr: z.string().max(MAX_NAME),
          nameBer: z.string().max(MAX_NAME),
          descriptionAr: z.string().max(MAX_TEXT).optional(),
          descriptionEn: z.string().max(MAX_TEXT).optional(),
          descriptionFr: z.string().max(MAX_TEXT).optional(),
          descriptionBer: z.string().max(MAX_TEXT).optional(),
          locationAr: z.string().max(MAX_NAME).optional(),
          locationEn: z.string().max(MAX_NAME).optional(),
          locationFr: z.string().max(MAX_NAME).optional(),
          locationBer: z.string().max(MAX_NAME).optional(),
          cuisineAr: z.string().max(MAX_SHORT).optional(),
          cuisineEn: z.string().max(MAX_SHORT).optional(),
          cuisineFr: z.string().max(MAX_SHORT).optional(),
          cuisineBer: z.string().max(MAX_SHORT).optional(),
          rating: z.string().max(10),
          hours: z.string().max(MAX_SHORT),
          phone: z.string().max(MAX_SHORT).optional(),
          whatsapp: whatsappInput,
          image: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const restaurant = await getRestaurantById(id);
        await requireOwnership(
          { user: ctx.user } as any,
          restaurant as any,
          "restaurant"
        );
        await updateRestaurant(id, {
          ...data,
          isActive: ctx.user.role === "admin",
        } as any);
        return { success: true } as const;
      }),
    delete: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const restaurant = await getRestaurantById(input.id);
        await requireOwnership(
          { user: ctx.user } as any,
          restaurant as any,
          "restaurant"
        );
        await deleteRestaurant(input.id);
        return { success: true } as const;
      }),
    uploadImage: ownerProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          base64: z.string().max(5_500_000),
          fileName: z.string().max(255).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const restaurant = await getRestaurantById(input.id);
        await requireOwnership(
          { user: ctx.user } as any,
          restaurant as any,
          "restaurant"
        );
        const ext = (
          extractExt(input.fileName || "image.png") || "png"
        ).toLowerCase();
        if (!ALLOWED_IMAGE_EXTS.has(ext)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unsupported image format (use JPG, PNG or WEBP)",
          });
        }
        const bytes = base64ToBuffer(input.base64);
        if (bytes.length > MAX_IMAGE_BYTES) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Image too large (max 4MB)",
          });
        }
        const { url } = await storagePut(
          `restaurants/${ctx.user.id}/${safeName(input.fileName || "image")}.${ext}`,
          bytes,
          EXT_MIME[ext] || "image/png"
        );
        await updateRestaurant(input.id, { image: url } as any);
        invalidateCache("restaurants");
        return { success: true, url } as const;
      }),
    removeImage: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const restaurant = await getRestaurantById(input.id);
        await requireOwnership(
          { user: ctx.user } as any,
          restaurant as any,
          "restaurant"
        );
        await updateRestaurant(input.id, { image: null } as any);
        invalidateCache("restaurants");
        return { success: true } as const;
      }),
  }),

  cafes: router({
    list: publicProcedure.query(async () => {
      return getAllCafes();
    }),
    create: ownerProcedure
      .input(
        z.object({
          nameAr: z.string().max(MAX_NAME),
          nameEn: z.string().max(MAX_NAME),
          nameFr: z.string().max(MAX_NAME),
          nameBer: z.string().max(MAX_NAME),
          descriptionAr: z.string().max(MAX_TEXT).optional(),
          descriptionEn: z.string().max(MAX_TEXT).optional(),
          descriptionFr: z.string().max(MAX_TEXT).optional(),
          descriptionBer: z.string().max(MAX_TEXT).optional(),
          locationAr: z.string().max(MAX_NAME).optional(),
          locationEn: z.string().max(MAX_NAME).optional(),
          locationFr: z.string().max(MAX_NAME).optional(),
          locationBer: z.string().max(MAX_NAME).optional(),
          rating: z.string().max(10).default("4.5"),
          hours: z.string().max(MAX_SHORT).default("8:00 - 24:00"),
          phone: z.string().max(MAX_SHORT).optional(),
          whatsapp: whatsappInput,
          image: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id } = await createCafe({
          ...input,
          ownerId: ctx.user.id,
          isActive: ctx.user.role === "admin",
        } as any);
        return { success: true, id } as const;
      }),
    update: ownerProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          nameAr: z.string().max(MAX_NAME),
          nameEn: z.string().max(MAX_NAME),
          nameFr: z.string().max(MAX_NAME),
          nameBer: z.string().max(MAX_NAME),
          descriptionAr: z.string().max(MAX_TEXT).optional(),
          descriptionEn: z.string().max(MAX_TEXT).optional(),
          descriptionFr: z.string().max(MAX_TEXT).optional(),
          descriptionBer: z.string().max(MAX_TEXT).optional(),
          locationAr: z.string().max(MAX_NAME).optional(),
          locationEn: z.string().max(MAX_NAME).optional(),
          locationFr: z.string().max(MAX_NAME).optional(),
          locationBer: z.string().max(MAX_NAME).optional(),
          rating: z.string().max(10),
          hours: z.string().max(MAX_SHORT),
          phone: z.string().max(MAX_SHORT).optional(),
          whatsapp: whatsappInput,
          image: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const cafe = await getCafeById(id);
        await requireOwnership({ user: ctx.user } as any, cafe as any, "cafe");
        await updateCafe(id, {
          ...data,
          isActive: ctx.user.role === "admin",
        } as any);
        return { success: true } as const;
      }),
    delete: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const cafe = await getCafeById(input.id);
        await requireOwnership({ user: ctx.user } as any, cafe as any, "cafe");
        await deleteCafe(input.id);
        return { success: true } as const;
      }),
    uploadImage: ownerProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          base64: z.string().max(5_500_000),
          fileName: z.string().max(255).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const cafe = await getCafeById(input.id);
        await requireOwnership({ user: ctx.user } as any, cafe as any, "cafe");
        const ext = (
          extractExt(input.fileName || "image.png") || "png"
        ).toLowerCase();
        if (!ALLOWED_IMAGE_EXTS.has(ext)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unsupported image format (use JPG, PNG or WEBP)",
          });
        }
        const bytes = base64ToBuffer(input.base64);
        if (bytes.length > MAX_IMAGE_BYTES) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Image too large (max 4MB)",
          });
        }
        const { url } = await storagePut(
          `cafes/${ctx.user.id}/${safeName(input.fileName || "image")}.${ext}`,
          bytes,
          EXT_MIME[ext] || "image/png"
        );
        await updateCafe(input.id, { image: url } as any);
        invalidateCache("cafes");
        return { success: true, url } as const;
      }),
    removeImage: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const cafe = await getCafeById(input.id);
        await requireOwnership({ user: ctx.user } as any, cafe as any, "cafe");
        await updateCafe(input.id, { image: null } as any);
        invalidateCache("cafes");
        return { success: true } as const;
      }),
  }),

  bookings: router({
    create: publicProcedure
      .input(
        z
          .object({
            type: z.enum(["hotel", "car"]),
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
          })
          .refine(
            d => {
              const a = new Date(d.checkIn);
              const b = new Date(d.checkOut);
              return (
                !isNaN(a.getTime()) &&
                !isNaN(b.getTime()) &&
                b.getTime() >= a.getTime()
              );
            },
            { message: "checkOut must be after checkIn" }
          )
      )
      .mutation(async ({ input, ctx }) => {
        // Resolve the listing (car/hotel) so the booking is routed to its owner.
        // The persisted guest identity comes from the server-side session only —
        // any client-provided guestUserId is ignored so anonymous callers cannot
        // spoof another user's account link.
        const guestUserId: number | null = ctx.user ? ctx.user.id : null;
        let ownerId = 1;
        let itemId = 0;
        if (input.type === "car") {
          const car = await getCarById(input.itemId);
          if (!car)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "ITEM_NOT_FOUND",
            });
          ownerId = car.ownerId;
          itemId = car.id;
        } else {
          const hotel = await getHotelById(input.itemId);
          if (!hotel)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "ITEM_NOT_FOUND",
            });
          ownerId = hotel.ownerId;
          itemId = hotel.id;
        }
        const conflict = await findBookingAvailabilityConflict({
          type: input.type,
          itemId,
          startsAt: new Date(input.checkIn),
          endsAt: new Date(input.checkOut),
        });
        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "BOOKING_DATES_UNAVAILABLE",
          });
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
          paymentMethod: "pay_on_arrival",
          paymentStatus: "unpaid",
          status: "pending",
          ownerId,
          itemId,
          guestUserId,
        } as any);
        return {
          success: true,
          message: "Booking request submitted successfully",
        } as const;
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
        const booking = await requireBookingAccess(
          { user: ctx.user } as any,
          input.id
        );
        if (booking.status === "confirmed") return { success: true } as const;
        const conflict = await findBookingAvailabilityConflict({
          type: booking.type,
          itemId: booking.itemId,
          startsAt: booking.checkIn,
          endsAt: booking.checkOut,
          excludeBookingId: booking.id,
        });
        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "BOOKING_DATES_UNAVAILABLE",
          });
        }
        await confirmBooking(input.id);
        return { success: true } as const;
      }),
    complete: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const booking = await requireBookingAccess(
          { user: ctx.user } as any,
          input.id
        );
        if (booking.status === "completed") return { success: true } as const;
        if (booking.status !== "confirmed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "BOOKING_MUST_BE_CONFIRMED",
          });
        }
        await completeBooking(input.id);
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
        if (!booking)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Booking not found",
          });
        if (booking.guestUserId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only cancel your own booking",
          });
        }
        await cancelBooking(input.id);
        return { success: true } as const;
      }),
  }),

  availability: router({
    check: publicProcedure
      .input(availabilityDateRange)
      .query(async ({ input }) => {
        const listing =
          input.type === "car"
            ? await getCarById(input.itemId)
            : await getHotelById(input.itemId);
        if (!listing || !listing.isActive) {
          return { available: false, reason: "ITEM_UNAVAILABLE" as const };
        }
        const conflict = await findBookingAvailabilityConflict({
          ...input,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
        });
        return conflict
          ? { available: false, reason: "BOOKING_DATES_UNAVAILABLE" as const }
          : { available: true, reason: null };
      }),
    myBlocks: ownerProcedure.query(async ({ ctx }) => {
      return listAvailabilityBlocksForOwner(ctx.user.id);
    }),
    createBlock: ownerProcedure
      .input(
        availabilityDateRange.safeExtend({
          reason: z.string().trim().max(240).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const listing =
          input.type === "car"
            ? await getCarById(input.itemId)
            : await getHotelById(input.itemId);
        await requireOwnership(
          { user: ctx.user } as any,
          listing as any,
          input.type
        );
        await createAvailabilityBlock({
          type: input.type,
          itemId: input.itemId,
          ownerId: listing!.ownerId,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
          reason: input.reason || null,
        });
        return { success: true } as const;
      }),
    removeBlock: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const block = await getAvailabilityBlockById(input.id);
        if (!block)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AVAILABILITY_BLOCK_NOT_FOUND",
          });
        if (ctx.user.role !== "admin" && block.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "OWNER_ONLY_ERR" });
        }
        await deleteAvailabilityBlock(input.id);
        return { success: true } as const;
      }),
  }),

  listingReview: router({
    queue: adminProcedure.query(async () => {
      const pending = await getPendingListingReviewQueue();
      const toSafeItem = (
        type: "car" | "hotel" | "restaurant" | "cafe",
        item: any
      ) => ({
        id: item.id,
        type,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        nameFr: item.nameFr,
        nameBer: item.nameBer,
        createdAt: item.createdAt,
      });
      return [
        ...pending.cars.map(item => toSafeItem("car", item)),
        ...pending.hotels.map(item => toSafeItem("hotel", item)),
        ...pending.restaurants.map(item => toSafeItem("restaurant", item)),
        ...pending.cafes.map(item => toSafeItem("cafe", item)),
      ];
    }),
    approve: adminProcedure
      .input(
        z.object({
          type: z.enum(["car", "hotel", "restaurant", "cafe"]),
          id: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        const item =
          input.type === "car"
            ? await getCarById(input.id)
            : input.type === "hotel"
              ? await getHotelById(input.id)
              : input.type === "restaurant"
                ? await getRestaurantById(input.id)
                : await getCafeById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "LISTING_NOT_FOUND",
          });
        if (input.type === "car")
          await updateCar(input.id, { isActive: true } as any);
        if (input.type === "hotel")
          await updateHotel(input.id, { isActive: true } as any);
        if (input.type === "restaurant")
          await updateRestaurant(input.id, { isActive: true } as any);
        if (input.type === "cafe")
          await updateCafe(input.id, { isActive: true } as any);
        invalidateCache(
          input.type === "car"
            ? "cars"
            : input.type === "hotel"
              ? "hotels"
              : input.type === "restaurant"
                ? "restaurants"
                : "cafes"
        );
        return { success: true } as const;
      }),
    hide: adminProcedure
      .input(
        z.object({
          type: z.enum(["car", "hotel", "restaurant", "cafe"]),
          id: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        const item =
          input.type === "car"
            ? await getCarById(input.id)
            : input.type === "hotel"
              ? await getHotelById(input.id)
              : input.type === "restaurant"
                ? await getRestaurantById(input.id)
                : await getCafeById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "LISTING_NOT_FOUND",
          });
        if (input.type === "car")
          await updateCar(input.id, { isActive: false } as any);
        if (input.type === "hotel")
          await updateHotel(input.id, { isActive: false } as any);
        if (input.type === "restaurant")
          await updateRestaurant(input.id, { isActive: false } as any);
        if (input.type === "cafe")
          await updateCafe(input.id, { isActive: false } as any);
        invalidateCache(
          input.type === "car"
            ? "cars"
            : input.type === "hotel"
              ? "hotels"
              : input.type === "restaurant"
                ? "restaurants"
                : "cafes"
        );
        return { success: true } as const;
      }),
  }),

  favorites: router({
    list: publicProcedure.query(async () => {
      return [] as any[];
    }),
    add: publicProcedure
      .input(
        z.object({
          itemType: z.enum(["car", "hotel"]),
          itemId: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        return { success: true } as const;
      }),
    remove: publicProcedure
      .input(
        z.object({
          itemType: z.enum(["car", "hotel"]),
          itemId: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        return { success: true } as const;
      }),
  }),

  // Owner-scoped dashboard: each owner sees ONLY their own listings and bookings.
  // Admins see everything (full listing), other users see nothing of their own.
  dashboard: router({
    metrics: ownerProcedure.query(async ({ ctx }) => {
      const rows =
        ctx.user.role === "admin"
          ? await getAllBookings()
          : await getMyBookings(ctx.user.id);
      return {
        total: rows.length,
        pending: rows.filter(row => row.status === "pending").length,
        confirmed: rows.filter(row => row.status === "confirmed").length,
        completed: rows.filter(row => row.status === "completed").length,
        cancelled: rows.filter(row => row.status === "cancelled").length,
      };
    }),
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
    myRestaurants: ownerProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllRestaurants();
      return getMyRestaurants(ctx.user.id);
    }),
    myCafes: ownerProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllCafes();
      return getMyCafes(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
