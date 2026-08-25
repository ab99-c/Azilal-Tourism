import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createCar: vi.fn(async (input: any) => input),
  updateCar: vi.fn(async () => undefined),
  getPendingListingReviewQueue: vi.fn(async () => ({
    cars: [{ id: 91, ownerId: 77, nameAr: 'سيارة اختبار', nameEn: 'Test car', nameFr: 'Voiture test', nameBer: 'ⵜⴰⵙⵍⵍⴰⵙⵜ', createdAt: new Date() }],
    hotels: [], restaurants: [], cafes: [],
  })),
}));

vi.mock('./db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./db')>();
  return {
    ...actual,
    createCar: mocks.createCar,
    updateCar: mocks.updateCar,
    getPendingListingReviewQueue: mocks.getPendingListingReviewQueue,
    getCarById: vi.fn(async (id: number) => ({ id, ownerId: 77, isActive: false })),
    getHotelById: vi.fn(async () => undefined),
    getRestaurantById: vi.fn(async () => undefined),
    getCafeById: vi.fn(async () => undefined),
  };
});

import { appRouter } from './routers';

const admin = { id: 1, openId: 'admin', name: 'Admin', email: 'admin@example.test', loginMethod: 'local', role: 'admin' as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const owner = { ...admin, id: 77, openId: 'owner', role: 'user' as const };
const caller = (user: any) => appRouter.createCaller({ user, req: { headers: {} }, res: { clearCookie: () => {} } } as any);

describe('listing review workflow', () => {
  it('puts a non-admin owner car submission into the inactive review state', async () => {
    await caller(owner).cars.create({ nameAr: 'سيارة', nameEn: 'Car', nameFr: 'Voiture', nameBer: 'ⵜⴰⵙⵍⵍⴰⵙⵜ', typeAr: 'SUV', typeEn: 'SUV', typeFr: 'SUV', typeBer: 'SUV', price: '250 MAD' });
    expect(mocks.createCar).toHaveBeenLastCalledWith(expect.objectContaining({ ownerId: 77, isActive: false }));
  });

  it('allows only administrators to receive the review queue and omits owner identity', async () => {
    await expect(caller(owner).listingReview.queue()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    const queue = await caller(admin).listingReview.queue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ id: 91, type: 'car', nameAr: 'سيارة اختبار' });
    expect(queue[0]).not.toHaveProperty('ownerId');
  });

  it('requires administrator authorization to publish a pending listing', async () => {
    await expect(caller(owner).listingReview.approve({ type: 'car', id: 91 })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(caller(admin).listingReview.approve({ type: 'car', id: 91 })).resolves.toEqual({ success: true });
    expect(mocks.updateCar).toHaveBeenLastCalledWith(91, { isActive: true });
  });
});
