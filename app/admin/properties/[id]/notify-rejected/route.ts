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

    const body = await request.json().catch(() => ({}));
    const note = String(body.note || "").trim();

    const propertySnap = await adminDb.collection("properties").doc(id).get();

    if (!propertySnap.exists) {
      return NextResponse.json(
        { error: "Property not found." },
        { status: 404 },
      );
    }

    const property = propertySnap.data();

    if (property?.status !== "rejected") {
      return NextResponse.json(
        { error: "Property is not rejected." },
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
    const dashboardUrl = `${getBaseUrl()}/fa/my-listings`;

    const rejectionNote =
      note ||
      property?.review?.note ||
      property?.moderation?.rejectionReason ||
      "دلیل مشخصی ثبت نشده است.";

    if (ownerId) {
      await adminDb.collection("notifications").add({
        userId: ownerId,
        type: "listing_rejected",
        title: "آگهی شما رد شد",
        body: `آگهی «${propertyTitle}» رد شد.`,
        data: {
          propertyId: id,
          url: dashboardUrl,
          note: rejectionNote,
        },
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      try {
        await sendPushToUser({
          userId: ownerId,
          title: "آگهی شما رد شد",
          body: `آگهی «${propertyTitle}» نیاز به اصلاح دارد.`,
          url: dashboardUrl,
        });
      } catch (error) {
        console.error("Rejected push failed:", error);
      }
    }

    if (ownerEmail) {
      try {
        await sendEmail({
          to: ownerEmail,
          subject: "آگهی شما در Andormera رد شد",
          text: `آگهی شما با عنوان «${propertyTitle}» رد شد.\n\nدلیل:\n${rejectionNote}\n\nبرای مشاهده آگهی‌های خود:\n${dashboardUrl}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;direction:rtl;text-align:right">
              <h2>آگهی شما رد شد</h2>
              <p>آگهی شما با عنوان <strong>${propertyTitle}</strong> رد شد.</p>
              <p><strong>دلیل:</strong></p>
              <p style="background:#fff3f3;padding:12px;border-radius:10px">${rejectionNote}</p>
              <p>
                <a href="${dashboardUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:10px">
                  مشاهده آگهی‌های من
                </a>
              </p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Rejected email failed:", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Notify rejected API error:", error);

    return NextResponse.json(
      { error: "Could not send rejected notification." },
      { status: 500 },
    );
  }
}
