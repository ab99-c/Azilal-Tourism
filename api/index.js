// server/vercel-api.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/storageProxy.ts
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/db.ts
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date, time, json, index, uniqueIndex } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  providerType: mysqlEnum("providerType", ["tourist", "hotel_owner", "restaurant_owner", "activity_provider", "guide", "transport_provider"]).default("tourist").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var emailAuthTokens = mysqlTable("email_auth_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  kind: mysqlEnum("kind", ["email_verification", "password_reset"]).notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (t2) => ({
  tokenHashIdx: uniqueIndex("idx_email_auth_tokens_hash").on(t2.tokenHash),
  userKindIdx: index("idx_email_auth_tokens_user_kind").on(t2.userId, t2.kind),
  expiryIdx: index("idx_email_auth_tokens_expiry").on(t2.expiresAt)
}));
var cars = mysqlTable("cars", {
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
  seats: varchar("seats", { length: 50 }).notNull().default("5 \u0645\u0642\u0627\u0639\u062F"),
  fuel: varchar("fuel", { length: 50 }).notNull().default("\u062F\u064A\u0632\u0644"),
  price: varchar("price", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (t2) => ({
  isActiveIdx: index("idx_cars_isActive").on(t2.isActive),
  ownerIdIdx: index("idx_cars_ownerId").on(t2.ownerId)
}));
var bookings = mysqlTable("bookings", {
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
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  itemId: int("itemId").default(0).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  // Logged-in guest who made this booking (NULL for anonymous guests).
  guestUserId: int("guestUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (t2) => ({
  typeIdx: index("idx_bookings_type").on(t2.type),
  statusIdx: index("idx_bookings_status").on(t2.status),
  guestIdx: index("idx_bookings_guest_user").on(t2.guestUserId)
}));
var availabilityBlocks = mysqlTable("availability_blocks", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["hotel", "car"]).notNull(),
  itemId: int("itemId").notNull(),
  ownerId: int("ownerId").notNull(),
  startsAt: date("startsAt").notNull(),
  endsAt: date("endsAt").notNull(),
  reason: varchar("reason", { length: 240 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (t2) => ({
  itemRangeIdx: index("idx_availability_item_range").on(t2.type, t2.itemId, t2.startsAt, t2.endsAt),
  ownerIdx: index("idx_availability_owner").on(t2.ownerId)
}));
var favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["car", "hotel"]).notNull(),
  itemId: int("itemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (t2) => ({
  uniqueFav: uniqueIndex("idx_favorites_unique").on(t2.userId, t2.itemType, t2.itemId)
}));
var hotels = mysqlTable("hotels", {
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
  rating: varchar("rating", { length: 10 }).notNull().default("4.5"),
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (t2) => ({
  isActiveIdx: index("idx_hotels_isActive").on(t2.isActive),
  ownerIdIdx: index("idx_hotels_ownerId").on(t2.ownerId)
}));
var restaurants = mysqlTable("restaurants", {
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
  rating: varchar("rating", { length: 10 }).notNull().default("4.5"),
  hours: varchar("hours", { length: 50 }).notNull().default("9:00 - 23:00"),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (t2) => ({
  isActiveIdx: index("idx_restaurants_isActive").on(t2.isActive),
  ownerIdIdx: index("idx_restaurants_ownerId").on(t2.ownerId)
}));
var cafes = mysqlTable("cafes", {
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
  rating: varchar("rating", { length: 10 }).notNull().default("4.5"),
  hours: varchar("hours", { length: 50 }).notNull().default("8:00 - 24:00"),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  ownerId: int("ownerId").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (t2) => ({
  isActiveIdx: index("idx_cafes_isActive").on(t2.isActive),
  ownerIdIdx: index("idx_cafes_ownerId").on(t2.ownerId)
}));
var safetyTrips = mysqlTable("safety_trips", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (t2) => ({
  tokenIdx: uniqueIndex("idx_safety_trips_public_token").on(t2.publicToken),
  statusIdx: index("idx_safety_trips_status").on(t2.status),
  expectedArrivalIdx: index("idx_safety_trips_expected_arrival").on(t2.expectedArrivalAt)
}));

// server/db.ts
var _db = null;
var _pool = null;
function classifyDatabaseError(error) {
  if (!process.env.DATABASE_URL) return "database_not_configured";
  const candidate = error;
  const code = candidate?.code ?? "";
  const message = candidate?.message ?? "";
  if (/unknown column|doesn't exist|does not exist|schema|table .*not found/i.test(message) || [1054, 1146].includes(Number(candidate?.errno))) {
    return "database_schema_mismatch";
  }
  if (["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ER_ACCESS_DENIED_ERROR", "PROTOCOL_CONNECTION_LOST"].includes(code) || /connection|connect|timeout|access denied/i.test(message)) {
    return "database_connection_failed";
  }
  return "database_query_failed";
}
function isTransientDatabaseError(error) {
  const candidate = error;
  const code = candidate?.code ?? "";
  const message = candidate?.message ?? "";
  return ["ETIMEDOUT", "ECONNRESET", "EPIPE", "PROTOCOL_CONNECTION_LOST", "ER_CON_COUNT_ERROR"].includes(code) || /timeout|timed out|connection lost|connection reset/i.test(message);
}
async function withTransientDatabaseRetry(operation) {
  try {
    return await operation();
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 150));
    return operation();
  }
}
async function checkDatabaseHealth() {
  const startedAt = Date.now();
  const db = await getDb();
  if (!db) return { ok: false, latencyMs: Date.now() - startedAt, reason: "database_unavailable" };
  try {
    await withTransientDatabaseRetry(() => db.execute(sql`SELECT 1`));
    return { ok: true, latencyMs: Date.now() - startedAt };
  } catch {
    return { ok: false, latencyMs: Date.now() - startedAt, reason: "database_query_failed" };
  }
}
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connectionUrl = new URL(process.env.DATABASE_URL);
      const requiresTls = connectionUrl.searchParams.has("ssl") || connectionUrl.searchParams.has("sslaccept") || connectionUrl.searchParams.has("tls") || connectionUrl.hostname.endsWith("tidbcloud.com");
      _pool = createPool({
        host: connectionUrl.hostname,
        port: connectionUrl.port ? Number(connectionUrl.port) : 3306,
        user: decodeURIComponent(connectionUrl.username),
        password: decodeURIComponent(connectionUrl.password),
        database: decodeURIComponent(connectionUrl.pathname.replace(/^\//, "")),
        waitForConnections: true,
        connectionLimit: 8,
        maxIdle: 8,
        idleTimeout: 6e4,
        queueLimit: 16,
        connectTimeout: 1e4,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ...requiresTls ? { ssl: { rejectUnauthorized: false } } : {}
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to initialize pool:", error);
      _pool = null;
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}
function createEmailAuthTokenValue() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}
async function issueEmailAuthToken(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const { rawToken, tokenHash } = createEmailAuthTokenValue();
  await db.delete(emailAuthTokens).where(and(eq(emailAuthTokens.userId, input.userId), eq(emailAuthTokens.kind, input.kind), isNull(emailAuthTokens.usedAt)));
  await db.insert(emailAuthTokens).values({
    userId: input.userId,
    kind: input.kind,
    tokenHash,
    expiresAt: new Date(Date.now() + input.ttlMs)
  });
  return rawToken;
}
async function consumeEmailAuthToken(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const tokenHash = createHash("sha256").update(input.rawToken).digest("hex");
  const updated = await db.update(emailAuthTokens).set({ usedAt: /* @__PURE__ */ new Date() }).where(and(
    eq(emailAuthTokens.tokenHash, tokenHash),
    eq(emailAuthTokens.kind, input.kind),
    isNull(emailAuthTokens.usedAt),
    sql`${emailAuthTokens.expiresAt} > NOW()`
  ));
  const result = updated;
  if (!result.affectedRows) return void 0;
  const token = await db.select().from(emailAuthTokens).where(eq(emailAuthTokens.tokenHash, tokenHash)).limit(1);
  return token[0];
}
async function markEmailVerified(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ emailVerifiedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
}
async function createLocalUser(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(users).values({
    openId: input.openId,
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    loginMethod: "email_password",
    role: "user",
    providerType: input.providerType ?? "tourist",
    lastSignedIn: /* @__PURE__ */ new Date()
  });
  return getUserByEmail(input.email);
}
async function setLocalPassword(userId, passwordHash) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({
    passwordHash,
    loginMethod: "email_password",
    lastSignedIn: /* @__PURE__ */ new Date()
  }).where(eq(users.id, userId));
}
async function getMyCars(ownerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cars).where(eq(cars.ownerId, ownerId)).orderBy(desc(cars.createdAt)).limit(100);
}
async function getMyHotels(ownerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hotels).where(eq(hotels.ownerId, ownerId)).orderBy(desc(hotels.createdAt));
}
async function getMyBookings(ownerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.ownerId, ownerId)).orderBy(desc(bookings.createdAt)).limit(200);
}
async function getBookingById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function findBookingAvailabilityConflict(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [ownerBlock] = await db.select().from(availabilityBlocks).where(and(
    eq(availabilityBlocks.type, input.type),
    eq(availabilityBlocks.itemId, input.itemId),
    sql`${availabilityBlocks.startsAt} < ${input.endsAt}`,
    sql`${availabilityBlocks.endsAt} > ${input.startsAt}`
  )).limit(1);
  if (ownerBlock) return { kind: "owner_block", block: ownerBlock };
  const [confirmedBooking] = await db.select().from(bookings).where(and(
    eq(bookings.type, input.type),
    eq(bookings.itemId, input.itemId),
    sql`${bookings.status} IN ('pending', 'confirmed')`,
    sql`${bookings.checkIn} < ${input.endsAt}`,
    sql`${bookings.checkOut} > ${input.startsAt}`,
    input.excludeBookingId === void 0 ? sql`1 = 1` : sql`${bookings.id} <> ${input.excludeBookingId}`
  )).limit(1);
  if (confirmedBooking) return { kind: "active_booking", booking: confirmedBooking };
  return null;
}
async function listAvailabilityBlocksForOwner(ownerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(availabilityBlocks).where(eq(availabilityBlocks.ownerId, ownerId)).orderBy(desc(availabilityBlocks.startsAt)).limit(200);
}
async function getAvailabilityBlockById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(availabilityBlocks).where(eq(availabilityBlocks.id, id)).limit(1);
  return result[0];
}
async function createAvailabilityBlock(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.insert(availabilityBlocks).values(input);
}
async function deleteAvailabilityBlock(id) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));
}
async function getAllCars() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cars).where(eq(cars.isActive, true)).orderBy(desc(cars.createdAt)).limit(100);
}
async function getCarById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createCar(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = data.ownerId ?? 1;
  return db.insert(cars).values({ ...data, ownerId });
}
async function updateCar(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(cars).set(data).where(eq(cars.id, id));
}
async function deleteCar(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cars).where(eq(cars.id, id));
}
async function getAllHotels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hotels).where(eq(hotels.isActive, true)).orderBy(desc(hotels.createdAt));
}
async function getHotelById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(hotels).where(eq(hotels.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createHotel(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = data.ownerId ?? 1;
  return db.insert(hotels).values({ ...data, ownerId });
}
async function updateHotel(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(hotels).set(data).where(eq(hotels.id, id));
}
async function deleteHotel(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(hotels).where(eq(hotels.id, id));
}
async function getAllRestaurants() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurants).where(eq(restaurants.isActive, true)).orderBy(desc(restaurants.createdAt));
}
async function getRestaurantById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getMyRestaurants(ownerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId)).orderBy(desc(restaurants.createdAt));
}
async function createRestaurant(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = data.ownerId ?? 1;
  const result = await db.insert(restaurants).values({ ...data, ownerId });
  return { id: result?.[0]?.insertId ?? null };
}
async function updateRestaurant(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(restaurants).set(data).where(eq(restaurants.id, id));
}
async function deleteRestaurant(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(restaurants).where(eq(restaurants.id, id));
}
async function getAllCafes() {
  const db = await getDb();
  if (!db) return [];
  return withTransientDatabaseRetry(
    () => db.select().from(cafes).where(eq(cafes.isActive, true)).orderBy(desc(cafes.createdAt)).limit(100)
  );
}
async function getCafeById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(cafes).where(eq(cafes.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getMyCafes(ownerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cafes).where(eq(cafes.ownerId, ownerId)).orderBy(desc(cafes.createdAt)).limit(100);
}
async function createCafe(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = data.ownerId ?? 1;
  const result = await db.insert(cafes).values({ ...data, ownerId });
  return { id: result?.[0]?.insertId ?? null };
}
async function updateCafe(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(cafes).set(data).where(eq(cafes.id, id));
}
async function deleteCafe(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cafes).where(eq(cafes.id, id));
}
async function getPendingListingReviewQueue() {
  const db = await getDb();
  if (!db) return { cars: [], hotels: [], restaurants: [], cafes: [] };
  const [pendingCars, pendingHotels, pendingRestaurants, pendingCafes] = await Promise.all([
    db.select().from(cars).where(eq(cars.isActive, false)).orderBy(desc(cars.createdAt)).limit(100),
    db.select().from(hotels).where(eq(hotels.isActive, false)).orderBy(desc(hotels.createdAt)).limit(100),
    db.select().from(restaurants).where(eq(restaurants.isActive, false)).orderBy(desc(restaurants.createdAt)).limit(100),
    db.select().from(cafes).where(eq(cafes.isActive, false)).orderBy(desc(cafes.createdAt)).limit(100)
  ]);
  return { cars: pendingCars, hotels: pendingHotels, restaurants: pendingRestaurants, cafes: pendingCafes };
}
async function createBooking(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = data.ownerId ?? 1;
  const itemId = data.itemId ?? 0;
  return db.insert(bookings).values({ ...data, ownerId, itemId });
}
async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(200);
}
async function markBookingPaid(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ paymentStatus: "paid" }).where(eq(bookings.id, id));
}
async function confirmBooking(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ status: "confirmed", paymentStatus: "paid" }).where(eq(bookings.id, id));
}
async function completeBooking(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ status: "completed" }).where(eq(bookings.id, id));
}
async function getGuestBookings(guestUserId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.guestUserId, guestUserId)).orderBy(desc(bookings.createdAt)).limit(100);
}
async function cancelBooking(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, id));
}
async function createSafetyTrip(data) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(safetyTrips).values(data);
  const created = await db.select().from(safetyTrips).where(eq(safetyTrips.publicToken, data.publicToken)).limit(1);
  return created[0];
}
async function getSafetyTripByToken(publicToken) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(safetyTrips).where(eq(safetyTrips.publicToken, publicToken)).limit(1);
  return rows[0];
}
async function updateSafetyTrip(publicToken, data) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(safetyTrips).set(data).where(eq(safetyTrips.publicToken, publicToken));
  return getSafetyTripByToken(publicToken);
}
async function listSafetyTrips() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(safetyTrips).orderBy(desc(safetyTrips.createdAt));
}
async function findSafetyTripsForEscalation() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(safetyTrips).where(and(eq(safetyTrips.status, "active"), isNull(safetyTrips.overdueNotifiedAt))).orderBy(desc(safetyTrips.expectedArrivalAt));
}
async function markSafetyTripOverdue(publicToken, notifiedAt) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.update(safetyTrips).set({ status: "overdue", overdueNotifiedAt: notifiedAt }).where(and(eq(safetyTrips.publicToken, publicToken), eq(safetyTrips.status, "active"), isNull(safetyTrips.overdueNotifiedAt)));
  return result;
}

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/databaseHealth.ts
async function databaseHealthHandler(req, res) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }
    const health = await checkDatabaseHealth();
    if (!health.ok) {
      await notifyOwner({
        title: "\u062A\u0646\u0628\u064A\u0647: \u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u0627\u0646\u0627\u062A ADRAR \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629",
        content: `\u0641\u0634\u0644 \u0641\u062D\u0635 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A. \u0627\u0644\u0633\u0628\u0628: ${health.reason}. \u0627\u0644\u0645\u062F\u0629: ${health.latencyMs}ms. \u0644\u0645 \u064A\u062A\u0645 \u062A\u0636\u0645\u064A\u0646 \u0623\u064A \u0623\u0633\u0631\u0627\u0631 \u0623\u0648 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u062A\u0635\u0627\u0644.`
      });
      return res.status(503).json({ ok: false, alerted: true, latencyMs: health.latencyMs });
    }
    return res.json({ ok: true, latencyMs: health.latencyMs });
  } catch (error) {
    console.error("[DatabaseHealth] check failed", error);
    return res.status(500).json({ ok: false, error: "health_check_failed", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  }
}
async function databaseHealthStatus() {
  return checkDatabaseHealth();
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  dbHealth: adminProcedure.query(async () => databaseHealthStatus()),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { TRPCError as TRPCError4 } from "@trpc/server";
import { z as z2 } from "zod";
import { randomBytes as randomBytes3 } from "node:crypto";

// server/cache.ts
var DEFAULT_TTL_MS = 6e4;
var store = /* @__PURE__ */ new Map();
function cached(key, ttlMs = DEFAULT_TTL_MS) {
  return {
    get() {
      const entry = store.get(key);
      if (!entry) return void 0;
      if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return void 0;
      }
      return entry.value;
    },
    set(value) {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
  };
}
function invalidateCache(prefix) {
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}

// server/localAuth.ts
import { randomBytes as randomBytes2, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
var scrypt = promisify(scryptCallback);
var KEY_LENGTH = 64;
async function hashPassword(password) {
  const salt = randomBytes2(16);
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}
async function verifyPassword(password, stored) {
  if (!stored) return false;
  const [algorithm, encodedSalt, encodedHash] = stored.split("$");
  if (algorithm !== "scrypt" || !encodedSalt || !encodedHash) return false;
  try {
    const salt = Buffer.from(encodedSalt, "base64url");
    const expected = Buffer.from(encodedHash, "base64url");
    if (salt.length < 16 || expected.length !== KEY_LENGTH) return false;
    const derived = await scrypt(password, salt, KEY_LENGTH);
    return timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}
function isValidBootstrapSecret(candidate) {
  const expected = process.env.AUTH_BOOTSTRAP_SECRET?.trim();
  if (!expected || expected.length < 12 || candidate.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
}

// server/authRateLimit.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
var WINDOW_MS = 15 * 60 * 1e3;
var MAX_ATTEMPTS = {
  register: 5,
  login: 10,
  "admin-activation": 3,
  "password-reset": 5
};
var buckets = /* @__PURE__ */ new Map();
function getClientAddress(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return firstForwarded?.trim() || req.socket.remoteAddress || "unknown";
}
function bucketKey(req, action) {
  return `${action}:${getClientAddress(req)}`;
}
function pruneExpired(now) {
  if (buckets.size < 1e3) return;
  for (const [key, bucket] of Array.from(buckets.entries())) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
function assertAuthRateLimit(req, action, now = Date.now()) {
  pruneExpired(now);
  const key = bucketKey(req, action);
  const previous = buckets.get(key);
  const bucket = !previous || previous.resetAt <= now ? { count: 0, resetAt: now + WINDOW_MS } : previous;
  if (bucket.count >= MAX_ATTEMPTS[action]) {
    throw new TRPCError3({ code: "TOO_MANY_REQUESTS", message: "AUTH_RATE_LIMITED" });
  }
  bucket.count += 1;
  buckets.set(key, bucket);
}
function clearAuthRateLimit(req, action) {
  buckets.delete(bucketKey(req, action));
}

// server/routers.ts
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError4({ code: "FORBIDDEN", message: "ADMIN_ONLY_ERR" });
  }
  return next({ ctx });
});
var MAX_IMAGE_BYTES = 4 * 1024 * 1024;
var ALLOWED_IMAGE_EXTS = /* @__PURE__ */ new Set(["jpg", "jpeg", "png", "webp"]);
var EXT_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};
function extractExt(fileName) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? null : fileName.slice(lastDot + 1);
}
function safeName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "image";
}
function base64ToBuffer(base64) {
  const idx = base64.indexOf(",");
  const data = idx === -1 ? base64 : base64.slice(idx + 1);
  return Buffer.from(data, "base64");
}
var ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  return next({ ctx: { ...ctx, ownerId: ctx.user.id } });
});
async function requireOwnership(ctx, item, itemKind) {
  if (!item)
    throw new TRPCError4({ code: "NOT_FOUND", message: "ITEM_NOT_FOUND" });
  if (ctx.user.role !== "admin" && item.ownerId !== ctx.user.id) {
    throw new TRPCError4({ code: "FORBIDDEN", message: "OWNER_ONLY_ERR" });
  }
}
async function requireBookingAccess(ctx, id) {
  const booking = await getBookingById(id);
  if (!booking)
    throw new TRPCError4({ code: "NOT_FOUND", message: "BOOKING_NOT_FOUND" });
  if (ctx.user.role !== "admin" && booking.ownerId !== ctx.user.id) {
    throw new TRPCError4({ code: "FORBIDDEN", message: "OWNER_ONLY_ERR" });
  }
  return booking;
}
var carsListCache = cached("cars:list");
var hotelsListCache = cached("hotels:list");
var MAX_NAME = 255;
var MAX_TEXT = 5e3;
var MAX_SHORT = 200;
var localEmail = z2.string().trim().email().max(320).transform((value) => value.toLowerCase());
var localPassword = z2.string().min(10).max(200);
var LOCAL_SESSION_MS = 30 * 24 * 60 * 60 * 1e3;
var availabilityDateRange = z2.object({
  type: z2.enum(["hotel", "car"]),
  itemId: z2.number().int().positive(),
  startsAt: z2.string(),
  endsAt: z2.string()
}).refine(
  (input) => {
    const start = new Date(input.startsAt);
    const end = new Date(input.endsAt);
    return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end.getTime() > start.getTime();
  },
  { message: "endsAt must be after startsAt" }
);
var whatsappInput = z2.string().trim().max(50).refine(
  (value) => {
    if (!value) return true;
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  },
  { message: "Enter a valid WhatsApp number" }
).optional();
function safeDatabaseErrorMeta(error) {
  const root = error;
  const cause = root?.cause;
  const source = cause && (cause.code || cause.errno || cause.sqlState) ? cause : root;
  return {
    name: typeof source?.name === "string" ? source.name : void 0,
    code: typeof source?.code === "string" ? source.code : void 0,
    errno: typeof source?.errno === "number" ? source.errno : void 0,
    sqlState: typeof source?.sqlState === "string" ? source.sqlState : void 0
  };
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    ensureUser: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.user) {
        await upsertUser({
          openId: ctx.user.openId,
          name: ctx.user.name,
          email: ctx.user.email,
          loginMethod: ctx.user.loginMethod,
          lastSignedIn: /* @__PURE__ */ new Date()
        });
      }
      return { success: true };
    }),
    prepareEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserByOpenId(ctx.user.openId);
      if (!user?.email)
        return {
          ready: false,
          reason: "EMAIL_MISSING",
          dispatchEnabled: false
        };
      await issueEmailAuthToken({
        userId: user.id,
        kind: "email_verification",
        ttlMs: 24 * 60 * 60 * 1e3
      });
      return {
        ready: true,
        dispatchEnabled: false,
        expiresInMs: 24 * 60 * 60 * 1e3
      };
    }),
    requestPasswordReset: publicProcedure.input(z2.object({ email: localEmail })).mutation(async ({ input, ctx }) => {
      assertAuthRateLimit(ctx.req, "password-reset");
      const user = await getUserByEmail(input.email);
      if (user)
        await issueEmailAuthToken({
          userId: user.id,
          kind: "password_reset",
          ttlMs: 60 * 60 * 1e3
        });
      clearAuthRateLimit(ctx.req, "password-reset");
      return { accepted: true, dispatchEnabled: false };
    }),
    verifyEmail: publicProcedure.input(z2.object({ token: z2.string().trim().min(32).max(128) })).mutation(async ({ input }) => {
      const token = await consumeEmailAuthToken({
        rawToken: input.token,
        kind: "email_verification"
      });
      if (!token)
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "INVALID_OR_EXPIRED_TOKEN"
        });
      await markEmailVerified(token.userId);
      const user = await getUserById(token.userId);
      return { verified: Boolean(user?.emailVerifiedAt) };
    }),
    resetPassword: publicProcedure.input(
      z2.object({
        token: z2.string().trim().min(32).max(128),
        password: localPassword
      })
    ).mutation(async ({ input }) => {
      const token = await consumeEmailAuthToken({
        rawToken: input.token,
        kind: "password_reset"
      });
      if (!token)
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "INVALID_OR_EXPIRED_TOKEN"
        });
      await setLocalPassword(
        token.userId,
        await hashPassword(input.password)
      );
      return { reset: true };
    }),
    register: publicProcedure.input(
      z2.object({
        name: z2.string().trim().min(2).max(120),
        email: localEmail,
        password: localPassword,
        providerType: z2.enum([
          "tourist",
          "hotel_owner",
          "restaurant_owner",
          "activity_provider",
          "guide",
          "transport_provider"
        ]).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      assertAuthRateLimit(ctx.req, "register");
      let existing;
      try {
        existing = await getUserByEmail(input.email);
      } catch (error) {
        const reason = classifyDatabaseError(error);
        console.error("[Auth] Registration lookup failed", {
          reason,
          ...safeDatabaseErrorMeta(error)
        });
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "AUTH_SERVICE_UNAVAILABLE"
        });
      }
      if (existing)
        throw new TRPCError4({
          code: "CONFLICT",
          message: "EMAIL_ALREADY_REGISTERED"
        });
      let user;
      try {
        user = await createLocalUser({
          openId: `local_${randomBytes3(24).toString("base64url")}`,
          name: input.name,
          email: input.email,
          passwordHash: await hashPassword(input.password),
          providerType: input.providerType
        });
      } catch (error) {
        const message = String(error instanceof Error ? error.message : error);
        if (/duplicate|unique|already exists/i.test(message)) {
          throw new TRPCError4({
            code: "CONFLICT",
            message: "EMAIL_ALREADY_REGISTERED"
          });
        }
        const reason = classifyDatabaseError(error);
        console.error("[Auth] Local account creation failed", { reason });
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "AUTH_SERVICE_UNAVAILABLE"
        });
      }
      if (!user)
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "ACCOUNT_CREATION_FAILED"
        });
      const token = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: LOCAL_SESSION_MS
      });
      ctx.res.cookie(COOKIE_NAME, token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: LOCAL_SESSION_MS
      });
      clearAuthRateLimit(ctx.req, "register");
      return { user };
    }),
    login: publicProcedure.input(z2.object({ email: localEmail, password: localPassword })).mutation(async ({ input, ctx }) => {
      assertAuthRateLimit(ctx.req, "login");
      let user;
      try {
        user = await getUserByEmail(input.email);
      } catch (error) {
        const reason = classifyDatabaseError(error);
        console.error("[Auth] Login lookup failed", {
          reason,
          ...safeDatabaseErrorMeta(error)
        });
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "AUTH_SERVICE_UNAVAILABLE"
        });
      }
      if (user && !user.passwordHash && user.loginMethod !== "email_password") {
        throw new TRPCError4({
          code: "UNAUTHORIZED",
          message: "OAUTH_ACCOUNT_USE_OAUTH"
        });
      }
      if (!user || !await verifyPassword(input.password, user.passwordHash)) {
        throw new TRPCError4({
          code: "UNAUTHORIZED",
          message: "INVALID_CREDENTIALS"
        });
      }
      const token = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: LOCAL_SESSION_MS
      });
      ctx.res.cookie(COOKIE_NAME, token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: LOCAL_SESSION_MS
      });
      clearAuthRateLimit(ctx.req, "login");
      return { user };
    }),
    activateExistingAdmin: publicProcedure.input(
      z2.object({
        email: localEmail,
        password: localPassword,
        bootstrapSecret: z2.string().min(12).max(200)
      })
    ).mutation(async ({ input, ctx }) => {
      assertAuthRateLimit(ctx.req, "admin-activation");
      if (!isValidBootstrapSecret(input.bootstrapSecret)) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "INVALID_BOOTSTRAP_SECRET"
        });
      }
      const user = await getUserByEmail(input.email);
      if (!user || user.role !== "admin") {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "ADMIN_ACCOUNT_NOT_FOUND"
        });
      }
      if (user.passwordHash)
        throw new TRPCError4({
          code: "CONFLICT",
          message: "ADMIN_ALREADY_ACTIVATED"
        });
      await setLocalPassword(user.id, await hashPassword(input.password));
      const token = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: LOCAL_SESSION_MS
      });
      ctx.res.cookie(COOKIE_NAME, token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: LOCAL_SESSION_MS
      });
      clearAuthRateLimit(ctx.req, "admin-activation");
      return {
        user: { ...user, passwordHash: null, loginMethod: "email_password" }
      };
    })
  }),
  safetyTrips: router({
    create: publicProcedure.input(
      z2.object({
        travelerName: z2.string().trim().min(2).max(MAX_NAME),
        travelerEmail: z2.string().trim().email().max(320),
        emergencyName: z2.string().trim().max(MAX_NAME).optional(),
        emergencyPhone: z2.string().trim().max(50).optional(),
        route: z2.string().trim().min(2).max(500),
        departureAt: z2.coerce.date(),
        expectedArrivalAt: z2.coerce.date(),
        locationConsent: z2.boolean().default(false),
        consentAccepted: z2.literal(true)
      }).refine((input) => input.expectedArrivalAt > input.departureAt, {
        message: "Expected arrival must be after departure",
        path: ["expectedArrivalAt"]
      })
    ).mutation(async ({ input }) => {
      const now = /* @__PURE__ */ new Date();
      if (input.expectedArrivalAt.getTime() - now.getTime() > 7 * 24 * 60 * 60 * 1e3) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Trip duration cannot exceed 7 days"
        });
      }
      const publicToken = randomBytes3(36).toString("base64url");
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
        status: "active"
      });
      return { trip };
    }),
    get: publicProcedure.input(z2.object({ token: z2.string().min(32).max(96) })).query(async ({ input }) => {
      const trip = await getSafetyTripByToken(input.token);
      if (!trip)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "SAFETY_TRIP_NOT_FOUND"
        });
      return trip;
    }),
    checkIn: publicProcedure.input(
      z2.object({
        token: z2.string().min(32).max(96),
        latitude: z2.number().min(-90).max(90).optional(),
        longitude: z2.number().min(-180).max(180).optional()
      })
    ).mutation(async ({ input }) => {
      const trip = await getSafetyTripByToken(input.token);
      if (!trip)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "SAFETY_TRIP_NOT_FOUND"
        });
      if (trip.status === "safe" || trip.status === "closed") return trip;
      const now = /* @__PURE__ */ new Date();
      return updateSafetyTrip(input.token, {
        lastCheckInAt: now,
        ...trip.locationConsent && input.latitude !== void 0 && input.longitude !== void 0 ? {
          lastLocationLat: String(input.latitude),
          lastLocationLng: String(input.longitude),
          lastLocationSharedAt: now
        } : {},
        status: "active"
      });
    }),
    markSafe: publicProcedure.input(z2.object({ token: z2.string().min(32).max(96) })).mutation(async ({ input }) => {
      const trip = await getSafetyTripByToken(input.token);
      if (!trip)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "SAFETY_TRIP_NOT_FOUND"
        });
      return updateSafetyTrip(input.token, {
        status: "safe",
        lastCheckInAt: /* @__PURE__ */ new Date()
      });
    }),
    adminList: adminProcedure2.query(async () => listSafetyTrips())
  }),
  cars: router({
    list: publicProcedure.query(async () => {
      const hit = carsListCache.get();
      if (hit) return hit;
      const allCars = await getAllCars();
      const mapped = allCars.map((car) => ({
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
        image: car.image
      }));
      carsListCache.set(mapped);
      return mapped;
    }),
    create: ownerProcedure.input(
      z2.object({
        nameAr: z2.string().max(MAX_NAME),
        nameEn: z2.string().max(MAX_NAME),
        nameFr: z2.string().max(MAX_NAME),
        nameBer: z2.string().max(MAX_NAME),
        typeAr: z2.string().max(MAX_NAME),
        typeEn: z2.string().max(MAX_NAME),
        typeFr: z2.string().max(MAX_NAME),
        typeBer: z2.string().max(MAX_NAME),
        descriptionAr: z2.string().max(MAX_TEXT).optional(),
        descriptionEn: z2.string().max(MAX_TEXT).optional(),
        descriptionFr: z2.string().max(MAX_TEXT).optional(),
        descriptionBer: z2.string().max(MAX_TEXT).optional(),
        seats: z2.string().max(MAX_SHORT).default("5 \u0645\u0642\u0627\u0639\u062F"),
        fuel: z2.string().max(MAX_SHORT).default("\u062F\u064A\u0632\u0644"),
        price: z2.string().max(MAX_SHORT),
        phone: z2.string().max(MAX_SHORT).optional(),
        whatsapp: whatsappInput,
        image: z2.string().max(2e3).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      await createCar({
        ...input,
        ownerId: ctx.user.id,
        isActive: ctx.user.role === "admin"
      });
      invalidateCache("cars");
      return { success: true };
    }),
    update: ownerProcedure.input(
      z2.object({
        id: z2.number().int().positive(),
        nameAr: z2.string().max(MAX_NAME),
        nameEn: z2.string().max(MAX_NAME),
        nameFr: z2.string().max(MAX_NAME),
        nameBer: z2.string().max(MAX_NAME),
        typeAr: z2.string().max(MAX_NAME),
        typeEn: z2.string().max(MAX_NAME),
        typeFr: z2.string().max(MAX_NAME),
        typeBer: z2.string().max(MAX_NAME),
        descriptionAr: z2.string().max(MAX_TEXT).optional(),
        descriptionEn: z2.string().max(MAX_TEXT).optional(),
        descriptionFr: z2.string().max(MAX_TEXT).optional(),
        descriptionBer: z2.string().max(MAX_TEXT).optional(),
        seats: z2.string().max(MAX_SHORT),
        fuel: z2.string().max(MAX_SHORT),
        price: z2.string().max(MAX_SHORT),
        phone: z2.string().max(MAX_SHORT).optional(),
        whatsapp: whatsappInput,
        image: z2.string().max(2e3).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const car = await getCarById(id);
      await requireOwnership({ user: ctx.user }, car, "car");
      await updateCar(id, {
        ...data,
        isActive: ctx.user.role === "admin"
      });
      invalidateCache("cars");
      return { success: true };
    }),
    delete: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const car = await getCarById(input.id);
      await requireOwnership({ user: ctx.user }, car, "car");
      await deleteCar(input.id);
      invalidateCache("cars");
      return { success: true };
    })
  }),
  hotels: router({
    list: publicProcedure.query(async () => {
      const hit = hotelsListCache.get();
      if (hit) return hit;
      const allHotels = await getAllHotels();
      const mapped = allHotels.map((hotel) => ({
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
        image: hotel.image
      }));
      hotelsListCache.set(mapped);
      return mapped;
    }),
    create: ownerProcedure.input(
      z2.object({
        nameAr: z2.string().max(MAX_NAME),
        nameEn: z2.string().max(MAX_NAME),
        nameFr: z2.string().max(MAX_NAME),
        nameBer: z2.string().max(MAX_NAME),
        descriptionAr: z2.string().max(MAX_TEXT).optional(),
        descriptionEn: z2.string().max(MAX_TEXT).optional(),
        descriptionFr: z2.string().max(MAX_TEXT).optional(),
        descriptionBer: z2.string().max(MAX_TEXT).optional(),
        locationAr: z2.string().max(MAX_NAME).optional(),
        locationEn: z2.string().max(MAX_NAME).optional(),
        locationFr: z2.string().max(MAX_NAME).optional(),
        locationBer: z2.string().max(MAX_NAME).optional(),
        rating: z2.string().max(10).default("4.5"),
        priceAr: z2.string().max(MAX_SHORT),
        priceEn: z2.string().max(MAX_SHORT),
        priceFr: z2.string().max(MAX_SHORT),
        priceBer: z2.string().max(MAX_SHORT),
        whatsapp: whatsappInput,
        amenities: z2.any().optional(),
        image: z2.string().max(2e3).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      await createHotel({
        ...input,
        ownerId: ctx.user.id,
        isActive: ctx.user.role === "admin"
      });
      invalidateCache("hotels");
      return { success: true };
    }),
    update: ownerProcedure.input(
      z2.object({
        id: z2.number().int().positive(),
        nameAr: z2.string().max(MAX_NAME),
        nameEn: z2.string().max(MAX_NAME),
        nameFr: z2.string().max(MAX_NAME),
        nameBer: z2.string().max(MAX_NAME),
        descriptionAr: z2.string().max(MAX_TEXT).optional(),
        descriptionEn: z2.string().max(MAX_TEXT).optional(),
        descriptionFr: z2.string().max(MAX_TEXT).optional(),
        descriptionBer: z2.string().max(MAX_TEXT).optional(),
        locationAr: z2.string().max(MAX_NAME).optional(),
        locationEn: z2.string().max(MAX_NAME).optional(),
        locationFr: z2.string().max(MAX_NAME).optional(),
        locationBer: z2.string().max(MAX_NAME).optional(),
        rating: z2.string().max(10),
        priceAr: z2.string().max(MAX_SHORT),
        priceEn: z2.string().max(MAX_SHORT),
        priceFr: z2.string().max(MAX_SHORT),
        priceBer: z2.string().max(MAX_SHORT),
        whatsapp: whatsappInput,
        amenities: z2.any().optional(),
        image: z2.string().max(2e3).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const hotel = await getHotelById(id);
      await requireOwnership(
        { user: ctx.user },
        hotel,
        "hotel"
      );
      await updateHotel(id, {
        ...data,
        isActive: ctx.user.role === "admin"
      });
      invalidateCache("hotels");
      return { success: true };
    }),
    updateContact: ownerProcedure.input(
      z2.object({ id: z2.number().int().positive(), whatsapp: whatsappInput })
    ).mutation(async ({ input, ctx }) => {
      const hotel = await getHotelById(input.id);
      await requireOwnership(
        { user: ctx.user },
        hotel,
        "hotel"
      );
      await updateHotel(input.id, {
        whatsapp: input.whatsapp || null
      });
      invalidateCache("hotels");
      return { success: true };
    }),
    delete: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const hotel = await getHotelById(input.id);
      await requireOwnership(
        { user: ctx.user },
        hotel,
        "hotel"
      );
      await deleteHotel(input.id);
      invalidateCache("hotels");
      return { success: true };
    })
  }),
  restaurants: router({
    list: publicProcedure.query(async () => {
      return getAllRestaurants();
    }),
    create: ownerProcedure.input(
      z2.object({
        nameAr: z2.string().max(MAX_NAME),
        nameEn: z2.string().max(MAX_NAME),
        nameFr: z2.string().max(MAX_NAME),
        nameBer: z2.string().max(MAX_NAME),
        descriptionAr: z2.string().max(MAX_TEXT).optional(),
        descriptionEn: z2.string().max(MAX_TEXT).optional(),
        descriptionFr: z2.string().max(MAX_TEXT).optional(),
        descriptionBer: z2.string().max(MAX_TEXT).optional(),
        locationAr: z2.string().max(MAX_NAME).optional(),
        locationEn: z2.string().max(MAX_NAME).optional(),
        locationFr: z2.string().max(MAX_NAME).optional(),
        locationBer: z2.string().max(MAX_NAME).optional(),
        cuisineAr: z2.string().max(MAX_SHORT).optional(),
        cuisineEn: z2.string().max(MAX_SHORT).optional(),
        cuisineFr: z2.string().max(MAX_SHORT).optional(),
        cuisineBer: z2.string().max(MAX_SHORT).optional(),
        rating: z2.string().max(10).default("4.5"),
        hours: z2.string().max(MAX_SHORT).default("9:00 - 23:00"),
        phone: z2.string().max(MAX_SHORT).optional(),
        whatsapp: whatsappInput,
        image: z2.string().max(2e3).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const { id } = await createRestaurant({
        ...input,
        ownerId: ctx.user.id,
        isActive: ctx.user.role === "admin"
      });
      return { success: true, id };
    }),
    update: ownerProcedure.input(
      z2.object({
        id: z2.number().int().positive(),
        nameAr: z2.string().max(MAX_NAME),
        nameEn: z2.string().max(MAX_NAME),
        nameFr: z2.string().max(MAX_NAME),
        nameBer: z2.string().max(MAX_NAME),
        descriptionAr: z2.string().max(MAX_TEXT).optional(),
        descriptionEn: z2.string().max(MAX_TEXT).optional(),
        descriptionFr: z2.string().max(MAX_TEXT).optional(),
        descriptionBer: z2.string().max(MAX_TEXT).optional(),
        locationAr: z2.string().max(MAX_NAME).optional(),
        locationEn: z2.string().max(MAX_NAME).optional(),
        locationFr: z2.string().max(MAX_NAME).optional(),
        locationBer: z2.string().max(MAX_NAME).optional(),
        cuisineAr: z2.string().max(MAX_SHORT).optional(),
        cuisineEn: z2.string().max(MAX_SHORT).optional(),
        cuisineFr: z2.string().max(MAX_SHORT).optional(),
        cuisineBer: z2.string().max(MAX_SHORT).optional(),
        rating: z2.string().max(10),
        hours: z2.string().max(MAX_SHORT),
        phone: z2.string().max(MAX_SHORT).optional(),
        whatsapp: whatsappInput,
        image: z2.string().max(2e3).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const restaurant = await getRestaurantById(id);
      await requireOwnership(
        { user: ctx.user },
        restaurant,
        "restaurant"
      );
      await updateRestaurant(id, {
        ...data,
        isActive: ctx.user.role === "admin"
      });
      return { success: true };
    }),
    delete: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const restaurant = await getRestaurantById(input.id);
      await requireOwnership(
        { user: ctx.user },
        restaurant,
        "restaurant"
      );
      await deleteRestaurant(input.id);
      return { success: true };
    }),
    uploadImage: ownerProcedure.input(
      z2.object({
        id: z2.number().int().positive(),
        base64: z2.string().max(55e5),
        fileName: z2.string().max(255).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const restaurant = await getRestaurantById(input.id);
      await requireOwnership(
        { user: ctx.user },
        restaurant,
        "restaurant"
      );
      const ext = (extractExt(input.fileName || "image.png") || "png").toLowerCase();
      if (!ALLOWED_IMAGE_EXTS.has(ext)) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Unsupported image format (use JPG, PNG or WEBP)"
        });
      }
      const bytes = base64ToBuffer(input.base64);
      if (bytes.length > MAX_IMAGE_BYTES) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Image too large (max 4MB)"
        });
      }
      const { url } = await storagePut(
        `restaurants/${ctx.user.id}/${safeName(input.fileName || "image")}.${ext}`,
        bytes,
        EXT_MIME[ext] || "image/png"
      );
      await updateRestaurant(input.id, { image: url });
      invalidateCache("restaurants");
      return { success: true, url };
    }),
    removeImage: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const restaurant = await getRestaurantById(input.id);
      await requireOwnership(
        { user: ctx.user },
        restaurant,
        "restaurant"
      );
      await updateRestaurant(input.id, { image: null });
      invalidateCache("restaurants");
      return { success: true };
    })
  }),
  cafes: router({
    list: publicProcedure.query(async () => {
      return getAllCafes();
    }),
    create: ownerProcedure.input(
      z2.object({
        nameAr: z2.string().max(MAX_NAME),
        nameEn: z2.string().max(MAX_NAME),
        nameFr: z2.string().max(MAX_NAME),
        nameBer: z2.string().max(MAX_NAME),
        descriptionAr: z2.string().max(MAX_TEXT).optional(),
        descriptionEn: z2.string().max(MAX_TEXT).optional(),
        descriptionFr: z2.string().max(MAX_TEXT).optional(),
        descriptionBer: z2.string().max(MAX_TEXT).optional(),
        locationAr: z2.string().max(MAX_NAME).optional(),
        locationEn: z2.string().max(MAX_NAME).optional(),
        locationFr: z2.string().max(MAX_NAME).optional(),
        locationBer: z2.string().max(MAX_NAME).optional(),
        rating: z2.string().max(10).default("4.5"),
        hours: z2.string().max(MAX_SHORT).default("8:00 - 24:00"),
        phone: z2.string().max(MAX_SHORT).optional(),
        whatsapp: whatsappInput,
        image: z2.string().max(2e3).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const { id } = await createCafe({
        ...input,
        ownerId: ctx.user.id,
        isActive: ctx.user.role === "admin"
      });
      return { success: true, id };
    }),
    update: ownerProcedure.input(
      z2.object({
        id: z2.number().int().positive(),
        nameAr: z2.string().max(MAX_NAME),
        nameEn: z2.string().max(MAX_NAME),
        nameFr: z2.string().max(MAX_NAME),
        nameBer: z2.string().max(MAX_NAME),
        descriptionAr: z2.string().max(MAX_TEXT).optional(),
        descriptionEn: z2.string().max(MAX_TEXT).optional(),
        descriptionFr: z2.string().max(MAX_TEXT).optional(),
        descriptionBer: z2.string().max(MAX_TEXT).optional(),
        locationAr: z2.string().max(MAX_NAME).optional(),
        locationEn: z2.string().max(MAX_NAME).optional(),
        locationFr: z2.string().max(MAX_NAME).optional(),
        locationBer: z2.string().max(MAX_NAME).optional(),
        rating: z2.string().max(10),
        hours: z2.string().max(MAX_SHORT),
        phone: z2.string().max(MAX_SHORT).optional(),
        whatsapp: whatsappInput,
        image: z2.string().max(2e3).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const cafe = await getCafeById(id);
      await requireOwnership({ user: ctx.user }, cafe, "cafe");
      await updateCafe(id, {
        ...data,
        isActive: ctx.user.role === "admin"
      });
      return { success: true };
    }),
    delete: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const cafe = await getCafeById(input.id);
      await requireOwnership({ user: ctx.user }, cafe, "cafe");
      await deleteCafe(input.id);
      return { success: true };
    }),
    uploadImage: ownerProcedure.input(
      z2.object({
        id: z2.number().int().positive(),
        base64: z2.string().max(55e5),
        fileName: z2.string().max(255).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const cafe = await getCafeById(input.id);
      await requireOwnership({ user: ctx.user }, cafe, "cafe");
      const ext = (extractExt(input.fileName || "image.png") || "png").toLowerCase();
      if (!ALLOWED_IMAGE_EXTS.has(ext)) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Unsupported image format (use JPG, PNG or WEBP)"
        });
      }
      const bytes = base64ToBuffer(input.base64);
      if (bytes.length > MAX_IMAGE_BYTES) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Image too large (max 4MB)"
        });
      }
      const { url } = await storagePut(
        `cafes/${ctx.user.id}/${safeName(input.fileName || "image")}.${ext}`,
        bytes,
        EXT_MIME[ext] || "image/png"
      );
      await updateCafe(input.id, { image: url });
      invalidateCache("cafes");
      return { success: true, url };
    }),
    removeImage: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const cafe = await getCafeById(input.id);
      await requireOwnership({ user: ctx.user }, cafe, "cafe");
      await updateCafe(input.id, { image: null });
      invalidateCache("cafes");
      return { success: true };
    })
  }),
  bookings: router({
    create: publicProcedure.input(
      z2.object({
        type: z2.enum(["hotel", "car"]),
        guestUserId: z2.number().int().positive().optional(),
        itemName: z2.string().min(1).max(MAX_NAME),
        guestName: z2.string().min(2).max(MAX_NAME),
        guestEmail: z2.string().email().max(320),
        guestPhone: z2.string().max(MAX_SHORT).optional(),
        checkIn: z2.string(),
        checkOut: z2.string(),
        pickUpTime: z2.string().max(10).optional(),
        dropOffTime: z2.string().max(10).optional(),
        guests: z2.number().int().min(1).max(50).default(1),
        notes: z2.string().max(MAX_TEXT).optional(),
        totalPrice: z2.string().max(MAX_SHORT).optional(),
        itemId: z2.number().int().positive()
      }).refine(
        (d) => {
          const a = new Date(d.checkIn);
          const b = new Date(d.checkOut);
          return !isNaN(a.getTime()) && !isNaN(b.getTime()) && b.getTime() >= a.getTime();
        },
        { message: "checkOut must be after checkIn" }
      )
    ).mutation(async ({ input, ctx }) => {
      const guestUserId = ctx.user ? ctx.user.id : null;
      let ownerId = 1;
      let itemId = 0;
      if (input.type === "car") {
        const car = await getCarById(input.itemId);
        if (!car)
          throw new TRPCError4({
            code: "NOT_FOUND",
            message: "ITEM_NOT_FOUND"
          });
        ownerId = car.ownerId;
        itemId = car.id;
      } else {
        const hotel = await getHotelById(input.itemId);
        if (!hotel)
          throw new TRPCError4({
            code: "NOT_FOUND",
            message: "ITEM_NOT_FOUND"
          });
        ownerId = hotel.ownerId;
        itemId = hotel.id;
      }
      const conflict = await findBookingAvailabilityConflict({
        type: input.type,
        itemId,
        startsAt: new Date(input.checkIn),
        endsAt: new Date(input.checkOut)
      });
      if (conflict) {
        throw new TRPCError4({
          code: "CONFLICT",
          message: "BOOKING_DATES_UNAVAILABLE"
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
        pickUpTime: input.pickUpTime || void 0,
        dropOffTime: input.dropOffTime || void 0,
        guests: input.guests,
        notes: input.notes,
        totalPrice: input.totalPrice,
        paymentMethod: "pay_on_arrival",
        paymentStatus: "unpaid",
        status: "pending",
        ownerId,
        itemId,
        guestUserId
      });
      return {
        success: true,
        message: "Booking request submitted successfully"
      };
    }),
    // Only admins can list all bookings (customer PII protection)
    list: adminProcedure2.query(async () => {
      return getAllBookings();
    }),
    // Mark a booking as paid: admin OR the listing's owner
    markPaid: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      await requireBookingAccess({ user: ctx.user }, input.id);
      await markBookingPaid(input.id);
      return { success: true };
    }),
    // Confirm a booking and mark it paid: admin OR the listing's owner
    confirm: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const booking = await requireBookingAccess(
        { user: ctx.user },
        input.id
      );
      if (booking.status === "confirmed") return { success: true };
      const conflict = await findBookingAvailabilityConflict({
        type: booking.type,
        itemId: booking.itemId,
        startsAt: booking.checkIn,
        endsAt: booking.checkOut,
        excludeBookingId: booking.id
      });
      if (conflict) {
        throw new TRPCError4({
          code: "CONFLICT",
          message: "BOOKING_DATES_UNAVAILABLE"
        });
      }
      await confirmBooking(input.id);
      return { success: true };
    }),
    complete: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const booking = await requireBookingAccess(
        { user: ctx.user },
        input.id
      );
      if (booking.status === "completed") return { success: true };
      if (booking.status !== "confirmed") {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "BOOKING_MUST_BE_CONFIRMED"
        });
      }
      await completeBooking(input.id);
      return { success: true };
    }),
    // Guest dashboard: logged-in guest sees ONLY their own bookings
    myBookings: protectedProcedure.query(async ({ ctx }) => {
      return getGuestBookings(ctx.user.id);
    }),
    // Cancel a booking: guest may cancel only their own bookings
    cancel: protectedProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const booking = await getBookingById(input.id);
      if (!booking)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Booking not found"
        });
      if (booking.guestUserId !== ctx.user.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "You can only cancel your own booking"
        });
      }
      await cancelBooking(input.id);
      return { success: true };
    })
  }),
  availability: router({
    check: publicProcedure.input(availabilityDateRange).query(async ({ input }) => {
      const listing = input.type === "car" ? await getCarById(input.itemId) : await getHotelById(input.itemId);
      if (!listing || !listing.isActive) {
        return { available: false, reason: "ITEM_UNAVAILABLE" };
      }
      const conflict = await findBookingAvailabilityConflict({
        ...input,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt)
      });
      return conflict ? { available: false, reason: "BOOKING_DATES_UNAVAILABLE" } : { available: true, reason: null };
    }),
    myBlocks: ownerProcedure.query(async ({ ctx }) => {
      return listAvailabilityBlocksForOwner(ctx.user.id);
    }),
    createBlock: ownerProcedure.input(
      availabilityDateRange.safeExtend({
        reason: z2.string().trim().max(240).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const listing = input.type === "car" ? await getCarById(input.itemId) : await getHotelById(input.itemId);
      await requireOwnership(
        { user: ctx.user },
        listing,
        input.type
      );
      await createAvailabilityBlock({
        type: input.type,
        itemId: input.itemId,
        ownerId: listing.ownerId,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        reason: input.reason || null
      });
      return { success: true };
    }),
    removeBlock: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const block = await getAvailabilityBlockById(input.id);
      if (!block)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "AVAILABILITY_BLOCK_NOT_FOUND"
        });
      if (ctx.user.role !== "admin" && block.ownerId !== ctx.user.id) {
        throw new TRPCError4({ code: "FORBIDDEN", message: "OWNER_ONLY_ERR" });
      }
      await deleteAvailabilityBlock(input.id);
      return { success: true };
    })
  }),
  listingReview: router({
    queue: adminProcedure2.query(async () => {
      const pending = await getPendingListingReviewQueue();
      const toSafeItem = (type, item) => ({
        id: item.id,
        type,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        nameFr: item.nameFr,
        nameBer: item.nameBer,
        createdAt: item.createdAt
      });
      return [
        ...pending.cars.map((item) => toSafeItem("car", item)),
        ...pending.hotels.map((item) => toSafeItem("hotel", item)),
        ...pending.restaurants.map((item) => toSafeItem("restaurant", item)),
        ...pending.cafes.map((item) => toSafeItem("cafe", item))
      ];
    }),
    approve: adminProcedure2.input(
      z2.object({
        type: z2.enum(["car", "hotel", "restaurant", "cafe"]),
        id: z2.number().int().positive()
      })
    ).mutation(async ({ input }) => {
      const item = input.type === "car" ? await getCarById(input.id) : input.type === "hotel" ? await getHotelById(input.id) : input.type === "restaurant" ? await getRestaurantById(input.id) : await getCafeById(input.id);
      if (!item)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "LISTING_NOT_FOUND"
        });
      if (input.type === "car")
        await updateCar(input.id, { isActive: true });
      if (input.type === "hotel")
        await updateHotel(input.id, { isActive: true });
      if (input.type === "restaurant")
        await updateRestaurant(input.id, { isActive: true });
      if (input.type === "cafe")
        await updateCafe(input.id, { isActive: true });
      invalidateCache(
        input.type === "car" ? "cars" : input.type === "hotel" ? "hotels" : input.type === "restaurant" ? "restaurants" : "cafes"
      );
      return { success: true };
    }),
    hide: adminProcedure2.input(
      z2.object({
        type: z2.enum(["car", "hotel", "restaurant", "cafe"]),
        id: z2.number().int().positive()
      })
    ).mutation(async ({ input }) => {
      const item = input.type === "car" ? await getCarById(input.id) : input.type === "hotel" ? await getHotelById(input.id) : input.type === "restaurant" ? await getRestaurantById(input.id) : await getCafeById(input.id);
      if (!item)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "LISTING_NOT_FOUND"
        });
      if (input.type === "car")
        await updateCar(input.id, { isActive: false });
      if (input.type === "hotel")
        await updateHotel(input.id, { isActive: false });
      if (input.type === "restaurant")
        await updateRestaurant(input.id, { isActive: false });
      if (input.type === "cafe")
        await updateCafe(input.id, { isActive: false });
      invalidateCache(
        input.type === "car" ? "cars" : input.type === "hotel" ? "hotels" : input.type === "restaurant" ? "restaurants" : "cafes"
      );
      return { success: true };
    })
  }),
  favorites: router({
    list: publicProcedure.query(async () => {
      return [];
    }),
    add: publicProcedure.input(
      z2.object({
        itemType: z2.enum(["car", "hotel"]),
        itemId: z2.number().int().positive()
      })
    ).mutation(async ({ input }) => {
      return { success: true };
    }),
    remove: publicProcedure.input(
      z2.object({
        itemType: z2.enum(["car", "hotel"]),
        itemId: z2.number().int().positive()
      })
    ).mutation(async ({ input }) => {
      return { success: true };
    })
  }),
  // Owner-scoped dashboard: each owner sees ONLY their own listings and bookings.
  // Admins see everything (full listing), other users see nothing of their own.
  dashboard: router({
    metrics: ownerProcedure.query(async ({ ctx }) => {
      const rows = ctx.user.role === "admin" ? await getAllBookings() : await getMyBookings(ctx.user.id);
      return {
        total: rows.length,
        pending: rows.filter((row) => row.status === "pending").length,
        confirmed: rows.filter((row) => row.status === "confirmed").length,
        completed: rows.filter((row) => row.status === "completed").length,
        cancelled: rows.filter((row) => row.status === "cancelled").length
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
    })
  })
});

