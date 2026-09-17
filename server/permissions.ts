import type { User } from "../drizzle/schema";

/**
 * Compatibility-first permission model.
 * The database currently stores `user` and `admin`; providerType identifies
 * the business specialization without changing production enum values.
 */
export const PLATFORM_ROLES = ["user", "admin"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "admin";
}

export function isBusinessProvider(
  user: Pick<User, "role" | "providerType"> | null | undefined,
): boolean {
  if (!user || user.role === "admin") return false;
  return user.providerType !== "tourist";
}

export function canManagePlatform(
  user: Pick<User, "role"> | null | undefined,
): boolean {
  return isAdmin(user);
}

export function canManageOwnedResources(
  user: Pick<User, "id" | "role"> | null | undefined,
  ownerId: number,
): boolean {
  return Boolean(user && (isAdmin(user) || user.id === ownerId));
}

export const PERMISSION_ERRORS = {
  ADMIN_ONLY: "ADMIN_ONLY_ERR",
  OWNER_ONLY: "OWNER_ONLY_ERR",
} as const;
