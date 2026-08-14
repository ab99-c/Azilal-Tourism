import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

// Minimal caller helpers: any numeric id = authenticated caller with that user id.
function makeCtx(userId: number | null): any {
  return {
    req: { headers: {} } as any,
    res: { clearCookie: () => {} } as any,
    user: userId ? ({ id: userId, name: `user-${userId}`, email: `user-${userId}@example.com`, role: 'user' } as any) : null,
  };
}
const caller = (userId: number | null): Context['user'] =>
  userId ? ({ id: userId, name: `user-${userId}`, email: `user-${userId}@example.com`, role: 'user' } as any) : null;

let nextId = 1000;
const makeData = (overrides = {}) => ({
  nameAr: `مطعم اختبار ${nextId}`,
  nameEn: `Test Restaurant ${nextId}`,
  nameFr: `Restaurant Test ${nextId}`,
  nameBer: `ⵉⵎⵙⵙⴽ ${nextId}`,
  descriptionAr: 'وصف اختباري',
  rating: '4.0',
  hours: '9:00 - 22:00',
  cuisineAr: 'أمازيغي',
  cuisineEn: 'Amazigh',
  cuisineFr: 'Amazigh',
  cuisineBer: 'ⴰⵎⴰⵣⵉⵖ',
  locationAr: 'أزيلال',
  locationEn: 'Azilal',
  locationFr: 'Azilal',
  locationBer: 'ⴰⵣⵉⵍⴰⵍ',
  ...overrides,
});
const next = () => ++nextId;

describe('restaurants/cafes owner isolation', () => {
  it('anonymous user cannot create a restaurant', async () => {
    const res = appRouter.createCaller(makeCtx(null)).restaurants.create(makeData());
    await expect(res).rejects.toThrow(/Please login|10001|UNAUTHORIZED/);
  });

  it('owner can create a restaurant and it appears in their own dashboard', async () => {
    const ownerId = next();
    const data = makeData();
    await appRouter.createCaller(makeCtx(ownerId)).restaurants.create(data);
    const mine = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myRestaurants();
    expect(mine.length).toBeGreaterThanOrEqual(1);
    expect(mine.some((r: any) => r.nameEn.includes('Test Restaurant'))).toBe(true);
  });

  it('another owner cannot see restaurant created by first owner', async () => {
    const data = makeData();
    await appRouter.createCaller(makeCtx(next())).restaurants.create(data);
    const mine = await appRouter.createCaller(makeCtx(next() + 100)).dashboard.myRestaurants();
    expect(mine.some((r: any) => r.nameEn.includes('Test Restaurant'))).toBe(false);
  });

  it('non-owner cannot update another owner restaurant', async () => {
    const ownerId = next();
    await appRouter.createCaller(makeCtx(ownerId)).restaurants.create(makeData());
    const my = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myRestaurants();
    const item = my.find((r: any) => r.nameEn.includes('Test Restaurant'))!;
    await expect(
      appRouter.createCaller(makeCtx(next() + 200)).restaurants.update({ id: item.id, ...makeData() }),
    ).rejects.toMatchObject({ message: /OWNER_ONLY_ERR|FORBIDDEN/i });
  });

  it('non-owner cannot delete another owner restaurant', async () => {
    const ownerId = next();
    await appRouter.createCaller(makeCtx(ownerId)).restaurants.create(makeData());
    const my = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myRestaurants();
    const item = my.find((r: any) => r.nameEn.includes('Test Restaurant'))!;
    await expect(
      appRouter.createCaller(makeCtx(next() + 300)).restaurants.delete({ id: item.id }),
    ).rejects.toMatchObject({ message: /OWNER_ONLY_ERR|FORBIDDEN/i });
  });

  it('owner can update and delete their own restaurant', async () => {
    const ownerId = next();
    await appRouter.createCaller(makeCtx(ownerId)).restaurants.create(makeData());
    const my = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myRestaurants();
    const item = my.find((r: any) => r.nameEn.includes('Test Restaurant'))!;
    await appRouter.createCaller(makeCtx(ownerId)).restaurants.update({ id: item.id, ...makeData({ nameEn: `Updated Restaurant ${nextId}` }) });
    const updated = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myRestaurants();
    expect(updated.some((r: any) => r.id === item.id && r.nameEn.includes('Updated Restaurant'))).toBe(true);
    await appRouter.createCaller(makeCtx(ownerId)).restaurants.delete({ id: item.id });
    const deleted = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myRestaurants();
    expect(deleted.every((r: any) => r.id !== item.id)).toBe(true);
  });

  it('anonymous user cannot create a cafe', async () => {
    const res = appRouter.createCaller(makeCtx(null)).cafes.create({
      nameAr: 'مقهى', nameEn: 'Test Cafe', nameFr: 'Cafe Test', nameBer: 'ⴰⵇⵀⵡⴰ',
      hours: '8:00 - 22:00',
    });
    await expect(res).rejects.toThrow(/Please login|10001|UNAUTHORIZED/);
  });

  it('owner isolation applies to cafes: create, view, update, delete gated by ownership', async () => {
    const ownerId = next();
    await appRouter.createCaller(makeCtx(ownerId)).cafes.create({
      nameAr: 'مقهى اختبار', nameEn: 'Test Cafe X', nameFr: 'Cafe Test X', nameBer: 'ⴰⵇⵀⵡⴰ',
      hours: '8:00 - 22:00',
    });
    const mine = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myCafes();
    const item = mine.find((c: any) => c.nameEn.includes('Test Cafe X'))!;
    expect(item).toBeTruthy();
    // another owner cannot update it
    await expect(
      appRouter.createCaller(makeCtx(next() + 400)).cafes.update({
        id: item.id,
        nameAr: 'مقهى',
        nameEn: 'Hacked',
        nameFr: 'Cafe',
        nameBer: 'ⴰⵇⵀⵡⴰ',
        rating: '4.5',
        hours: '8:00 - 22:00',
      }),
    ).rejects.toMatchObject({ message: /OWNER_ONLY_ERR|FORBIDDEN/i });
    // owner can delete
    await appRouter.createCaller(makeCtx(ownerId)).cafes.delete({ id: item.id });
    const after = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myCafes();
    expect(after.every((c: any) => c.id !== item.id)).toBe(true);
  });

  it('public list shows all restaurants/cafes while dashboard shows only owner ones', async () => {
    const publicRestaurants = await appRouter.createCaller(makeCtx(null)).restaurants.list();
    const publicCafes = await appRouter.createCaller(makeCtx(null)).cafes.list();
    expect(publicRestaurants.length).toBeGreaterThanOrEqual(4);
    expect(publicCafes.length).toBeGreaterThanOrEqual(4);
    const ownerId = next();
    const scoped = await appRouter.createCaller(makeCtx(ownerId)).dashboard.myRestaurants();
    expect(scoped.length).toBeLessThan(publicRestaurants.length);
  });
});

beforeAll(async () => {
  // no-op, kept for clarity
});