// server/safetyTrips.ts
var TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1e3;
function isSafetyTripOverdue(lastActivity, now) {
  return now.getTime() - lastActivity.getTime() >= TWENTY_FOUR_HOURS_MS;
}
async function escalateInactiveSafetyTrips(req, res) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }
    const now = /* @__PURE__ */ new Date();
    const candidates = await findSafetyTripsForEscalation();
    let escalated = 0;
    for (const trip of candidates) {
      const lastActivity = trip.lastCheckInAt ?? trip.departureAt;
      if (!isSafetyTripOverdue(new Date(lastActivity), now)) continue;
      await markSafetyTripOverdue(trip.publicToken, now);
      escalated += 1;
      const location = trip.lastLocationLat && trip.lastLocationLng ? `\u0622\u062E\u0631 \u0645\u0648\u0642\u0639 \u0634\u0627\u0631\u0643\u0648 \u0627\u0644\u0632\u0627\u0626\u0631 \u0628\u0645\u0648\u0627\u0641\u0642\u062A\u0647: ${trip.lastLocationLat}, ${trip.lastLocationLng}.` : "\u0627\u0644\u0632\u0627\u0626\u0631 \u0645\u0627 \u0634\u0627\u0631\u0643 \u062D\u062A\u0649 \u0645\u0648\u0642\u0639 \u0645\u062D\u0641\u0648\u0638.";
      await notifyOwner({
        title: "\u062A\u0646\u0628\u064A\u0647 \u0633\u0644\u0627\u0645\u0629: \u0631\u062D\u0644\u0629 \u0628\u0644\u0627 \u062A\u0623\u0643\u064A\u062F \u0644\u0645\u062F\u0629 24 \u0633\u0627\u0639\u0629",
        content: `\u0627\u0644\u0627\u0633\u0645: ${trip.travelerName}
\u0627\u0644\u0625\u064A\u0645\u064A\u0644: ${trip.travelerEmail}
\u0627\u0644\u0645\u0633\u0627\u0631: ${trip.route}
\u0648\u0642\u062A \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0645\u062A\u0648\u0642\u0639: ${new Date(trip.expectedArrivalAt).toLocaleString("ar-MA")}
${location}
\u062E\u0627\u0635 \u0634\u062E\u0635 \u0645\u0633\u0624\u0648\u0644 \u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u062C\u0647\u0629 \u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0623\u0648 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0645\u062D\u0644\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u062D\u0627\u0644\u0629. \u0627\u0644\u0645\u0646\u0635\u0629 \u0645\u0627 \u0643\u062A\u0628\u0644\u063A\u0634 \u0627\u0644\u0634\u0631\u0637\u0629 \u0623\u0648\u062A\u0648\u0645\u0627\u062A\u064A\u0643\u064A\u0627\u064B.`
      });
    }
    return res.json({ ok: true, escalated });
  } catch (error) {
    console.error("[SafetyTrips] escalation failed", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}

// server/vercel-api.ts
var allowedOrigins = /* @__PURE__ */ new Set([
  "https://azilal-tourism.vercel.app",
  "https://azilaltour-j2sx2a5n.manus.space"
]);
function securityHeaders(req, res, next) {
  const origin = req.headers.origin;
  const corsOrigin = origin && allowedOrigins.has(origin) ? origin : "https://azilal-tourism.vercel.app";
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Vary", "Origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}
var app = express();
app.disable("x-powered-by");
app.use(securityHeaders);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
app.post("/api/scheduled/escalateSafetyTrips", escalateInactiveSafetyTrips);
app.post("/api/scheduled/db-health", databaseHealthHandler);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var vercel_api_default = app;
export {
  vercel_api_default as default
};
