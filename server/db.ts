import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, cars, hotels, restaurants, cafes, bookings, favorites, type Car, type Hotel, type Restaurant, type Cafe, type Booking } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
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

// ===== OWNERSHIP SCOPED QUERIES =====
export async function getMyCars(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cars).where(eq(cars.ownerId, ownerId)).orderBy(desc(cars.createdAt));
}

export async function getMyHotels(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hotels).where(eq(hotels.ownerId, ownerId)).orderBy(desc(hotels.createdAt));
}

export async function getMyBookings(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.ownerId, ownerId)).orderBy(desc(bookings.createdAt));
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
  return db.select().from(cars).where(eq(cars.isActive, true)).orderBy(desc(cars.createdAt));
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
  return db.select().from(cafes).where(eq(cafes.isActive, true)).orderBy(desc(cafes.createdAt));
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
  return db.select().from(cafes).where(eq(cafes.ownerId, ownerId)).orderBy(desc(cafes.createdAt));
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
  return db.select().from(bookings).orderBy(desc(bookings.createdAt));
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
  return db.select().from(bookings).where(eq(bookings.guestUserId, guestUserId)).orderBy(desc(bookings.createdAt));
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
