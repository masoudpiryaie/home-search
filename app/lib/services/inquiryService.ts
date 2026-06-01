import {
  addDoc,
  collection,
  doc,
  getDocs,
  deleteDoc,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import type { FieldValue } from "firebase/firestore";

import { db } from "@/app/lib/firebase";
import { cleanObject, mapDoc, sortByNewest } from "@/app/lib/firestoreHelpers";
import type { FirestoreDate } from "@/app/lib/firestoreHelpers";

export type InquiryStatus = "new" | "read" | "replied" | "closed" | "spam";

export type Inquiry = {
  id?: string;
  propertyId: string;

  propertySlug?: string;

  fromUserId?: string;
  toUserId?: string;

  name: string;
  email: string;
  phone?: string;
  message: string;
  preferredVisitTime?: string;

  status: InquiryStatus;

  propertyTitle?: string;
  propertyImage?: string;
  propertyLocation?: string;

  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
};

type InquiryInput = Omit<Inquiry, "createdAt" | "updatedAt"> & {
  createdAt?: FirestoreDate | FieldValue;
  updatedAt?: FirestoreDate | FieldValue;
};

const inquiriesRef = collection(db, "inquiries");

/**
 * Inquiry logic is isolated here.
 * UI should only call service functions, not Firestore directly.
 */
export async function createInquiry(
  inquiryInput: Omit<Inquiry, "id" | "status" | "createdAt" | "updatedAt"> &
    Partial<Pick<Inquiry, "status">>,
) {
  const inquiry: InquiryInput = {
    ...inquiryInput,
    status: inquiryInput.status || "new",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(inquiriesRef, cleanObject(inquiry));

  try {
    await updateDoc(doc(db, "properties", inquiry.propertyId), {
      "stats.inquiries": increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Could not increment inquiry count:", error);
  }

  return docRef.id;
}

export async function getPropertyInquiries(propertyId: string) {
  const inquiriesQuery = query(
    inquiriesRef,
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(inquiriesQuery);

  const inquiries = snapshot.docs.map((item) => mapDoc<Inquiry>(item));

  return sortByNewest(inquiries);
}

export async function getUserInquiries(userId: string) {
  const sentQuery = query(inquiriesRef, where("fromUserId", "==", userId));
  const receivedQuery = query(inquiriesRef, where("toUserId", "==", userId));

  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(sentQuery),
    getDocs(receivedQuery),
  ]);

  const sent = sentSnapshot.docs.map((item) => mapDoc<Inquiry>(item));
  const received = receivedSnapshot.docs.map((item) => mapDoc<Inquiry>(item));

  const unique = new Map<string, Inquiry>();

  [...sent, ...received].forEach((item) => {
    if (item.id) {
      unique.set(item.id, item);
    }
  });

  return sortByNewest([...unique.values()]);
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
) {
  await updateDoc(doc(db, "inquiries", inquiryId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllInquiries() {
  const snapshot = await getDocs(inquiriesRef);

  return sortByNewest(snapshot.docs.map((item) => mapDoc<Inquiry>(item)));
}

export async function deleteInquiry(inquiryId: string) {
  await deleteDoc(doc(db, "inquiries", inquiryId));
}
