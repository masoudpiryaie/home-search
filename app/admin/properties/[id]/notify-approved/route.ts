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

function getPropertyTitle(title: unknown) {
  if (!title) return "آگهی شما";

  if (typeof title === "string") {
    return title;
  }

  if (typeof title === "object" && title !== null) {
    const value = title as {
      fa?: string;
      en?: string;
      de?: string;
    };

    return value.fa || value.en || value.de || "آگهی شما";
  }

  return "آگهی شما";
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

    const propertySnap = await adminDb.collection("properties").doc(id).get();

    if (!propertySnap.exists) {
      return NextResponse.json(
        { error: "Property not found." },
        { status: 404 },
      );
    }

    const property = propertySnap.data();

    if (property?.status !== "active") {
      return NextResponse.json(
        { error: "Property is not active." },
        { status: 400 },
      );
    }

    const ownerId =
      property?.ownerId ||
      property?.submittedBy?.uid ||
      property?.createdBy ||
      "";

    const ownerEmail =
      property?.submittedBy?.email || property?.contact?.email || "";

    const propertyTitle = getPropertyTitle(property?.title);
    const propertySlug = property?.slug || id;
    const propertyUrl = `${getBaseUrl()}/fa/properties/${propertySlug}`;

    if (!ownerId && !ownerEmail) {
      return NextResponse.json(
        { error: "Property owner contact not found." },
        { status: 400 },
      );
    }

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

      try {
        await sendPushToUser({
          userId: ownerId,
          title: "آگهی شما تایید شد",
          body: `آگهی «${propertyTitle}» منتشر شد.`,
          url: propertyUrl,
        });
      } catch (error) {
        console.error("Approved push failed:", error);
      }
    }

    if (ownerEmail) {
      try {
        await sendEmail({
          to: ownerEmail,
          subject: "آگهی شما در Andormera تایید شد",
          text: `آگهی شما با عنوان «${propertyTitle}» تایید و منتشر شد.\n\nمشاهده آگهی:\n${propertyUrl}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;direction:rtl;text-align:right">
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
      } catch (error) {
        console.error("Approved email failed:", error);
      }
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Notify approved API error:", error);

    return NextResponse.json(
      { error: "Could not send approved notification." },
      { status: 500 },
    );
  }
}
