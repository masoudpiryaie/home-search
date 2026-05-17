import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { Property, ListingType } from "../types/property";
import { cleanObject } from "./cleanObject";

const propertiesRef = collection(db, "properties");

export async function createProperty(property: Property) {
  const cleanedProperty = cleanObject(property);

  return addDoc(propertiesRef, {
    ...cleanedProperty,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getProperties(filters?: { listingType?: ListingType }) {
  const constraints = [];

  if (filters?.listingType) {
    constraints.push(where("listingType", "==", filters.listingType));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const q = query(propertiesRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as Property[];
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

export async function updateProperty(id: string, property: Partial<Property>) {
  const ref = doc(db, "properties", id);
  const cleanedProperty = cleanObject(property);

  return updateDoc(ref, {
    ...cleanedProperty,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProperty(id: string) {
  const ref = doc(db, "properties", id);
  return deleteDoc(ref);
}

export async function approveProperty(id: string) {
  const ref = doc(db, "properties", id);

  return updateDoc(ref, {
    status: "active",
    "review.reviewedAt": serverTimestamp(),
  });
}

export async function rejectProperty(id: string, note?: string) {
  const ref = doc(db, "properties", id);

  return updateDoc(ref, {
    status: "rejected",
    "review.reviewedAt": serverTimestamp(),
    "review.note": note || "",
  });
}

export async function getPublicProperties(filters?: {
  listingType?: ListingType;
}) {
  const constraints = [where("status", "==", "active")];

  if (filters?.listingType) {
    constraints.push(where("listingType", "==", filters.listingType));
  }

  const q = query(propertiesRef, ...constraints);
  const snapshot = await getDocs(q);

  const properties = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as Property[];

  return properties.sort((a, b) => {
    const dateA =
      a.createdAt && typeof a.createdAt === "object" && "seconds" in a.createdAt
        ? Number(a.createdAt.seconds)
        : 0;

    const dateB =
      b.createdAt && typeof b.createdAt === "object" && "seconds" in b.createdAt
        ? Number(b.createdAt.seconds)
        : 0;

    return dateB - dateA;
  });
}
