import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import type { FieldValue } from "firebase/firestore";

import { db } from "@/app/lib/firebase";
import { cleanObject, mapDoc, sortByNewest } from "@/app/lib/firestoreHelpers";
import type { FirestoreDate } from "@/app/lib/firestoreHelpers";

export type NotificationType =
  | "new_message"
  | "inquiry"
  | "listing_approved"
  | "listing_rejected"
  | "saved_search_match"
  | "payment_success";

export type AppNotification = {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt?: FirestoreDate;
};

type AppNotificationInput = Omit<AppNotification, "createdAt"> & {
  createdAt?: FirestoreDate | FieldValue;
};

const notificationsRef = collection(db, "notifications");

/**
 * Notification logic is isolated here.
 * Later, if we move from Firebase to another backend, UI does not need big changes.
 */
export async function createNotification(
  notificationInput: Omit<AppNotification, "id" | "isRead" | "createdAt"> &
    Partial<Pick<AppNotification, "isRead">>,
) {
  const notification: AppNotificationInput = {
    ...notificationInput,
    isRead: notificationInput.isRead ?? false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(notificationsRef, cleanObject(notification));

  return docRef.id;
}

export async function getUserNotifications(userId: string) {
  const notificationsQuery = query(
    notificationsRef,
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(notificationsQuery);

  const notifications = snapshot.docs.map((item) =>
    mapDoc<AppNotification>(item),
  );

  return sortByNewest(notifications);
}

export async function markNotificationAsRead(notificationId: string) {
  await updateDoc(doc(db, "notifications", notificationId), {
    isRead: true,
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  const notifications = await getUserNotifications(userId);

  await Promise.all(
    notifications
      .filter((item) => !item.isRead && item.id)
      .map((item) =>
        updateDoc(doc(db, "notifications", item.id!), {
          isRead: true,
        }),
      ),
  );
}

export async function getUnreadNotificationsCount(userId: string) {
  const notifications = await getUserNotifications(userId);

  return notifications.filter((item) => !item.isRead).length;
}
