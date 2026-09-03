import { describe, expect, it } from "vitest";

describe("contact email configuration", () => {
  it("has a valid admin recipient and sender configuration", () => {
    expect(process.env.CONTACT_ADMIN_EMAIL).toBe("adrar6705@gmail.com");
    expect(process.env.CONTACT_FROM_EMAIL).toBe("adrar6705@gmail.com");
    expect(process.env.CONTACT_ADMIN_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(process.env.CONTACT_FROM_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("authenticates the configured Resend key without sending an email", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be configured").toBeTruthy();
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(response.status, "RESEND_API_KEY must authenticate with Resend").not.toBe(401);
  }, 15_000);
});
