import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";
import {
  cleanObject,
  mapDoc,
  sortByNewest,
  type FirestoreDate,
} from "@/app/lib/firestoreHelpers";
import {
  mapLegacyPropertyToProfessional,
  mapProfessionalPropertyToLegacy,
  type ProfessionalProperty,
  type ProfessionalPropertyPurpose,
  type ProfessionalPropertyStatus,
  type ProfessionalPropertyType,
} from "@/app/lib/services/propertyMapper";
import { createPropertySlug } from "@/app/lib/slug";
import type { Property } from "@/app/types/property";

const propertiesRef = collection(db, "properties");

export type PropertySortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "size_asc"
  | "size_desc";

export type PropertyQueryFilters = {
  purpose?: ProfessionalPropertyPurpose;
  type?: ProfessionalPropertyType;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minSize?: number;
  maxSize?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  status?: ProfessionalPropertyStatus;
  ownerId?: string;
  agencyId?: string;
  sortBy?: PropertySortOption;
  pageSize?: number;
};

/**
 * Firestore is used only inside service files.
 * If later we migrate to PostgreSQL or another backend,
 * this file is one of the main places that should change.
 */
function normalizeProfessionalProperty(
  property: ProfessionalProperty | Property,
): ProfessionalProperty {
  if ("purpose" in property && "type" in property && "address" in property) {
    return property as ProfessionalProperty;
  }

  return mapLegacyPropertyToProfessional(property as Property);
}

function sortProperties(
  properties: ProfessionalProperty[],
  sortBy: PropertySortOption = "newest",
) {
  const items = [...properties];

  if (sortBy === "price_asc") {
    return items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  }

  if (sortBy === "price_desc") {
    return items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }

  if (sortBy === "size_asc") {
    return items.sort(
      (a, b) => Number(a.sizeSqm || 0) - Number(b.sizeSqm || 0),
    );
  }

  if (sortBy === "size_desc") {
    return items.sort(
      (a, b) => Number(b.sizeSqm || 0) - Number(a.sizeSqm || 0),
    );
  }

  return sortByNewest(items);
}

function applyMemoryFilters(
  properties: ProfessionalProperty[],
  filters: PropertyQueryFilters = {},
) {
  let result = [...properties];

  if (filters.purpose) {
    result = result.filter((item) => item.purpose === filters.purpose);
  }

  if (filters.type) {
    result = result.filter((item) => item.type === filters.type);
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status);
  }

  if (filters.ownerId) {
    result = result.filter((item) => item.ownerId === filters.ownerId);
  }

  if (filters.agencyId) {
    result = result.filter((item) => item.agencyId === filters.agencyId);
  }

  if (filters.city?.trim()) {
    const city = filters.city.toLowerCase().trim();

    result = result.filter((item) =>
      item.address?.city?.toLowerCase().includes(city),
    );
  }

  if (filters.district?.trim()) {
    const district = filters.district.toLowerCase().trim();

    result = result.filter((item) =>
      item.address?.district?.toLowerCase().includes(district),
    );
  }

  if (typeof filters.minPrice === "number") {
    result = result.filter(
      (item) => Number(item.price || 0) >= filters.minPrice!,
    );
  }

  if (typeof filters.maxPrice === "number") {
    result = result.filter(
      (item) => Number(item.price || 0) <= filters.maxPrice!,
    );
  }

  if (typeof filters.minRooms === "number") {
    result = result.filter(
      (item) => Number(item.rooms || 0) >= filters.minRooms!,
    );
  }

  if (typeof filters.maxRooms === "number") {
    result = result.filter(
      (item) => Number(item.rooms || 0) <= filters.maxRooms!,
    );
  }

  if (typeof filters.minSize === "number") {
    result = result.filter(
      (item) => Number(item.sizeSqm || 0) >= filters.minSize!,
    );
  }

  if (typeof filters.maxSize === "number") {
    result = result.filter(
      (item) => Number(item.sizeSqm || 0) <= filters.maxSize!,
    );
  }

  if (typeof filters.furnished === "boolean") {
    result = result.filter(
      (item) => Boolean(item.features?.furnished) === filters.furnished,
    );
  }

  if (typeof filters.petsAllowed === "boolean") {
    result = result.filter(
      (item) => Boolean(item.features?.petsAllowed) === filters.petsAllowed,
    );
  }

  return sortProperties(result, filters.sortBy);
}

