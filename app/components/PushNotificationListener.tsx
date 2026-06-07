"use client";

import { useEffect } from "react";
import { getMessaging, isSupported, onMessage } from "firebase/messaging";

import { app } from "@/app/lib/firebase";

export default function PushNotificationListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setupListener() {
      if (typeof window === "undefined") return;
      if (typeof Notification === "undefined") return;

      const supported = await isSupported();

      if (!supported) {
        console.warn("Push listener: messaging is not supported.");
        return;
      }

      if (Notification.permission !== "granted") {
        console.warn("Push listener: notification permission is not granted.");
        return;
      }

      const messaging = getMessaging(app);

      unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground push received:", payload);

        const title = payload.notification?.title || "Andormera";
        const body = payload.notification?.body || "";
        const url =
          payload.data?.url || payload.fcmOptions?.link || "/fa/notifications";

        const notification = new Notification(title, {
          body,
          icon: "/logo/andormera_256.png",
          badge: "/logo/andormera_256.png",
          data: {
            url,
          },
        });

        notification.onclick = () => {
          window.focus();
          window.location.href = url;
          notification.close();
        };
      });
    }

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return null;
}
