import type { Request } from "express";
import { TRPCError } from "@trpc/server";

type AuthAction = "register" | "login" | "admin-activation" | "password-reset" | "contact-message";
type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS: Record<AuthAction, number> = {
  register: 5,
  login: 10,
  "admin-activation": 3,
  "password-reset": 5,
  "contact-message": 5,
};
const buckets = new Map<string, Bucket>();

function getClientAddress(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return firstForwarded?.trim() || req.socket.remoteAddress || "unknown";
}

function bucketKey(req: Request, action: AuthAction) {
  return `${action}:${getClientAddress(req)}`;
}

function pruneExpired(now: number) {
  if (buckets.size < 1_000) return;
  for (const [key, bucket] of Array.from(buckets.entries())) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function assertAuthRateLimit(req: Request, action: AuthAction, now = Date.now()) {
  pruneExpired(now);
  const key = bucketKey(req, action);
  const previous = buckets.get(key);
  const bucket = !previous || previous.resetAt <= now
    ? { count: 0, resetAt: now + WINDOW_MS }
    : previous;

  if (bucket.count >= MAX_ATTEMPTS[action]) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "AUTH_RATE_LIMITED" });
  }
  bucket.count += 1;
  buckets.set(key, bucket);
}

export function clearAuthRateLimit(req: Request, action: AuthAction) {
  buckets.delete(bucketKey(req, action));
}

export function resetAuthRateLimitsForTests() {
  buckets.clear();
}
