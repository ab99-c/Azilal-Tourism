import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2";
import { InsertUser, users, cars, hotels, restaurants, cafes, bookings, favorites, safetyTrips, type Car, type Hotel, type Restaurant, type Cafe, type Booking, type SafetyTrip, type InsertSafetyTrip } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

function isTransientDatabaseError(error: unknown) {
  const candidate = error as { code?: string; message?: string };
  const code = candidate?.code ?? "";
  const message = candidate?.message ?? "";
  return ["ETIMEDOUT", "ECONNRESET", "EPIPE", "PROTOCOL_CONNECTION_LOST", "ER_CON_COUNT_ERROR"].includes(code)
    || /timeout|timed out|connection lost|connection reset/i.test(message);
}

async function withTransientDatabaseRetry<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;
    await new Promise(resolve => setTimeout(resolve, 150));
    return operation();
  }
}

export async function checkDatabaseHealth() {
  const startedAt = Date.now();
  const db = await getDb();
  if (!db) return { ok: false, latencyMs: Date.now() - startedAt, reason: "database_unavailable" as const };

  try {
    await withTransientDatabaseRetry(() => db.execute(sql`SELECT 1`));
    return { ok: true, latencyMs: Date.now() - startedAt };
  } catch {
    return { ok: false, latencyMs: Date.now() - startedAt, reason: "database_query_failed" as const };
  }
}

// Lazily create a bounded pool so transient TiDB/MySQL slowness returns a
// useful error instead of leaving tRPC requests hanging indefinitely.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connectionUrl = new URL(process.env.DATABASE_URL);
      _pool = createPool({
        host: connectionUrl.hostname,
        port: connectionUrl.port ? Number(connectionUrl.port) : 3306,
        user: decodeURIComponent(connectionUrl.username),
        password: decodeURIComponent(connectionUrl.password),
        database: decodeURIComponent(connectionUrl.pathname.replace(/^\//, "")),
        waitForConnections: true,
        connectionLimit: 8,
        maxIdle: 8,
        idleTimeout: 60000,
        queueLimit: 16,
        connectTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ...(connectionUrl.searchParams.has("ssl") ? { ssl: { rejectUnauthorized: false } } : {}),
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createLocalUser(input: { openId: string; name: string; email: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(users).values({
    openId: input.openId,
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    loginMethod: "email_password",
    role: "user",
    lastSignedIn: new Date(),
  });
  return getUserByEmail(input.email);
}

export async function setLocalPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({
    passwordHash,
    loginMethod: "email_password",
    lastSignedIn: new Date(),
  }).where(eq(users.id, userId));
}

// ===== OWNERSHIP SCOPED QUERIES =====
export async function getMyCars(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cars).where(eq(cars.ownerId, ownerId)).orderBy(desc(cars.createdAt)).limit(100);
}

export async function getMyHotels(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hotels).where(eq(hotels.ownerId, ownerId)).orderBy(desc(hotels.createdAt));
}

export async function getMyBookings(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.ownerId, ownerId)).orderBy(desc(bookings.createdAt)).limit(200);
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== CARS =====
export async function getAllCars() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cars).where(eq(cars.isActive, true)).orderBy(desc(cars.createdAt)).limit(100);
}

export async function getCarById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCar(data: Partial<Car>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = (data as any).ownerId ?? 1;
  return db.insert(cars).values({ ...data, ownerId } as any);
}

export async function updateCar(id: number, data: Partial<Car>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(cars).set(data as any).where(eq(cars.id, id));
}

export async function deleteCar(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cars).where(eq(cars.id, id));
}

// ===== HOTELS =====
export async function getAllHotels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hotels).where(eq(hotels.isActive, true)).orderBy(desc(hotels.createdAt));
}

export async function getHotelById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(hotels).where(eq(hotels.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHotel(data: Partial<Hotel>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = (data as any).ownerId ?? 1;
  return db.insert(hotels).values({ ...data, ownerId } as any);
}

export async function updateHotel(id: number, data: Partial<Hotel>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(hotels).set(data as any).where(eq(hotels.id, id));
}

export async function deleteHotel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(hotels).where(eq(hotels.id, id));
}

// ===== RESTAURANTS =====
export async function getAllRestaurants() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurants).where(eq(restaurants.isActive, true)).orderBy(desc(restaurants.createdAt));
}

export async function getRestaurantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMyRestaurants(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId)).orderBy(desc(restaurants.createdAt));
}

