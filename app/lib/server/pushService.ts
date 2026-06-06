import "server-only";

import { getMessaging } from "firebase-admin/messaging";

import { adminDb } from "@/app/lib/firebaseAdmin";

export async function sendPushToUser({
  userId,
  title,
  body,
  url,
}: {
  userId: string;
  title: string;
  body: string;
  url?: string;
}) {
  if (!adminDb) return;

  const snapshot = await adminDb
    .collection("pushTokens")
    .where("userId", "==", userId)
    .where("enabled", "==", true)
    .get();

  if (snapshot.empty) return;

  const tokens = snapshot.docs.map((item) => item.data().token).filter(Boolean);

  if (tokens.length === 0) return;

  await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
    webpush: {
      fcmOptions: {
        link: url || "https://www.andormera.com/fa",
      },
      notification: {
        icon: "/logo/andormera_256.png",
      },
    },
    data: {
      url: url || "/fa",
    },
  });
}
