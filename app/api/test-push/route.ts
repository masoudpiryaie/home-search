import { NextResponse } from "next/server";

import { adminAuth } from "@/app/lib/firebaseAdmin";
import { sendPushToUser } from "@/app/lib/server/pushService";

export async function POST(request: Request) {
  try {
    if (!adminAuth) {
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

    await sendPushToUser({
      userId: decodedToken.uid,
      title: "تست نوتیفیکیشن Andormera",
      body: "اگر این پیام را می‌بینی، نوتیفیکیشن مرورگر درست کار می‌کند.",
      url: "http://localhost:3000/fa/notifications",
    });

    return NextResponse.json({
      ok: true,
      userId: decodedToken.uid,
    });
  } catch (error) {
    console.error("Test push error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not send test push.",
      },
      { status: 500 },
    );
  }
}
