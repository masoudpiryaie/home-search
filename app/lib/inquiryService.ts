import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { Inquiry } from "../types/inquiry";
import { cleanObject } from "./cleanObject";

const inquiriesRef = collection(db, "inquiries");

export async function createInquiry(
  inquiry: Omit<Inquiry, "id" | "createdAt">,
) {
  const cleanedInquiry = cleanObject(inquiry);

  return addDoc(inquiriesRef, {
    ...cleanedInquiry,
    createdAt: serverTimestamp(),
  });
}

export async function getInquiries() {
  const q = query(inquiriesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as Inquiry[];
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: Inquiry["status"],
) {
  const ref = doc(db, "inquiries", inquiryId);

  return updateDoc(ref, {
    status,
  });
}
