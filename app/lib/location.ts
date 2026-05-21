import type { Property } from "@/app/types/property";

export type LocationInput = {
  country?: string;
  city?: string;
  district?: string;
  street?: string;
  postalCode?: string;
};

export function buildAddress(location: LocationInput) {
  return [
    location.street,
    location.postalCode,
    location.district,
    location.city,
    location.country || "Germany",
  ]
    .filter(Boolean)
    .join(", ");
}

export function getPropertyAddress(property: Property) {
  return buildAddress(property.location);
}
