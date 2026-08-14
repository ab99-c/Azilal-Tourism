import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { getRestaurantById, getCafeById, createRestaurant, createCafe, deleteRestaurant, deleteCafe, updateRestaurant, updateCafe } from "./db";

// A tiny valid 1x1 PNG in base64 (data URL form, as the browser sends)
const VALID_PNG_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const OWNER_ID = 1;
const OTHER_OWNER_ID = 99999;

// Create a temporary restaurant & cafe for the test
async function createTestRestaurant() {
  const payload: any = {
    nameAr: "مطعم اختبار", nameEn: "Test Restaurant", nameFr: "Test Resto", nameBer: "Test",
    descriptionAr: "desc", descriptionEn: "desc", descriptionFr: "desc", descriptionBer: "desc",
    locationAr: "أزيلال", locationEn: "Azilal", locationFr: "Azilal", locationBer: "Azilal",
    rating: "4.5", hours: "9:00 - 23:00",
  };
  return (await createRestaurant({ ...payload, ownerId: OWNER_ID })) as any;
}

async function createTestCafe() {
  const payload: any = {
    nameAr: "مقهى اختبار", nameEn: "Test Cafe", nameFr: "Test Café", nameBer: "Test",
    descriptionAr: "desc", descriptionEn: "desc", descriptionFr: "desc", descriptionBer: "desc",
    locationAr: "أزيلال", locationEn: "Azilal", locationFr: "Azilal", locationBer: "Azilal",
    rating: "4.5", hours: "8:00 - 24:00",
  };
  return (await createCafe({ ...payload, ownerId: OWNER_ID })) as any;
}

function makeCtx(user: { id: number; role: string; openId: string; name?: string | null; email?: string | null } | null) {
  return { user, token: null, req: {}, res: {} } as any;
}

describe("restaurants.uploadImage ownership gating", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(() => caller.restaurants.uploadImage({ id: 1, base64: VALID_PNG_BASE64 })).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("rejects upload when the item belongs to another owner", async () => {
    const restaurant = await createTestRestaurant();
    try {
      const caller = appRouter.createCaller(makeCtx({ id: OTHER_OWNER_ID, role: "user", openId: "other-test-user" }));
      await expect(() => caller.restaurants.uploadImage({ id: restaurant.id, base64: VALID_PNG_BASE64 })).rejects.toThrow();
    } finally {
      await deleteRestaurant(restaurant.id);
    }
  });

  it("allows the owner to upload an image and persists it", async () => {
    const restaurant = await createTestRestaurant();
    try {
      const caller = appRouter.createCaller(makeCtx({ id: OWNER_ID, role: "user", openId: "owner-test-user" }));
      const res = await caller.restaurants.uploadImage({ id: restaurant.id, base64: VALID_PNG_BASE64, fileName: "resto.png" });
      expect(res.success).toBe(true);
      expect(res.url).toBeTruthy();
      const updated = await getRestaurantById(restaurant.id);
      expect((updated as any)?.image).toBe(res.url);
    } finally {
      await deleteRestaurant(restaurant.id);
    }
  });

  it("rejects unsupported image formats", async () => {
    const restaurant = await createTestRestaurant();
    try {
      const caller = appRouter.createCaller(makeCtx({ id: OWNER_ID, role: "user", openId: "owner-test-user" }));
      await expect(() => caller.restaurants.uploadImage({ id: restaurant.id, base64: VALID_PNG_BASE64, fileName: "malware.exe" })).rejects.toThrow();
    } finally {
      await deleteRestaurant(restaurant.id);
    }
  });
});

describe("cafes.uploadImage ownership gating", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(() => caller.cafes.uploadImage({ id: 1, base64: VALID_PNG_BASE64 })).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("rejects upload when the cafe belongs to another owner", async () => {
    const cafe = await createTestCafe();
    try {
      const caller = appRouter.createCaller(makeCtx({ id: OTHER_OWNER_ID, role: "user", openId: "other-test-user" }));
      await expect(() => caller.cafes.uploadImage({ id: cafe.id, base64: VALID_PNG_BASE64 })).rejects.toThrow();
    } finally {
      await deleteCafe(cafe.id);
    }
  });

  it("allows the owner to upload an image and persists it", async () => {
    const cafe = await createTestCafe();
    try {
      const caller = appRouter.createCaller(makeCtx({ id: OWNER_ID, role: "user", openId: "owner-test-user" }));
      const res = await caller.cafes.uploadImage({ id: cafe.id, base64: VALID_PNG_BASE64, fileName: "cafe.png" });
      expect(res.success).toBe(true);
      expect(res.url).toBeTruthy();
      const updated = await getCafeById(cafe.id);
      expect((updated as any)?.image).toBe(res.url);
    } finally {
      await deleteCafe(cafe.id);
    }
  });
});

describe("restaurants.removeImage ownership gating", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(() => caller.restaurants.removeImage({ id: 1 })).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("rejects removal when the item belongs to another owner", async () => {
    const restaurant = await createTestRestaurant();
    try {
      const caller = appRouter.createCaller(makeCtx({ id: OTHER_OWNER_ID, role: "user", openId: "other-test-user" }));
      await expect(() => caller.restaurants.removeImage({ id: restaurant.id })).rejects.toThrow();
      const stillHasImage = await getRestaurantById(restaurant.id);
      expect((stillHasImage as any)?.image).toBeNull();
    } finally {
      await deleteRestaurant(restaurant.id);
    }
  });

  it("allows the owner to remove their image", async () => {
    const restaurant = await createTestRestaurant();
    try {
      // Give it an image first
      const ownerCaller = appRouter.createCaller(makeCtx({ id: OWNER_ID, role: "user", openId: "owner-test-user" }));
      const up = await ownerCaller.restaurants.uploadImage({ id: restaurant.id, base64: VALID_PNG_BASE64, fileName: "resto.png" });
      expect(up.success).toBe(true);
      const res = await ownerCaller.restaurants.removeImage({ id: restaurant.id });
      expect(res.success).toBe(true);
      const updated = await getRestaurantById(restaurant.id);
      expect((updated as any)?.image).toBeNull();
    } finally {
      await deleteRestaurant(restaurant.id);
    }
  });
});

describe("cafes.removeImage ownership gating", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(() => caller.cafes.removeImage({ id: 1 })).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("rejects removal when the cafe belongs to another owner", async () => {
    const cafe = await createTestCafe();
    try {
      const caller = appRouter.createCaller(makeCtx({ id: OTHER_OWNER_ID, role: "user", openId: "other-test-user" }));
      await expect(() => caller.cafes.removeImage({ id: cafe.id })).rejects.toThrow();
    } finally {
      await deleteCafe(cafe.id);
    }
  });

  it("allows the owner to remove their cafe image", async () => {
    const cafe = await createTestCafe();
    try {
      const ownerCaller = appRouter.createCaller(makeCtx({ id: OWNER_ID, role: "user", openId: "owner-test-user" }));
      await ownerCaller.cafes.uploadImage({ id: cafe.id, base64: VALID_PNG_BASE64, fileName: "cafe.png" });
      const res = await ownerCaller.cafes.removeImage({ id: cafe.id });
      expect(res.success).toBe(true);
      const updated = await getCafeById(cafe.id);
      expect((updated as any)?.image).toBeNull();
    } finally {
      await deleteCafe(cafe.id);
    }
  });
});
