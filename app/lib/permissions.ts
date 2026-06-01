import type { User } from "firebase/auth";

import type { Property } from "@/app/types/property";

export type UserRole =
  | "user"
  | "owner"
  | "agent"
  | "agency_admin"
  | "admin"
  | "super_admin";

export type AppUser = {
  id?: string;
  uid?: string;
  role?: UserRole;
  agencyId?: string;
  status?: "active" | "blocked" | "deleted" | "pending";
};

export function getUserId(user?: User | AppUser | null) {
  if (!user) return "";

  if ("uid" in user && user.uid) return user.uid;
  if ("id" in user && user.id) return user.id;

  return "";
}

export function isAdmin(user?: AppUser | null) {
  return user?.role === "admin" || user?.role === "super_admin";
}

export function isSuperAdmin(user?: AppUser | null) {
  return user?.role === "super_admin";
}

export function isPropertyOwner(
  property: Property,
  user?: User | AppUser | null,
) {
  const userId = getUserId(user);

  if (!userId) return false;

  return (
    property.submittedBy?.uid === userId ||
    property.createdBy === userId ||
    // برای ساختار آینده
    (property as Property & { ownerId?: string }).ownerId === userId
  );
}

export function canEditProperty({
  property,
  user,
  appUser,
}: {
  property: Property;
  user?: User | null;
  appUser?: AppUser | null;
}) {
  if (isAdmin(appUser)) return true;

  return isPropertyOwner(property, user || appUser);
}

export function canDeleteProperty({
  property,
  user,
  appUser,
}: {
  property: Property;
  user?: User | null;
  appUser?: AppUser | null;
}) {
  if (isAdmin(appUser)) return true;

  return isPropertyOwner(property, user || appUser);
}

export function canApproveProperty(appUser?: AppUser | null) {
  return isAdmin(appUser);
}

export function canManageAgency({
  agencyId,
  appUser,
}: {
  agencyId?: string;
  appUser?: AppUser | null;
}) {
  if (!appUser) return false;
  if (isAdmin(appUser)) return true;

  return (
    appUser.role === "agency_admin" &&
    Boolean(agencyId) &&
    appUser.agencyId === agencyId
  );
}

export function canCreateProperty(user?: User | AppUser | null) {
  return Boolean(getUserId(user));
}
