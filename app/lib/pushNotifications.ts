import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

import { app, db } from "@/app/lib/firebase";

export async function requestAndSavePushToken(userId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  if (!userId) {
    return null;
  }

  const supported = await isSupported();

  if (!supported) {
    console.warn("Firebase messaging is not supported in this browser.");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.warn("Service worker is not supported in this browser.");
    return null;
  }

  if (typeof Notification === "undefined") {
    console.warn("Browser Notification API is not supported.");
    return null;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.");
    return null;
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    return null;
  }

  await setDoc(
    doc(db, "pushTokens", token),
    {
      token,
      userId,
      enabled: true,
      platform: "web",
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return token;
}
