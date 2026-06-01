import type {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";

export type FirestoreDate =
  | Timestamp
  | {
      seconds?: number;
      nanoseconds?: number;
      toDate?: () => Date;
    }
  | Date
  | string
  | number
  | null
  | undefined;

export function cleanObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanObject(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, cleanObject(item)]),
    ) as T;
  }

  return value;
}

export function toDate(value: FirestoreDate) {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }

  return null;
}

export function toMillis(value: FirestoreDate) {
  const date = toDate(value);
  return date ? date.getTime() : 0;
}

export function mapDoc<T>(
  docItem: QueryDocumentSnapshot<DocumentData>,
): T & { id: string } {
  return {
    id: docItem.id,
    ...docItem.data(),
  } as T & { id: string };
}

export function sortByNewest<T extends { createdAt?: FirestoreDate }>(
  items: T[],
) {
  return [...items].sort(
    (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt),
  );
}
