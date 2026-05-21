import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";
import type { ListingType, Property } from "@/app/types/property";

const propertiesRef = collection(db, "properties");

type PropertyFilters = {
  listingType?: ListingType;
};

type FirestoreLikeDate =
  | {
      seconds?: number;
      nanoseconds?: number;
      toDate?: () => Date;
    }
  | Date
  | string
  | number
  | null
  | undefined;

function cleanObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanObject(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, cleanObject(item)]),
    ) as T;
  }

  return value;
}

function toMillis(value: FirestoreLikeDate) {
  if (!value) return 0;

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  if (typeof value.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
}

function sortByNewest(properties: Property[]) {
  return [...properties].sort(
    (a, b) =>
      toMillis(b.createdAt as FirestoreLikeDate) -
      toMillis(a.createdAt as FirestoreLikeDate),
  );
}

function mapPropertyDoc(docItem: { id: string; data: () => unknown }) {
  return {
    id: docItem.id,
    ...(docItem.data() as Record<string, unknown>),
  } as Property;
}

export async function createProperty(property: Property) {
  const cleanProperty = cleanObject({
    ...property,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const docRef = await addDoc(propertiesRef, cleanProperty);

  return docRef.id;
}

export async function getProperties(filters?: PropertyFilters) {
  return getPublicProperties(filters);
}

export async function getPublicProperties(filters?: PropertyFilters) {
  const constraints = [where("status", "==", "active")];

  if (filters?.listingType) {
    constraints.push(where("listingType", "==", filters.listingType));
  }

  const propertiesQuery = query(propertiesRef, ...constraints);
  const snapshot = await getDocs(propertiesQuery);

  const properties = snapshot.docs.map(mapPropertyDoc);

  return sortByNewest(properties);
}

export async function getAdminProperties() {
  const snapshot = await getDocs(propertiesRef);

  const properties = snapshot.docs.map(mapPropertyDoc);

  return sortByNewest(properties);
}

export async function getMyProperties(userId: string) {
  const propertiesQuery = query(
    propertiesRef,
    where("submittedBy.uid", "==", userId),
  );

  const snapshot = await getDocs(propertiesQuery);

  const properties = snapshot.docs.map(mapPropertyDoc);

  return sortByNewest(properties);
}

export async function getPropertyById(id: string) {
  const ref = doc(db, "properties", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Property;
}

export async function updateProperty(id: string, property: Property) {
  const cleanProperty = cleanObject({
    ...property,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "properties", id), cleanProperty);
}

export async function deleteProperty(id: string) {
  await deleteDoc(doc(db, "properties", id));
}

export async function updatePropertyStatus(
  id: string,
  status: Property["status"],
  note?: string,
  reviewedBy?: string,
) {
  const updateData = cleanObject({
    status,
    updatedAt: serverTimestamp(),
    review:
      status === "active" || status === "rejected"
        ? {
            reviewedBy,
            reviewedAt: serverTimestamp(),
            note: note?.trim() || undefined,
          }
        : undefined,
  });

  await updateDoc(doc(db, "properties", id), updateData);
}

export async function approveProperty(id: string, reviewedBy?: string) {
  await updatePropertyStatus(id, "active", undefined, reviewedBy);
}

export async function rejectProperty(
  id: string,
  note?: string,
  reviewedBy?: string,
) {
  await updatePropertyStatus(id, "rejected", note, reviewedBy);
}

export async function updateUserProperty(
  id: string,
  property: Property,
  nextEditCount: number,
) {
  const cleanProperty = cleanObject({
    ...property,
    status: "pending",
    editCount: nextEditCount,
    lastEditedByUserAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "properties", id), cleanProperty);
}
