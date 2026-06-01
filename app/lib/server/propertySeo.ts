import "server-only";

import { adminDb } from "@/app/lib/firebaseAdmin";
import type { Property } from "@/app/types/property";

export async function getPropertySeoBySlug(slug: string) {
  try {
    if (!adminDb) {
      return null;
    }

    const snapshot = await adminDb
      .collection("properties")
      .where("slug", "==", slug)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    } as Property;
  } catch (error) {
    console.warn("Could not load property SEO data:", error);
    return null;
  }
}
