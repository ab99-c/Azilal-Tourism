import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("tourism loading states", () => {
  const skeleton = fs.readFileSync("client/src/components/TourismLoadingSkeleton.tsx", "utf8");
  const cafes = fs.readFileSync("client/src/components/CafesSection.tsx", "utf8");
  const hotels = fs.readFileSync("client/src/components/HotelsSection.tsx", "utf8");

  it("uses dedicated coffee and mountain variants", () => {
    expect(cafes).toContain('kind="cafes"');
    expect(hotels).toContain('kind="hotels"');
    expect(skeleton).toContain("Coffee");
    expect(skeleton).toContain("Mountain");
    expect(skeleton).toContain("Preparing your coffee stop");
    expect(skeleton).toContain("Preparing your Atlas stay");
  });

  it("keeps motion lightweight and accessible", () => {
    expect(skeleton).toContain("motion-safe:animate-pulse");
    expect(skeleton).toContain("motion-reduce:animate-none");
    expect(skeleton).toContain('role="status"');
    expect(skeleton).toContain("aria-live=\"polite\"");
  });
});
