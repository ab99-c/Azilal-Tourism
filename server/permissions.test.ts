import { describe, expect, it } from "vitest";
import {
  canManageOwnedResources,
  canManagePlatform,
  isAdmin,
  isBusinessProvider,
} from "./permissions";

describe("central permission helpers", () => {
  it("keeps admin compatibility with the existing role enum", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
    expect(isAdmin({ role: "user" })).toBe(false);
    expect(canManagePlatform({ role: "admin" })).toBe(true);
  });

  it("recognizes provider types without changing stored roles", () => {
    expect(isBusinessProvider({ role: "user", providerType: "hotel_owner" })).toBe(true);
    expect(isBusinessProvider({ role: "user", providerType: "tourist" })).toBe(false);
    expect(isBusinessProvider({ role: "admin", providerType: "hotel_owner" })).toBe(false);
  });

  it("allows only admins or matching owners to manage owned resources", () => {
    expect(canManageOwnedResources({ id: 7, role: "user" }, 7)).toBe(true);
    expect(canManageOwnedResources({ id: 8, role: "user" }, 7)).toBe(false);
    expect(canManageOwnedResources({ id: 8, role: "admin" }, 7)).toBe(true);
  });
});