export async function createProperty(property: Property) {
  const docRef = doc(propertiesRef);

  const propertyWithSlug = {
    ...property,
    slug: property.slug || createPropertySlug(property),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const cleanProperty = cleanObject(propertyWithSlug);

  await setDoc(docRef, cleanProperty);

  return docRef.id;
}

export async function updateProperty(
  propertyId: string,
  updates: Partial<ProfessionalProperty> | Partial<Property>,
) {
  await updateDoc(
    doc(db, "properties", propertyId),
    cleanObject({
      ...updates,
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function softDeleteProperty(propertyId: string) {
  await updateDoc(doc(db, "properties", propertyId), {
    status: "deleted",
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getPropertyById(propertyId: string) {
  const propertyRef = doc(db, "properties", propertyId);
  const snapshot = await getDoc(propertyRef);

  if (!snapshot.exists()) return null;

  return normalizeProfessionalProperty({
    id: snapshot.id,
    ...snapshot.data(),
  } as Property);
}

export async function getPropertyBySlug(slug: string) {
  const propertyQuery = query(
    propertiesRef,
    where("slug", "==", slug),
    limit(1),
  );
  const snapshot = await getDocs(propertyQuery);

  if (snapshot.empty) return null;

  const property = mapDoc<Property>(snapshot.docs[0]);

  return normalizeProfessionalProperty(property);
}

export async function getPropertyByIdOrSlug(value: string) {
  const bySlug = await getPropertyBySlug(value);

  if (bySlug) return bySlug;

  return getPropertyById(value);
}

export async function getPublishedPropertyById(propertyId: string) {
  const property = await getPropertyById(propertyId);

  if (!property) return null;

  if (property.status !== "published") return null;

  return property;
}

export async function getProperties(filters: PropertyQueryFilters = {}) {
  /**
   * Firestore has query limitations.
   * Here we use only safe Firestore constraints and apply advanced filters in memory.
   * Later this can be moved to Algolia, Meilisearch, Elasticsearch, or SQL.
   */
  const constraints = [];

  if (filters.status) {
    constraints.push(where("status", "==", filters.status));
  }

  if (filters.ownerId) {
    constraints.push(where("ownerId", "==", filters.ownerId));
  }

  if (filters.agencyId) {
    constraints.push(where("agencyId", "==", filters.agencyId));
  }

  const propertiesQuery =
    constraints.length > 0
      ? query(propertiesRef, ...constraints)
      : query(propertiesRef);

  const snapshot = await getDocs(propertiesQuery);

  const properties = snapshot.docs.map((item) =>
    normalizeProfessionalProperty(mapDoc<Property>(item)),
  );

  const filtered = applyMemoryFilters(properties, filters);

  if (filters.pageSize) {
    return filtered.slice(0, filters.pageSize);
  }

  return filtered;
}

export async function getUserProperties(userId: string) {
  return getProperties({
    ownerId: userId,
    sortBy: "newest",
  });
}

export async function getAgencyProperties(agencyId: string) {
  return getProperties({
    agencyId,
    sortBy: "newest",
  });
}

export async function submitPropertyForReview(propertyId: string) {
  await updateDoc(doc(db, "properties", propertyId), {
    status: "pending_review",
    updatedAt: serverTimestamp(),
  });
}

export async function publishProperty(propertyId: string) {
  await updateDoc(doc(db, "properties", propertyId), {
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function approveProperty(propertyId: string, adminId?: string) {
  await updateDoc(
    doc(db, "properties", propertyId),
    cleanObject({
      status: "published",
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      moderation: {
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
      },
      review: {
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
      },
    }),
  );
}

export async function rejectProperty(
  propertyId: string,
  rejectionReason: string,
  adminId?: string,
) {
  await updateDoc(
    doc(db, "properties", propertyId),
    cleanObject({
      status: "rejected",
      updatedAt: serverTimestamp(),
      moderation: {
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        rejectionReason,
      },
      review: {
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        note: rejectionReason,
      },
    }),
  );
}

export async function incrementPropertyViews(propertyId: string) {
  await updateDoc(doc(db, "properties", propertyId), {
    "stats.views": increment(1),
    viewCount: increment(1),
    lastViewedAt: serverTimestamp(),
  });
}
