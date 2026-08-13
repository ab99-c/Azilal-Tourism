import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAllCars, getCarById, createCar, updateCar, deleteCar,
  getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel,
  createBooking, getAllBookings,
  getUserFavorites, addFavorite, removeFavorite,
  getUserByOpenId, upsertUser,
} from "./db";

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
      const allCars = await getAllCars();
      return allCars.map(car => ({
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
    }),
    create: publicProcedure
      .input(z.object({
        nameAr: z.string(), nameEn: z.string(), nameFr: z.string(), nameBer: z.string(),
        typeAr: z.string(), typeEn: z.string(), typeFr: z.string(), typeBer: z.string(),
        descriptionAr: z.string().optional(), descriptionEn: z.string().optional(),
        descriptionFr: z.string().optional(), descriptionBer: z.string().optional(),
        seats: z.string().default('5 مقاعد'), fuel: z.string().default('ديزل'),
        price: z.string(), phone: z.string().optional(), image: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createCar(input);
        return { success: true } as const;
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nameAr: z.string(), nameEn: z.string(), nameFr: z.string(), nameBer: z.string(),
        typeAr: z.string(), typeEn: z.string(), typeFr: z.string(), typeBer: z.string(),
        descriptionAr: z.string().optional(), descriptionEn: z.string().optional(),
        descriptionFr: z.string().optional(), descriptionBer: z.string().optional(),
        seats: z.string(), fuel: z.string(),
        price: z.string(), phone: z.string().optional(), image: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateCar(id, data);
        return { success: true } as const;
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCar(input.id);
        return { success: true } as const;
      }),
  }),

  hotels: router({
    list: publicProcedure.query(async () => {
      const allHotels = await getAllHotels();
      return allHotels.map(hotel => ({
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
    }),
    create: publicProcedure
      .input(z.object({
        nameAr: z.string(), nameEn: z.string(), nameFr: z.string(), nameBer: z.string(),
        descriptionAr: z.string().optional(), descriptionEn: z.string().optional(),
        descriptionFr: z.string().optional(), descriptionBer: z.string().optional(),
        locationAr: z.string().optional(), locationEn: z.string().optional(),
        locationFr: z.string().optional(), locationBer: z.string().optional(),
        rating: z.string().default('4.5'),
        priceAr: z.string(), priceEn: z.string(), priceFr: z.string(), priceBer: z.string(),
        amenities: z.any().optional(), image: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createHotel(input);
        return { success: true } as const;
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nameAr: z.string(), nameEn: z.string(), nameFr: z.string(), nameBer: z.string(),
        descriptionAr: z.string().optional(), descriptionEn: z.string().optional(),
        descriptionFr: z.string().optional(), descriptionBer: z.string().optional(),
        locationAr: z.string().optional(), locationEn: z.string().optional(),
        locationFr: z.string().optional(), locationBer: z.string().optional(),
        rating: z.string(),
        priceAr: z.string(), priceEn: z.string(), priceFr: z.string(), priceBer: z.string(),
        amenities: z.any().optional(), image: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateHotel(id, data);
        return { success: true } as const;
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteHotel(input.id);
        return { success: true } as const;
      }),
  }),

  bookings: router({
    create: publicProcedure
      .input(z.object({
        type: z.enum(['hotel', 'car']),
        itemName: z.string(),
        guestName: z.string(),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        checkIn: z.string(),
        checkOut: z.string(),
        pickUpTime: z.string().optional(),
        dropOffTime: z.string().optional(),
        guests: z.number().default(1),
        notes: z.string().optional(),
        totalPrice: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
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
          status: 'pending',
        } as any);
        return { success: true, message: 'Booking request submitted successfully' } as const;
      }),
    list: publicProcedure.query(async () => {
      const allBookings = await getAllBookings();
      return allBookings;
    }),
  }),

  favorites: router({
    list: publicProcedure.query(async () => {
      // For public users, return empty (no auth needed)
      return [];
    }),
    add: publicProcedure
      .input(z.object({ itemType: z.enum(['car', 'hotel']), itemId: z.number() }))
      .mutation(async ({ input }) => {
        // For public users, we skip DB (no userId available)
        return { success: true } as const;
      }),
    remove: publicProcedure
      .input(z.object({ itemType: z.enum(['car', 'hotel']), itemId: z.number() }))
      .mutation(async ({ input }) => {
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
