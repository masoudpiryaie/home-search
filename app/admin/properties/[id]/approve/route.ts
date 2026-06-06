import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminAuth, adminDb } from "@/app/lib/firebaseAdmin";
import { sendEmail } from "@/app/lib/server/emailService";
import { sendPushToUser } from "@/app/lib/server/pushService";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured." },
        { status: 500 },
      );
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const adminId = decodedToken.uid;

    const adminSnap = await adminDb.collection("admins").doc(adminId).get();

    if (!adminSnap.exists) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
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

    await propertyRef.update({
      status: "active",
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      review: {
        reviewedBy: adminId,
        reviewedAt: FieldValue.serverTimestamp(),
      },
      moderation: {
        reviewedBy: adminId,
        reviewedAt: FieldValue.serverTimestamp(),
      },
    });

    await adminDb.collection("adminLogs").add({
      adminId,
      action: "approve_property",
      targetType: "property",
      targetId: id,
      before: {
        status: property?.status,
      },
      after: {
        status: "active",
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    const ownerId =
      property?.ownerId ||
      property?.submittedBy?.uid ||
      property?.createdBy ||
      "";

    const ownerEmail =
      property?.submittedBy?.email || property?.contact?.email || "";

    const propertyTitle =
      typeof property?.title === "object"
        ? property.title.fa ||
          property.title.en ||
          property.title.de ||
          "آگهی شما"
        : property?.title || "آگهی شما";

    const propertySlug = property?.slug || id;
    const propertyUrl = `${getBaseUrl()}/fa/properties/${propertySlug}`;

    if (ownerId) {
      await adminDb.collection("notifications").add({
        userId: ownerId,
        type: "listing_approved",
        title: "آگهی شما تایید شد",
        body: `آگهی «${propertyTitle}» تایید و منتشر شد.`,
        data: {
          propertyId: id,
          propertySlug,
          url: propertyUrl,
        },
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      await sendPushToUser({
        userId: ownerId,
        title: "آگهی شما تایید شد",
        body: `آگهی «${propertyTitle}» منتشر شد.`,
        url: propertyUrl,
      });
    }

    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: "آگهی شما در Andormera تایید شد",
        text: `آگهی شما با عنوان «${propertyTitle}» تایید و منتشر شد.\n\nمشاهده آگهی:\n${propertyUrl}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7">
            <h2>آگهی شما تایید شد</h2>
            <p>آگهی شما با عنوان <strong>${propertyTitle}</strong> تایید و منتشر شد.</p>
            <p>
              <a href="${propertyUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:10px">
                مشاهده آگهی
              </a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Approve property API error:", error);

    return NextResponse.json(
      { error: "Could not approve property." },
      { status: 500 },
    );
  }
}
