import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Navbar authentication visibility", () => {
  it("waits for auth resolution before rendering login actions on desktop and mobile", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/Navbar.tsx"),
      "utf8",
    );

    const guardedActions = "{authLoading ? null : isAuthenticated ? (";
    expect(source.split(guardedActions).length - 1).toBeGreaterThanOrEqual(2);
  });
});
