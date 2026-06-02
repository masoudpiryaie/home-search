import { NextResponse } from "next/server";

import { adminDb, isFirebaseAdminConfigured } from "@/app/lib/firebaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({
      error: "slug is required",
      example: "/api/admin-seo-test?slug=your-property-slug",
    });
  }

  if (!adminDb) {
    return NextResponse.json({
      configured: isFirebaseAdminConfigured,
      connected: false,
      error: "Firebase Admin is not connected",
    });
  }

  const snapshot = await adminDb
    .collection("properties")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({
      configured: isFirebaseAdminConfigured,
      connected: true,
      found: false,
      slug,
    });
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return NextResponse.json({
    configured: isFirebaseAdminConfigured,
    connected: true,
    found: true,
    id: doc.id,
    slug: data.slug,
    status: data.status,
    title: data.title,
  });
}
