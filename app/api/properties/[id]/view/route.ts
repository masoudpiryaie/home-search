import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/app/lib/firebaseAdmin";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: Props) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Property id is required." },
        { status: 400 },
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured." },
        { status: 500 },
      );
    }

    const propertyRef = adminDb.collection("properties").doc(id);
    const propertySnap = await propertyRef.get();

    if (!propertySnap.exists) {
      return NextResponse.json(
        { error: "Property not found." },
        { status: 404 },
      );
    }

    const property = propertySnap.data();

    if (property?.status !== "active") {
      return NextResponse.json(
        { error: "Property is not public." },
        { status: 403 },
      );
    }

    const currentStats = property?.stats;

    const hasValidStats =
      currentStats &&
      typeof currentStats === "object" &&
      !Array.isArray(currentStats);

    if (!hasValidStats) {
      await propertyRef.update({
        stats: {
          views: Number(property?.viewCount || 0),
          favorites: 0,
          inquiries: 0,
        },
      });
    }

    await propertyRef.update({
      viewCount: FieldValue.increment(1),
      "stats.views": FieldValue.increment(1),
      lastViewedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("View count API error:", error);

    return NextResponse.json(
      { error: "Could not update property view." },
      { status: 500 },
    );
  }
}
