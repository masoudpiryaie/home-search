import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";

import { db } from "@/app/lib/firebase";
import { cleanObject } from "@/app/lib/firestoreHelpers";
import type { Locale } from "@/app/lib/i18n";

export type AppUserRole =
  | "user"
  | "owner"
  | "agent"
  | "agency_admin"
  | "admin"
  | "super_admin";

export type AppUserStatus = "active" | "blocked" | "deleted" | "pending";

export type AppUserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: AppUserRole;
  isVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  status: AppUserStatus;
  city?: string;
  country?: string;
  language?: Locale;
  agencyId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
};

/**
 * User database logic is isolated here.
 * If later we migrate from Firebase to another backend,
 * UI/Auth components should only need small changes.
 */
export async function createOrUpdateUserProfile(
  firebaseUser: FirebaseUser,
  options?: {
    fullName?: string;
    language?: Locale;
  },
) {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const baseData = {
    id: firebaseUser.uid,
    fullName:
      options?.fullName ||
      firebaseUser.displayName ||
      firebaseUser.email?.split("@")[0] ||
      "",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || "",
    emailVerified: firebaseUser.emailVerified,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (userSnap.exists()) {
    await updateDoc(userRef, cleanObject(baseData));
    return;
  }

  const newUser: AppUserProfile = {
    ...baseData,
    role: "user",
    isVerified: false,
    phoneVerified: false,
    emailVerified: firebaseUser.emailVerified,
    status: "active",
    country: "Germany",
    language: options?.language || "en",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await setDoc(userRef, cleanObject(newUser));
}

export async function getUserProfile(userId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return {
    id: userSnap.id,
    ...userSnap.data(),
  } as AppUserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<AppUserProfile>,
) {
  await updateDoc(
    doc(db, "users", userId),
    cleanObject({
      ...updates,
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function blockUser(userId: string) {
  await updateUserProfile(userId, {
    status: "blocked",
  });
}

export async function markUserLastLogin(userId: string) {
  await updateDoc(doc(db, "users", userId), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
