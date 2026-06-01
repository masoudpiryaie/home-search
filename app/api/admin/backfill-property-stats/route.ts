import { NextResponse } from "next/server";

import { adminDb } from "@/app/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-admin-secret");

    if (secret !== process.env.ADMIN_BACKFILL_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured." },
        { status: 500 },
      );
    }

    const snapshot = await adminDb.collection("properties").get();

    let updated = 0;

    const batch = adminDb.batch();

    snapshot.docs.forEach((docItem) => {
      const data = docItem.data();

      const currentStats = data.stats;

      const hasValidStats =
        currentStats &&
        typeof currentStats === "object" &&
        !Array.isArray(currentStats);

      if (!hasValidStats) {
        batch.update(docItem.ref, {
          stats: {
            views: Number(data.viewCount || 0),
            favorites: 0,
            inquiries: 0,
          },
        });

        updated += 1;
      }
    });

    if (updated > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      ok: true,
      updated,
      total: snapshot.size,
    });
  } catch (error) {
    console.error("Backfill property stats error:", error);

    return NextResponse.json(
      { error: "Could not backfill property stats." },
      { status: 500 },
    );
  }
}
