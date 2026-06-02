import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";
import { cleanObject, mapDoc, sortByNewest } from "@/app/lib/firestoreHelpers";
import type { MarketItem } from "@/app/types/marketItem";

const marketItemsRef = collection(db, "marketItems");

export async function createMarketItem(item: Omit<MarketItem, "id">) {
  const cleanItem = cleanObject({
    ...item,
    status: item.status || "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const docRef = await addDoc(marketItemsRef, cleanItem);

  return docRef.id;
}

export async function getActiveMarketItems() {
  const marketQuery = query(
    marketItemsRef,
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(marketQuery);

  return snapshot.docs.map((item) => mapDoc<MarketItem>(item));
}

export async function getMyMarketItems(userId: string) {
  const marketQuery = query(marketItemsRef, where("createdBy", "==", userId));

  const snapshot = await getDocs(marketQuery);

  return sortByNewest(snapshot.docs.map((item) => mapDoc<MarketItem>(item)));
}

export async function updateMarketItemStatus(
  itemId: string,
  status: MarketItem["status"],
) {
  await updateDoc(doc(db, "marketItems", itemId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
