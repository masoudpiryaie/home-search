import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

import { app, db } from "@/app/lib/firebase";

export async function requestAndSavePushToken(userId: string) {
  try {
    console.log("Push step 1: start", { userId });

    if (typeof window === "undefined") {
      console.warn("Push failed: window is undefined");
      return null;
    }

    if (!userId) {
      console.warn("Push failed: userId is missing");
      return null;
    }

    const supported = await isSupported();
    console.log("Push step 2: isSupported", supported);

    if (!supported) {
      console.warn("Push failed: Firebase messaging is not supported.");
      return null;
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("Push failed: Service worker is not supported.");
      return null;
    }

    if (typeof Notification === "undefined") {
      console.warn("Push failed: Notification API is not supported.");
      return null;
    }

    console.log("Push step 3: current permission", Notification.permission);

    const permission = await Notification.requestPermission();
    console.log("Push step 4: requested permission", permission);

    if (permission !== "granted") {
      console.warn("Push failed: permission is not granted");
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    console.log("Push step 5: has vapid key", Boolean(vapidKey));

    if (!vapidKey) {
      console.warn("Push failed: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    console.log("Push step 6: service worker registered", registration.scope);

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    console.log("Push step 7: token exists", Boolean(token));

    if (!token) {
      console.warn("Push failed: token is empty");
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

    console.log("Push step 8: token saved in Firestore");

    return token;
  } catch (error) {
    console.error("Push failed with error:", error);
    return null;
  }
}