export async function createRestaurant(data: Partial<Restaurant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = (data as any).ownerId ?? 1;
  const result = await db.insert(restaurants).values({ ...data, ownerId } as any);
  return { id: (result as any)?.[0]?.insertId ?? null };
}

export async function updateRestaurant(id: number, data: Partial<Restaurant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(restaurants).set(data as any).where(eq(restaurants.id, id));
}

export async function deleteRestaurant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(restaurants).where(eq(restaurants.id, id));
}

// ===== CAFES =====
export async function getAllCafes() {
  const db = await getDb();
  if (!db) return [];
  return withTransientDatabaseRetry(() =>
    db.select().from(cafes).where(eq(cafes.isActive, true)).orderBy(desc(cafes.createdAt)).limit(100),
  );
}

export async function getCafeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cafes).where(eq(cafes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMyCafes(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cafes).where(eq(cafes.ownerId, ownerId)).orderBy(desc(cafes.createdAt)).limit(100);
}

export async function createCafe(data: Partial<Cafe>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = (data as any).ownerId ?? 1;
  const result = await db.insert(cafes).values({ ...data, ownerId } as any);
  return { id: (result as any)?.[0]?.insertId ?? null };
}

export async function updateCafe(id: number, data: Partial<Cafe>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(cafes).set(data as any).where(eq(cafes.id, id));
}

export async function deleteCafe(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cafes).where(eq(cafes.id, id));
}

// ===== BOOKINGS =====
export async function createBooking(data: Partial<Booking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ownerId = (data as any).ownerId ?? 1;
  const itemId = (data as any).itemId ?? 0;
  return db.insert(bookings).values({ ...data, ownerId, itemId } as any);
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(200);
}

export async function updateBooking(id: number, data: Partial<Booking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set(data as any).where(eq(bookings.id, id));
}

export async function markBookingPaid(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ paymentStatus: 'paid' } as any).where(eq(bookings.id, id));
}

export async function confirmBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ status: 'confirmed', paymentStatus: 'paid' } as any).where(eq(bookings.id, id));
}

// ===== GUEST-SCOPED QUERIES (guest dashboard) =====
export async function getGuestBookings(guestUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.guestUserId, guestUserId)).orderBy(desc(bookings.createdAt)).limit(100);
}

export async function cancelBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ status: 'cancelled' } as any).where(eq(bookings.id, id));
}

// ===== FAVORITES =====
export async function getUserFavorites(userId: number, itemType?: string) {
  const db = await getDb();
  if (!db) return [];
  if (itemType) {
    return db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.itemType, itemType as any)));
  }
  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function addFavorite(userId: number, itemType: 'car' | 'hotel', itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.itemType, itemType), eq(favorites.itemId, itemId))).limit(1);
  if (existing.length > 0) return;
  return db.insert(favorites).values({ userId, itemType, itemId });
}

export async function removeFavorite(userId: number, itemType: 'car' | 'hotel', itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.itemType, itemType), eq(favorites.itemId, itemId)));
}


// ===== SAFETY TRIPS =====
export async function createSafetyTrip(data: InsertSafetyTrip) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(safetyTrips).values(data);
  const created = await db.select().from(safetyTrips).where(eq(safetyTrips.publicToken, data.publicToken)).limit(1);
  return created[0];
}

export async function getSafetyTripByToken(publicToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(safetyTrips).where(eq(safetyTrips.publicToken, publicToken)).limit(1);
  return rows[0];
}

export async function updateSafetyTrip(publicToken: string, data: Partial<SafetyTrip>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(safetyTrips).set(data as any).where(eq(safetyTrips.publicToken, publicToken));
  return getSafetyTripByToken(publicToken);
}

export async function listSafetyTrips() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(safetyTrips).orderBy(desc(safetyTrips.createdAt));
}

export async function findSafetyTripsForEscalation() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(safetyTrips).where(and(eq(safetyTrips.status, "active"), isNull(safetyTrips.overdueNotifiedAt))).orderBy(desc(safetyTrips.expectedArrivalAt));
}

export async function markSafetyTripOverdue(publicToken: string, notifiedAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.update(safetyTrips)
    .set({ status: "overdue", overdueNotifiedAt: notifiedAt })
    .where(and(eq(safetyTrips.publicToken, publicToken), eq(safetyTrips.status, "active"), isNull(safetyTrips.overdueNotifiedAt)));
  return result;
}
