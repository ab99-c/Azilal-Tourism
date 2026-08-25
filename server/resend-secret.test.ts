import { describe, expect, it } from "vitest";

describe("Resend production secret", () => {
  it("authenticates a sending-only key without sending an email", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be configured").toBeTruthy();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    // A valid key reaches payload validation (400 or 422); invalid or unauthorised keys fail earlier.
    expect([400, 422], "RESEND_API_KEY must authenticate with Resend").toContain(response.status);
  }, 15_000);
});
