import { describe, expect, it, beforeEach } from "vitest";
import type { Request } from "express";
import { assertAuthRateLimit, clearAuthRateLimit, resetAuthRateLimitsForTests } from "./authRateLimit";
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
