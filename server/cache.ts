/**
 * Lightweight in-memory query cache with TTL.
 *
 * Principle applied: Caching (#8) — public read-heavy endpoints (cars.list,
 * hotels.list) serve from an in-memory cache and invalidate on any write so
 * the DB is not hit on every page load.
 *
 * Note: kept intentionally simple and single-process-friendly; the dev server
 * and Autoscale production each run one instance, so this is safe.
 */

type CacheEntry<T> = { value: T; expiresAt: number };

const DEFAULT_TTL_MS = 60_000; // 1 minute for catalog lists

const store = new Map<string, CacheEntry<unknown>>();

export function cached<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): {
  get(): T | undefined;
  set(value: T): void;
} {
  return {
    get() {
      const entry = store.get(key) as CacheEntry<T> | undefined;
      if (!entry) return undefined;
      if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(value: T) {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
  };
}

/** Invalidate every cache entry whose key starts with the given prefix. */
export function invalidateCache(prefix: string): void {
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
