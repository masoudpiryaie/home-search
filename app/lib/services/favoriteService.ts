// import {
//   collection,
//   deleteDoc,
//   doc,
//   getDocs,
//   increment,
//   query,
//   serverTimestamp,
//   setDoc,
//   where,
// } from "firebase/firestore";

// import type { FieldValue } from "firebase/firestore";

// import { db } from "@/app/lib/firebase";
// import { cleanObject, mapDoc, sortByNewest } from "@/app/lib/firestoreHelpers";
// import type { FirestoreDate } from "@/app/lib/firestoreHelpers";

// export type Favorite = {
//   id?: string;
//   userId: string;
//   propertyId: string;
//   createdAt?: FirestoreDate;
// };

// type FavoriteInput = Omit<Favorite, "createdAt"> & {
//   createdAt?: FirestoreDate | FieldValue;
// };

// const favoritesRef = collection(db, "favorites");

// function createFavoriteId(userId: string, propertyId: string) {
//   return `${userId}_${propertyId}`;
// }

// /**
//  * Favorites are handled only here.
//  * If we migrate away from Firebase later, UI components should not change much.
//  */
// export async function addFavorite(userId: string, propertyId: string) {
//   const favoriteId = createFavoriteId(userId, propertyId);
//   const favoriteRef = doc(db, "favorites", favoriteId);

//   const favorite: FavoriteInput = {
//     id: favoriteId,
//     userId,
//     propertyId,
//     createdAt: serverTimestamp(),
//   };

//   await setDoc(favoriteRef, cleanObject(favorite));

//   try {
//     await incrementPropertyFavorites(propertyId, 1);
//   } catch (error) {
//     console.error("Could not increment favorite count:", error);
//   }

//   return favoriteId;
// }

// export async function removeFavorite(userId: string, propertyId: string) {
//   const favoriteId = createFavoriteId(userId, propertyId);

//   await deleteDoc(doc(db, "favorites", favoriteId));

//   try {
//     await incrementPropertyFavorites(propertyId, -1);
//   } catch (error) {
//     console.error("Could not decrement favorite count:", error);
//   }
// }

// export async function isFavorite(userId: string, propertyId: string) {
//   const favoriteId = createFavoriteId(userId, propertyId);

//   const favoriteQuery = query(
//     favoritesRef,
//     where("userId", "==", userId),
//     where("propertyId", "==", propertyId),
//   );

//   const snapshot = await getDocs(favoriteQuery);

//   if (!snapshot.empty) {
//     return true;
//   }

//   // fallback for deterministic id
//   const directQuery = query(favoritesRef, where("__name__", "==", favoriteId));

//   const directSnapshot = await getDocs(directQuery);

//   return !directSnapshot.empty;
// }

// export async function getUserFavorites(userId: string) {
//   const favoritesQuery = query(favoritesRef, where("userId", "==", userId));
//   const snapshot = await getDocs(favoritesQuery);

//   const favorites = snapshot.docs.map((item) => mapDoc<Favorite>(item));

//   return sortByNewest(favorites);
// }

// async function incrementPropertyFavorites(propertyId: string, value: 1 | -1) {
//   const { updateDoc } = await import("firebase/firestore");

//   await updateDoc(doc(db, "properties", propertyId), {
//     "stats.favorites": increment(value),
//     updatedAt: serverTimestamp(),
//   });
// }
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";
import {
  cleanObject,
  FirestoreDate,
  mapDoc,
  sortByNewest,
} from "@/app/lib/firestoreHelpers";
import type { FieldValue } from "firebase/firestore";

export type Favorite = {
  id?: string;
  userId: string;
  propertyId: string;
  createdAt?: FirestoreDate;
};

type FavoriteInput = Omit<Favorite, "createdAt"> & {
  createdAt?: FirestoreDate | FieldValue;
};

const favoritesRef = collection(db, "favorites");

function createFavoriteId(userId: string, propertyId: string) {
  return `${userId}_${propertyId}`;
}

export async function addFavorite(userId: string, propertyId: string) {
  const favoriteId = createFavoriteId(userId, propertyId);
  const favoriteRef = doc(db, "favorites", favoriteId);

  const favorite: FavoriteInput = {
    id: favoriteId,
    userId,
    propertyId,
    createdAt: serverTimestamp(),
  };

  await setDoc(favoriteRef, cleanObject(favorite));

  try {
    await updateDoc(doc(db, "properties", propertyId), {
      "stats.favorites": increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Could not increment favorite count:", error);
  }

  return favoriteId;
}

export async function removeFavorite(userId: string, propertyId: string) {
  const favoriteId = createFavoriteId(userId, propertyId);

  await deleteDoc(doc(db, "favorites", favoriteId));

  try {
    await updateDoc(doc(db, "properties", propertyId), {
      "stats.favorites": increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Could not decrement favorite count:", error);
  }
}

export async function isFavorite(userId: string, propertyId: string) {
  const favoriteQuery = query(
    favoritesRef,
    where("userId", "==", userId),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(favoriteQuery);

  return !snapshot.empty;
}

export async function getUserFavorites(userId: string) {
  const favoritesQuery = query(favoritesRef, where("userId", "==", userId));
  const snapshot = await getDocs(favoritesQuery);

  return sortByNewest(snapshot.docs.map((item) => mapDoc<Favorite>(item)));
}
