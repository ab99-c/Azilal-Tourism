import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date, time, json, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Cars table - stores car rental data
 */
export const cars = mysqlTable("cars", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameFr: varchar("nameFr", { length: 255 }).notNull(),
  nameBer: varchar("nameBer", { length: 255 }).notNull(),
  typeAr: varchar("typeAr", { length: 255 }).notNull(),
  typeEn: varchar("typeEn", { length: 255 }).notNull(),
  typeFr: varchar("typeFr", { length: 255 }).notNull(),
  typeBer: varchar("typeBer", { length: 255 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  descriptionFr: text("descriptionFr"),
  descriptionBer: text("descriptionBer"),
  seats: varchar("seats", { length: 50 }).notNull().default('5 مقاعد'),
  fuel: varchar("fuel", { length: 50 }).notNull().default('ديزل'),
  price: varchar("price", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  isActiveIdx: index("idx_cars_isActive").on(t.isActive),
  ownerIdIdx: index("idx_cars_ownerId").on(t.ownerId),
}));

export type Car = typeof cars.$inferSelect;
export type InsertCar = typeof cars.$inferInsert;

/**
 * Bookings table - stores hotel and car booking requests
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["hotel", "car"]).notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 320 }).notNull(),
  guestPhone: varchar("guestPhone", { length: 50 }),
  checkIn: date("checkIn").notNull(),
  checkOut: date("checkOut").notNull(),
  pickUpTime: time("pickUpTime"),
  dropOffTime: time("dropOffTime"),
  guests: int("guests").default(1),
  notes: text("notes"),
  totalPrice: varchar("totalPrice", { length: 100 }),
  paymentMethod: mysqlEnum("paymentMethod", ["pay_on_arrival"]).default("pay_on_arrival").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid"]).default("unpaid").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  itemId: int("itemId").default(0).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  // Logged-in guest who made this booking (NULL for anonymous guests).
  guestUserId: int("guestUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  typeIdx: index("idx_bookings_type").on(t.type),
  statusIdx: index("idx_bookings_status").on(t.status),
  guestIdx: index("idx_bookings_guest_user").on(t.guestUserId),
}));

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Favorites table - stores user's favorite items (cars, hotels)
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["car", "hotel"]).notNull(),
  itemId: int("itemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  uniqueFav: uniqueIndex("idx_favorites_unique").on(t.userId, t.itemType, t.itemId),
}));

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Hotels table - stores hotel data
 */
export const hotels = mysqlTable("hotels", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameFr: varchar("nameFr", { length: 255 }).notNull(),
  nameBer: varchar("nameBer", { length: 255 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  descriptionFr: text("descriptionFr"),
  descriptionBer: text("descriptionBer"),
  locationAr: varchar("locationAr", { length: 255 }),
  locationEn: varchar("locationEn", { length: 255 }),
  locationFr: varchar("locationFr", { length: 255 }),
  locationBer: varchar("locationBer", { length: 255 }),
  rating: varchar("rating", { length: 10 }).notNull().default('4.5'),
  priceAr: varchar("priceAr", { length: 100 }).notNull(),
  priceEn: varchar("priceEn", { length: 100 }).notNull(),
  priceFr: varchar("priceFr", { length: 100 }).notNull(),
  priceBer: varchar("priceBer", { length: 100 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  amenities: json("amenities"),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  isActiveIdx: index("idx_hotels_isActive").on(t.isActive),
  ownerIdIdx: index("idx_hotels_ownerId").on(t.ownerId),
}));

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = typeof hotels.$inferInsert;

/**
 * Restaurants table - stores restaurant listings owned by individual owners.
 */
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameFr: varchar("nameFr", { length: 255 }).notNull(),
  nameBer: varchar("nameBer", { length: 255 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  descriptionFr: text("descriptionFr"),
  descriptionBer: text("descriptionBer"),
  locationAr: varchar("locationAr", { length: 255 }),
  locationEn: varchar("locationEn", { length: 255 }),
  locationFr: varchar("locationFr", { length: 255 }),
  locationBer: varchar("locationBer", { length: 255 }),
  cuisineAr: varchar("cuisineAr", { length: 255 }),
  cuisineEn: varchar("cuisineEn", { length: 255 }),
  cuisineFr: varchar("cuisineFr", { length: 255 }),
  cuisineBer: varchar("cuisineBer", { length: 255 }),
  rating: varchar("rating", { length: 10 }).notNull().default('4.5'),
  hours: varchar("hours", { length: 50 }).notNull().default('9:00 - 23:00'),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  isActiveIdx: index("idx_restaurants_isActive").on(t.isActive),
  ownerIdIdx: index("idx_restaurants_ownerId").on(t.ownerId),
}));

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

/**
 * Cafes table - stores cafe listings owned by individual owners.
 */
export const cafes = mysqlTable("cafes", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameFr: varchar("nameFr", { length: 255 }).notNull(),
  nameBer: varchar("nameBer", { length: 255 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  descriptionFr: text("descriptionFr"),
  descriptionBer: text("descriptionBer"),
  locationAr: varchar("locationAr", { length: 255 }),
  locationEn: varchar("locationEn", { length: 255 }),
  locationFr: varchar("locationFr", { length: 255 }),
  locationBer: varchar("locationBer", { length: 255 }),
  rating: varchar("rating", { length: 10 }).notNull().default('4.5'),
  hours: varchar("hours", { length: 50 }).notNull().default('8:00 - 24:00'),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  isActiveIdx: index("idx_cafes_isActive").on(t.isActive),
  ownerIdIdx: index("idx_cafes_ownerId").on(t.ownerId),
}));

export type Cafe = typeof cafes.$inferSelect;
export type InsertCafe = typeof cafes.$inferInsert;

/**
 * Safety trips: consent-based journey check-ins for mountain routes.
 * This stores only the last location explicitly shared by the traveler.
 */
export const safetyTrips = mysqlTable("safety_trips", {
  id: int("id").autoincrement().primaryKey(),
  publicToken: varchar("publicToken", { length: 96 }).notNull(),
  travelerName: varchar("travelerName", { length: 255 }).notNull(),
  travelerEmail: varchar("travelerEmail", { length: 320 }).notNull(),
  emergencyName: varchar("emergencyName", { length: 255 }),
  emergencyPhone: varchar("emergencyPhone", { length: 50 }),
  route: varchar("route", { length: 500 }).notNull(),
  departureAt: timestamp("departureAt").notNull(),
  expectedArrivalAt: timestamp("expectedArrivalAt").notNull(),
  consentAt: timestamp("consentAt").notNull(),
  locationConsent: boolean("locationConsent").default(false).notNull(),
  lastCheckInAt: timestamp("lastCheckInAt"),
  lastLocationLat: varchar("lastLocationLat", { length: 32 }),
  lastLocationLng: varchar("lastLocationLng", { length: 32 }),
  lastLocationSharedAt: timestamp("lastLocationSharedAt"),
  status: mysqlEnum("status", ["active", "safe", "overdue", "closed"]).default("active").notNull(),
  overdueNotifiedAt: timestamp("overdueNotifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  tokenIdx: uniqueIndex("idx_safety_trips_public_token").on(t.publicToken),
  statusIdx: index("idx_safety_trips_status").on(t.status),
  expectedArrivalIdx: index("idx_safety_trips_expected_arrival").on(t.expectedArrivalAt),
}));

export type SafetyTrip = typeof safetyTrips.$inferSelect;
export type InsertSafetyTrip = typeof safetyTrips.$inferInsert;
