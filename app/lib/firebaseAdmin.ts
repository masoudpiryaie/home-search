import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey() {
  const base64Key = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;

  if (base64Key) {
    return Buffer.from(base64Key, "base64").toString("utf8");
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!privateKey) {
    return "";
  }

  return privateKey.replace(/\\n/g, "\n");
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = getPrivateKey();

export const isFirebaseAdminConfigured = Boolean(
  projectId && clientEmail && privateKey,
);

if (!getApps().length && isFirebaseAdminConfigured) {
  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
  }
}

export const adminDb = getApps().length ? getFirestore() : null;
