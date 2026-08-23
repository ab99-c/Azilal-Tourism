import { describe, expect, it } from "vitest";
import { TWENTY_FOUR_HOURS_MS, isSafetyTripOverdue } from "./safetyTrips";

describe("safety trip escalation rule", () => {
  const now = new Date("2026-08-23T12:00:00.000Z");

  it("does not escalate before 24 hours", () => {
    expect(isSafetyTripOverdue(new Date(now.getTime() - TWENTY_FOUR_HOURS_MS + 1), now)).toBe(false);
  });

  it("escalates at exactly 24 hours", () => {
    expect(isSafetyTripOverdue(new Date(now.getTime() - TWENTY_FOUR_HOURS_MS), now)).toBe(true);
  });
});
