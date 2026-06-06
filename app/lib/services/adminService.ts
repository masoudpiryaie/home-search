import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  addDoc,
  FieldValue,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";
import { cleanObject, mapDoc, sortByNewest } from "@/app/lib/firestoreHelpers";
import type { FirestoreDate } from "@/app/lib/firestoreHelpers";
import { createNotification } from "@/app/lib/services/notificationService";
import type { Property } from "@/app/types/property";
import { sendPushToUser } from "@/app/lib/server/pushService";
import { sendEmail } from "@/app/lib/server/emailService";
export type AdminLog = {
  id?: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  createdAt?: FirestoreDate;
};

type AdminLogInput = Omit<AdminLog, "createdAt"> & {
  createdAt?: FirestoreDate | FieldValue;
};

export type DashboardStats = {
  totalProperties: number;
  pendingProperties: number;
  publishedProperties: number;
  rejectedProperties: number;
  totalInquiries: number;
  totalUsers: number;
};

const propertiesRef = collection(db, "properties");
const inquiriesRef = collection(db, "inquiries");
const usersRef = collection(db, "users");
const adminLogsRef = collection(db, "adminLogs");

/**
 * Admin service keeps moderation and admin-only database actions outside UI.
 */
export async function createAdminLog(
  logInput: Omit<AdminLog, "id" | "createdAt">,
) {
  const log: AdminLogInput = {
    ...logInput,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(adminLogsRef, cleanObject(log));

  return docRef.id;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    propertiesSnapshot,
    pendingSnapshot,
    publishedSnapshot,
    rejectedSnapshot,
    inquiriesSnapshot,
    usersSnapshot,
  ] = await Promise.all([
    getDocs(propertiesRef),
    getDocs(
      query(
        propertiesRef,
        where("status", "in", ["pending", "pending_review"]),
      ),
    ),
    getDocs(
      query(propertiesRef, where("status", "in", ["active", "published"])),
    ),
    getDocs(query(propertiesRef, where("status", "==", "rejected"))),
    getDocs(inquiriesRef),
    getDocs(usersRef),
  ]);

  return {
    totalProperties: propertiesSnapshot.size,
    pendingProperties: pendingSnapshot.size,
    publishedProperties: publishedSnapshot.size,
    rejectedProperties: rejectedSnapshot.size,
    totalInquiries: inquiriesSnapshot.size,
    totalUsers: usersSnapshot.size,
  };
}

export async function getPendingProperties() {
  const pendingQuery = query(
    propertiesRef,
    where("status", "in", ["pending", "pending_review"]),
  );

  const snapshot = await getDocs(pendingQuery);

  return sortByNewest(snapshot.docs.map((item) => mapDoc<Property>(item)));
}

export async function approveProperty(property: Property, adminId: string) {
  if (!property.id) {
    throw new Error("Property id is required.");
  }

  const nextStatus = "active";

  await updateDoc(doc(db, "properties", property.id), {
    status: nextStatus,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    review: {
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
    },
    moderation: {
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
    },
  });

  await createAdminLog({
    adminId,
    action: "approve_property",
    targetType: "property",
    targetId: property.id,
    before: {
      status: property.status,
    },
    after: {
      status: nextStatus,
    },
  });

  const ownerId = property.submittedBy?.uid || property.createdBy;

  if (ownerId) {
    await createNotification({
      userId: ownerId,
      type: "listing_approved",
      title: "Listing approved",
      body: "Your property listing has been approved and published.",
      data: {
        propertyId: property.id,
        propertySlug: property.slug,
      },
    });
  }
}

export async function rejectProperty(
  property: Property,
  adminId: string,
  rejectionReason: string,
) {
  if (!property.id) {
    throw new Error("Property id is required.");
  }

  await updateDoc(doc(db, "properties", property.id), {
    status: "rejected",
    updatedAt: serverTimestamp(),
    review: {
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
      note: rejectionReason,
    },
    moderation: {
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
      rejectionReason,
    },
  });

  await createAdminLog({
    adminId,
    action: "reject_property",
    targetType: "property",
    targetId: property.id,
    before: {
      status: property.status,
    },
    after: {
      status: "rejected",
      rejectionReason,
    },
  });

  const ownerId = property.submittedBy?.uid || property.createdBy;

  if (ownerId) {
    await createNotification({
      userId: ownerId,
      type: "listing_rejected",
      title: "Listing rejected",
      body: rejectionReason || "Your property listing was rejected.",
      data: {
        propertyId: property.id,
        propertySlug: property.slug,
        rejectionReason,
      },
    });
  }
}

export async function blockUser(userId: string, adminId: string) {
  await updateDoc(doc(db, "users", userId), {
    status: "blocked",
    updatedAt: serverTimestamp(),
  });

  await createAdminLog({
    adminId,
    action: "block_user",
    targetType: "user",
    targetId: userId,
    before: null,
    after: {
      status: "blocked",
    },
  });
}

export async function getAdminLogs() {
  const snapshot = await getDocs(adminLogsRef);

  return sortByNewest(snapshot.docs.map((item) => mapDoc<AdminLog>(item)));
}

export async function updatePropertyStatusByAdmin({
  property,
  adminId,
  status,
  note,
}: {
  property: Property;
  adminId: string;
  status: Property["status"];
  note?: string;
}) {
  if (!property.id) {
    throw new Error("Property id is required.");
  }

  await updateDoc(
    doc(db, "properties", property.id),
    cleanObject({
      status,
      updatedAt: serverTimestamp(),
      review:
        status === "active" || status === "rejected"
          ? {
              reviewedBy: adminId,
              reviewedAt: serverTimestamp(),
              note: note?.trim() || undefined,
            }
          : undefined,
      moderation:
        status === "active" || status === "rejected"
          ? {
              reviewedBy: adminId,
              reviewedAt: serverTimestamp(),
              rejectionReason:
                status === "rejected" ? note?.trim() || undefined : undefined,
            }
          : undefined,
      publishedAt: status === "active" ? serverTimestamp() : undefined,
    }),
  );

  await createAdminLog({
    adminId,
    action: "update_property_status",
    targetType: "property",
    targetId: property.id,
    before: {
      status: property.status,
    },
    after: {
      status,
      note: note?.trim() || "",
    },
  });
}
