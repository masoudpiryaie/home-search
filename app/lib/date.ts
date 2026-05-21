import type { Locale } from "@/app/lib/i18n";

type FirestoreDate =
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

export function toDate(value: FirestoreDate) {
  if (!value) {
    return null;
  }

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

export function formatListingDate(value: FirestoreDate, locale: Locale) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  const localeMap: Record<Locale, string> = {
    en: "en-US",
    fa: "fa-IR",
    de: "de-DE",
  };

  return new Intl.DateTimeFormat(localeMap[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatPostedAgo(value: FirestoreDate, locale: Locale) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (locale === "fa") {
    if (diffDays <= 0) return "امروز  ";
    if (diffDays === 1) return "دیروز  ";
    return `${diffDays} روز پیش  `;
  }

  if (locale === "de") {
    if (diffDays <= 0) return "Heute veröffentlicht";
    if (diffDays === 1) return "Gestern veröffentlicht";
    return `Vor ${diffDays} Tagen veröffentlicht`;
  }

  if (diffDays <= 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  return `Posted ${diffDays} days ago`;
}
