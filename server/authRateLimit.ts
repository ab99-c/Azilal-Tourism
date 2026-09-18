import type { Request, Response } from "express";
import { TRPCError } from "@trpc/server";

type AuthAction =
  | "register"
  | "login"
  | "login-account"
  | "admin-activation"
  | "password-reset"
  | "contact-message"
  | "chat-ask"
  | "booking-create";
type Bucket = { count: number; resetAt: number };
type LimitConfig = { windowMs: number; max: number };

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const LIMITS: Record<AuthAction, LimitConfig> = {
  register: { windowMs: HOUR, max: 5 },
  login: { windowMs: 15 * MINUTE, max: 10 },
  "login-account": { windowMs: 15 * MINUTE, max: 5 },
  "admin-activation": { windowMs: 15 * MINUTE, max: 3 },
  "password-reset": { windowMs: HOUR, max: 5 },
  "contact-message": { windowMs: HOUR, max: 5 },
  "chat-ask": { windowMs: HOUR, max: 12 },
  "booking-create": { windowMs: HOUR, max: 10 },
};

const buckets = new Map<string, Bucket>();
const apiBuckets = new Map<string, Bucket>();
const API_WINDOW_MS = MINUTE;
const API_MAX_REQUESTS = 120;

function getClientAddress(req: Request) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return firstForwarded?.trim() || req?.socket?.remoteAddress || "unknown";
}

function bucketKey(req: Request, action: AuthAction, subject?: string) {
  return `${action}:${getClientAddress(req)}${subject ? `:${subject}` : ""}`;
}

function retryAfterSeconds(resetAt: number, now: number) {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}

function pruneExpired(now: number) {
  if (buckets.size >= 1_000) {
    for (const [key, bucket] of Array.from(buckets.entries())) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }
  if (apiBuckets.size >= 1_000) {
    for (const [key, bucket] of Array.from(apiBuckets.entries())) {
      if (bucket.resetAt <= now) apiBuckets.delete(key);
    }
  }
}

/**
 * In-memory per-instance limiter. Vercel cold starts and parallel instances do
 * not share these counters; use a shared store for strict distributed limits.
 */
export function assertAuthRateLimit(
  req: Request,
  action: AuthAction,
  now = Date.now(),
  subject?: string,
  res?: Response,
) {
  pruneExpired(now);
  const config = LIMITS[action];
  const key = bucketKey(req, action, subject);
  const previous = buckets.get(key);
  const bucket = !previous || previous.resetAt <= now
    ? { count: 0, resetAt: now + config.windowMs }
    : previous;

  if (bucket.count >= config.max) {
    res?.setHeader("Retry-After", String(retryAfterSeconds(bucket.resetAt, now)));
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "AUTH_RATE_LIMITED" });
  }
  bucket.count += 1;
  buckets.set(key, bucket);
}

export function clearAuthRateLimit(req: Request, action: AuthAction, subject?: string) {
  buckets.delete(bucketKey(req, action, subject));
}

export function assertApiRateLimit(req: Request, now = Date.now(), res?: Response) {
  pruneExpired(now);
  const key = `api:${getClientAddress(req)}`;
  const previous = apiBuckets.get(key);
  const bucket = !previous || previous.resetAt <= now
    ? { count: 0, resetAt: now + API_WINDOW_MS }
    : previous;

  if (bucket.count >= API_MAX_REQUESTS) {
    res?.setHeader("Retry-After", String(retryAfterSeconds(bucket.resetAt, now)));
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "API_RATE_LIMITED" });
  }
  bucket.count += 1;
  apiBuckets.set(key, bucket);
}

export function resetAuthRateLimitsForTests() {
  buckets.clear();
  apiBuckets.clear();
}

export type { AuthAction };
export const rateLimitConfig = LIMITS;
