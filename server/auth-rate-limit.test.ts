import { describe, expect, it, beforeEach } from "vitest";
import type { Request } from "express";
import { assertApiRateLimit, assertAuthRateLimit, clearAuthRateLimit, rateLimitConfig, resetAuthRateLimitsForTests } from "./authRateLimit";
import { getSessionCookieOptions } from "./_core/cookies";

const request = (ip = "203.0.113.7") => ({
  headers: { "x-forwarded-for": ip },
  socket: { remoteAddress: ip },
} as unknown as Request);

describe("authentication rate limiting", () => {
  beforeEach(() => resetAuthRateLimitsForTests());

  it("limits repeated administrator activation guesses from one client", () => {
    const req = request();
    expect(() => assertAuthRateLimit(req, "admin-activation", 0)).not.toThrow();
    expect(() => assertAuthRateLimit(req, "admin-activation", 1)).not.toThrow();
    expect(() => assertAuthRateLimit(req, "admin-activation", 2)).not.toThrow();
    expect(() => assertAuthRateLimit(req, "admin-activation", 3)).toThrow("AUTH_RATE_LIMITED");
  });

  it("clears successful login attempts and expires old windows", () => {
    const req = request();
    for (let attempt = 0; attempt < 10; attempt += 1) assertAuthRateLimit(req, "login", attempt);
    clearAuthRateLimit(req, "login");
    expect(() => assertAuthRateLimit(req, "login", 20)).not.toThrow();
    expect(() => assertAuthRateLimit(req, "login", 20 + 16 * 60 * 1000)).not.toThrow();
  });

  it("limits general tRPC traffic without sharing the authentication bucket", () => {
    const req = request("203.0.113.8");
    for (let attempt = 0; attempt < 120; attempt += 1) {
      expect(() => assertApiRateLimit(req, attempt)).not.toThrow();
    }
    expect(() => assertApiRateLimit(req, 120)).toThrow("API_RATE_LIMITED");
    expect(() => assertApiRateLimit(req, 60_001)).not.toThrow();
  });

  it("uses purpose-specific limits for sensitive routes", () => {
    expect(rateLimitConfig.register).toEqual({ windowMs: 60 * 60 * 1000, max: 5 });
    expect(rateLimitConfig["login-account"]).toEqual({ windowMs: 15 * 60 * 1000, max: 5 });
    expect(rateLimitConfig["chat-ask"]).toEqual({ windowMs: 60 * 60 * 1000, max: 12 });
    expect(rateLimitConfig["booking-create"]).toEqual({ windowMs: 60 * 60 * 1000, max: 10 });
    expect(rateLimitConfig["contact-message"]).toEqual({ windowMs: 60 * 60 * 1000, max: 5 });
  });

  it("sets Retry-After when a sensitive route is exceeded", () => {
    const req = request();
    const headers = new Map<string, string>();
    const res = { setHeader: (name: string, value: string) => headers.set(name, value) } as any;
    for (let attempt = 0; attempt < 12; attempt += 1) assertAuthRateLimit(req, "chat-ask", attempt, undefined, res);
    expect(() => assertAuthRateLimit(req, "chat-ask", 12, undefined, res)).toThrow("AUTH_RATE_LIMITED");
    expect(Number(headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("separates login attempts by account as well as IP", () => {
    const req = request();
    for (let attempt = 0; attempt < 5; attempt += 1) assertAuthRateLimit(req, "login-account", attempt, "a@example.com");
    expect(() => assertAuthRateLimit(req, "login-account", 5, "a@example.com")).toThrow("AUTH_RATE_LIMITED");
    expect(() => assertAuthRateLimit(req, "login-account", 5, "b@example.com")).not.toThrow();
  });

  it("uses secure, httpOnly, same-site cookies in production", () => {
    const previousEnvironment = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const cookieOptions = getSessionCookieOptions(request());
    process.env.NODE_ENV = previousEnvironment;

    expect(cookieOptions).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  });
});
