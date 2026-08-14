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
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  isActiveIdx: index("idx_cars_isActive").on(t.isActive),
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  typeIdx: index("idx_bookings_type").on(t.type),
  statusIdx: index("idx_bookings_status").on(t.status),
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
  amenities: json("amenities"),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  isActiveIdx: index("idx_hotels_isActive").on(t.isActive),
}));

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = typeof hotels.$inferInsert;
