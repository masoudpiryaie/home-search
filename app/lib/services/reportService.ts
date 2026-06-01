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

import { db } from "@/app/lib/firebase";
import {
  cleanObject,
  mapDoc,
  sortByNewest,
  type FirestoreDate,
} from "@/app/lib/firestoreHelpers";
export type ReportReason =
  | "scam"
  | "wrong_info"
  | "duplicate"
  | "offensive"
  | "unavailable"
  | "other";

export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

export type PropertyReport = {
  id?: string;
  propertyId: string;
  propertySlug?: string;
  reportedBy?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: FirestoreDate;
  createdAt?: FirestoreDate;
};

const reportsRef = collection(db, "reports");

/**
 * Report logic is isolated here.
 * UI should call this service instead of calling Firestore directly.
 */
export async function reportProperty({
  propertyId,
  propertySlug,
  reportedBy,
  reason,
  description,
}: {
  propertyId: string;
  propertySlug?: string;
  reportedBy?: string;
  reason: ReportReason;
  description?: string;
}) {
  const report: PropertyReport = {
    propertyId,
    propertySlug,
    reportedBy,
    reason,
    description: description?.trim() || undefined,
    status: "open",
    createdAt: serverTimestamp() as FirestoreDate,
  };

  const docRef = await addDoc(reportsRef, cleanObject(report));

  return docRef.id;
}

export async function getReports(status?: ReportStatus) {
  const reportsQuery = status
    ? query(reportsRef, where("status", "==", status))
    : query(reportsRef);

  const snapshot = await getDocs(reportsQuery);

  return sortByNewest(
    snapshot.docs.map((item) => mapDoc<PropertyReport>(item)),
  );
}

export async function getPropertyReports(propertyId: string) {
  const reportsQuery = query(reportsRef, where("propertyId", "==", propertyId));
  const snapshot = await getDocs(reportsQuery);

  return sortByNewest(
    snapshot.docs.map((item) => mapDoc<PropertyReport>(item)),
  );
}

export async function updateReportStatus({
  reportId,
  status,
  reviewedBy,
}: {
  reportId: string;
  status: ReportStatus;
  reviewedBy?: string;
}) {
  await updateDoc(
    doc(db, "reports", reportId),
    cleanObject({
      status,
      reviewedBy,
      reviewedAt: serverTimestamp() as FirestoreDate,
    }),
  );
}
