import "server-only";

import { adminDb } from "@/app/lib/firebaseAdmin";
import type { Property } from "@/app/types/property";

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

export async function getPropertySeoBySlug(value: string) {
  try {
    if (!adminDb) {
      console.warn("SEO: Firebase Admin is not connected.");
      return null;
    }

    const cleanValue = normalizeSlug(value);

    console.log("SEO: searching property:", cleanValue);

    const bySlugSnapshot = await adminDb
      .collection("properties")
      .where("slug", "==", cleanValue)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (!bySlugSnapshot.empty) {
      const doc = bySlugSnapshot.docs[0];

      console.log("SEO: found by slug:", doc.id);

      return {
        id: doc.id,
        ...doc.data(),
      } as Property;
    }

    const byIdDoc = await adminDb
      .collection("properties")
      .doc(cleanValue)
      .get();

    if (byIdDoc.exists) {
      const data = byIdDoc.data();

      if (data?.status === "active") {
        console.log("SEO: found by id:", byIdDoc.id);

        return {
          id: byIdDoc.id,
          ...data,
        } as Property;
      }

      console.warn("SEO: found by id but not active:", {
        id: byIdDoc.id,
        status: data?.status,
      });
    }

    console.warn("SEO: property not found or not active:", cleanValue);

    return null;
  } catch (error) {
    console.warn("SEO: could not load property data:", error);
    return null;
  }
}
