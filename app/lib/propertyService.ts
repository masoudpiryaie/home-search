import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";
import { cleanObject, mapDoc, sortByNewest } from "@/app/lib/firestoreHelpers";
import { createPropertySlug } from "@/app/lib/slug";
import type { ListingType, Property } from "@/app/types/property";

const propertiesRef = collection(db, "properties");

type PropertyFilters = {
  listingType?: ListingType;
};

export type PaginatedPropertiesResult = {
  properties: Property[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
};

function ensurePropertyDefaults(property: Property) {
  const stats = property.stats || {
    views: property.viewCount || 0,
    favorites: 0,
    inquiries: 0,
  };
  return cleanObject({
    ...property,

    slug: property.slug || createPropertySlug(property),

    currency: property.currency || "EUR",

    stats: {
      views: Number(stats.views || property.viewCount || 0),
      favorites: Number(stats.favorites || 0),
      inquiries: Number(stats.inquiries || 0),
    },

    viewCount: property.viewCount || property.stats?.views || 0,

    isFeatured: property.isFeatured || false,
  });
}

export async function createProperty(property: Property) {
  const docRef = doc(propertiesRef);

  const propertyWithDefaults = ensurePropertyDefaults({
    ...property,
    id: docRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as Property);

  await setDoc(docRef, propertyWithDefaults);

  return docRef.id;
}

export async function getProperties(filters?: PropertyFilters) {
  return getPublicProperties(filters);
}

// export async function getPublicProperties(filters?: PropertyFilters) {
//   const activeQuery = filters?.listingType
//     ? query(
//         propertiesRef,
//         where("status", "==", "active"),
//         where("listingType", "==", filters.listingType),
//       )
//     : query(propertiesRef, where("status", "==", "active"));

//   const publishedQuery = filters?.listingType
//     ? query(
//         propertiesRef,
//         where("status", "==", "published"),
//         where("listingType", "==", filters.listingType),
//       )
//     : query(propertiesRef, where("status", "==", "published"));

//   const [activeSnapshot, publishedSnapshot] = await Promise.all([
//     getDocs(activeQuery),
//     getDocs(publishedQuery),
//   ]);

//   const map = new Map<string, Property>();

//   activeSnapshot.docs.forEach((item) => {
//     const property = mapDoc<Property>(item);
//     map.set(item.id, property);
//   });

//   publishedSnapshot.docs.forEach((item) => {
//     const property = mapDoc<Property>(item);
//     map.set(item.id, property);
//   });

//   return sortByNewest([...map.values()]);
// }

export async function getPublicProperties(filters?: PropertyFilters) {
  const publicQuery = filters?.listingType
    ? query(
        propertiesRef,
        where("status", "==", "active"),
        where("listingType", "==", filters.listingType),
      )
    : query(propertiesRef, where("status", "==", "active"));

  const snapshot = await getDocs(publicQuery);

  return sortByNewest(snapshot.docs.map((item) => mapDoc<Property>(item)));
}

export async function getPublicPropertiesPaginated({
  listingType,
  pageSize = 9,
  lastDoc,
}: {
  listingType?: ListingType;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot | null;
}): Promise<PaginatedPropertiesResult> {
  const constraints = [where("status", "==", "active")];

  if (listingType) {
    constraints.push(where("listingType", "==", listingType));
  }

  const propertiesQuery = lastDoc
    ? query(
        propertiesRef,
        ...constraints,
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize + 1),
      )
    : query(
        propertiesRef,
        ...constraints,
        orderBy("createdAt", "desc"),
        limit(pageSize + 1),
      );

  const snapshot = await getDocs(propertiesQuery);

  const docs = snapshot.docs;
  const visibleDocs = docs.slice(0, pageSize);

  return {
    properties: visibleDocs.map((item) => mapDoc<Property>(item)),
    lastDoc:
      visibleDocs.length > 0 ? visibleDocs[visibleDocs.length - 1] : null,
    hasMore: docs.length > pageSize,
  };
}

export async function getAdminProperties() {
  const snapshot = await getDocs(propertiesRef);

  return sortByNewest(snapshot.docs.map((item) => mapDoc<Property>(item)));
}

export async function getMyProperties(userId: string) {
  const ownerQuery = query(propertiesRef, where("ownerId", "==", userId));
  const submittedQuery = query(
    propertiesRef,
    where("submittedBy.uid", "==", userId),
  );

  const [ownerSnapshot, submittedSnapshot] = await Promise.all([
    getDocs(ownerQuery),
    getDocs(submittedQuery),
  ]);

  const map = new Map<string, Property>();

  ownerSnapshot.docs.forEach((item) => {
    map.set(item.id, mapDoc<Property>(item));
  });

  submittedSnapshot.docs.forEach((item) => {
    map.set(item.id, mapDoc<Property>(item));
  });

  return sortByNewest([...map.values()]);
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

export async function getPublicPropertyBySlug(slug: string) {
  const propertiesQuery = query(
    propertiesRef,
    where("slug", "==", slug),
    where("status", "==", "active"),
    limit(1),
  );

  const snapshot = await getDocs(propertiesQuery);

  if (snapshot.empty) {
    return null;
  }

  return mapDoc<Property>(snapshot.docs[0]);
}

export async function getPublicPropertyByIdOrSlug(value: string) {
  const bySlug = await getPublicPropertyBySlug(value);

  if (bySlug) {
    return bySlug;
  }

  const byId = await getPropertyById(value);

  if (!byId || byId.status !== "active") {
    return null;
  }

  return byId;
}

export async function updateProperty(id: string, property: Property) {
  const cleanProperty = cleanObject({
    ...property,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "properties", id), cleanProperty);
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

export async function deleteProperty(id: string) {
  await deleteDoc(doc(db, "properties", id));
}

export async function softDeleteProperty(id: string) {
  await updateDoc(doc(db, "properties", id), {
    status: "deleted",
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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

    moderation:
      status === "active" || status === "rejected"
        ? {
            reviewedBy,
            reviewedAt: serverTimestamp(),
            rejectionReason:
              status === "rejected" ? note?.trim() || undefined : undefined,
          }
        : undefined,

    publishedAt: status === "active" ? serverTimestamp() : undefined,
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

export async function getSimilarProperties(property: Property) {
  if (!property.id) {
    return [];
  }

  const activeQuery = query(
    propertiesRef,
    where("status", "==", "active"),
    where("listingType", "==", property.listingType),
  );

  const snapshot = await getDocs(activeQuery);

  const properties = snapshot.docs
    .map((item) => mapDoc<Property>(item))
    .filter((item) => item.id !== property.id);

  const city = property.location?.city?.toLowerCase().trim() || "";
  const district = property.location?.district?.toLowerCase().trim() || "";

  return properties
    .map((item) => {
      let score = 0;

      if (city && item.location?.city?.toLowerCase().trim() === city) {
        score += 4;
      }

      if (
        district &&
        item.location?.district?.toLowerCase().trim() === district
      ) {
        score += 3;
      }

      if (item.propertyType === property.propertyType) {
        score += 2;
      }

      const price = Number(property.price || 0);
      const priceDiff = Math.abs(Number(item.price || 0) - price);

      if (price > 0 && priceDiff <= price * 0.25) {
        score += 1;
      }

      return {
        property: item,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.property);
}

export async function incrementPropertyView(id: string) {
  try {
    await updateDoc(doc(db, "properties", id), {
      viewCount: increment(1),
      "stats.views": increment(1),
      lastViewedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("View count update failed:", error);
  }
}
