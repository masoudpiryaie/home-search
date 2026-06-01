import { getLocalizedText } from "@/app/lib/localizedText";
import type { Property } from "@/app/types/property";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createShortCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  crypto.getRandomValues(new Uint32Array(length)).forEach((value) => {
    result += chars[value % chars.length];
  });

  return result;
}

export function createPropertySlugFromText({
  title,
  city,
  district,
}: {
  title: string;
  city?: string;
  district?: string;
}) {
  const baseSlug = normalizeText(
    [title, city, district].filter(Boolean).join(" "),
  );
  const shortCode = createShortCode();

  if (!baseSlug) {
    return `property-${shortCode}`;
  }

  return `${baseSlug}-${shortCode}`;
}

export function createPropertySlug(property: Property, id?: string) {
  const englishTitle = getLocalizedText(property.title, "en");

  return createPropertySlugFromText({
    title: englishTitle,
    city: property.location?.city,
    district: property.location?.district,
  });
}
