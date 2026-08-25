import { describe, expect, it } from "vitest";

describe("AUTH_BOOTSTRAP_SECRET configuration", () => {
  it("is available to the server for protected administrator onboarding", () => {
    const secret = process.env.AUTH_BOOTSTRAP_SECRET;
    expect(typeof secret).toBe("string");
    expect(secret?.trim().length).toBeGreaterThanOrEqual(12);
  });
});
