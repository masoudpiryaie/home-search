import type {
  ListingType,
  LocalizedText,
  Property,
  PropertyStatus,
  PropertyType,
} from "@/app/types/property";
import { FirestoreDate } from "../firestoreHelpers";

export type ProfessionalPropertyStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "expired"
  | "rented"
  | "sold"
  | "archived"
  | "deleted";

export type ProfessionalPropertyType =
  | "apartment"
  | "house"
  | "room"
  | "studio"
  | "office"
  | "land"
  | "commercial";

export type ProfessionalPropertyPurpose = "rent" | "sale" | "short_term";

export type ProfessionalProperty = {
  id?: string;
  slug?: string;

  title: string | LocalizedText;
  description: string | LocalizedText;

  type: ProfessionalPropertyType;
  purpose: ProfessionalPropertyPurpose;
  status: ProfessionalPropertyStatus;

  price: number;
  currency: "EUR";
  deposit?: number;
  serviceCharge?: number;
  commission?: number;

  sizeSqm: number;
  rooms: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  availableFrom?: string;

  address: {
    country: string;
    city: string;
    district?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    fullAddress?: string;
  };

  location: {
    lat?: number;
    lng?: number;
    geohash?: string;
  };

  features: {
    balcony: boolean;
    elevator: boolean;
    parking: boolean;
    garden: boolean;
    furnished: boolean;
    petsAllowed: boolean;
    basement: boolean;
    washingMachine: boolean;
    dishwasher: boolean;
    airConditioning: boolean;
    accessible: boolean;
  };

  ownerId?: string;
  agencyId?: string;

  contact: {
    name: string;
    phone?: string;
    email: string;
    showPhone?: boolean;
    preferredContact?: "email" | "phone" | "message";
  };

  imageUrls: string[];
  mainImageUrl?: string;

  stats: {
    views: number;
    favorites: number;
    inquiries: number;
  };

  moderation?: {
    reviewedBy?: string;
    reviewedAt?: FirestoreDate;
    rejectionReason?: string;
  };

  isFeatured: boolean;
  featuredUntil?: FirestoreDate;

  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
  publishedAt?: FirestoreDate;
  expiresAt?: FirestoreDate;
  deletedAt?: FirestoreDate;
};

export function toProfessionalStatus(
  status?: PropertyStatus | ProfessionalPropertyStatus,
): ProfessionalPropertyStatus {
  if (status === "active") return "published";
  if (status === "pending") return "pending_review";
  if (status === "inactive") return "archived";

  if (
    status === "draft" ||
    status === "rejected" ||
    status === "rented" ||
    status === "sold"
  ) {
    return status;
  }

  if (
    status === "pending_review" ||
    status === "published" ||
    status === "expired" ||
    status === "archived" ||
    status === "deleted"
  ) {
    return status;
  }

  return "draft";
}

export function toLegacyStatus(
  status?: ProfessionalPropertyStatus | PropertyStatus,
): PropertyStatus {
  if (status === "published") return "active";
  if (status === "pending_review") return "pending";
  if (status === "archived") return "inactive";
  if (status === "deleted") return "inactive";

  if (
    status === "draft" ||
    status === "active" ||
    status === "pending" ||
    status === "inactive" ||
    status === "rejected" ||
    status === "rented" ||
    status === "sold"
  ) {
    return status;
  }

  return "draft";
}

export function toProfessionalPurpose(
  listingType?: ListingType | ProfessionalPropertyPurpose,
): ProfessionalPropertyPurpose {
  if (listingType === "sale") return "sale";
  if (listingType === "short_term") return "short_term";

  return "rent";
}

export function toLegacyListingType(
  purpose?: ProfessionalPropertyPurpose | ListingType,
): ListingType {
  if (purpose === "sale") return "sale";
  return "rent";
}

export function toProfessionalType(
  propertyType?: PropertyType | ProfessionalPropertyType,
): ProfessionalPropertyType {
  if (
    propertyType === "apartment" ||
    propertyType === "house" ||
    propertyType === "studio" ||
    propertyType === "room" ||
    propertyType === "office" ||
    propertyType === "land" ||
    propertyType === "commercial"
  ) {
    return propertyType;
  }

  return "apartment";
}

export function toLegacyPropertyType(
  type?: ProfessionalPropertyType | PropertyType,
): PropertyType {
  if (
    type === "apartment" ||
    type === "house" ||
    type === "studio" ||
    type === "room"
  ) {
    return type;
  }

  return "apartment";
}

export function mapLegacyPropertyToProfessional(
  property: Property,
): ProfessionalProperty {
  const imageUrls = property.images?.map((image) => image.url) || [];
  const mainImageUrl = imageUrls[0];

  return {
    id: property.id,
    slug: property.slug,

    title: property.title,
    description: property.description,

    type: toProfessionalType(property.propertyType),
    purpose: toProfessionalPurpose(property.listingType),
    status: toProfessionalStatus(property.status),

    price: property.price || 0,
    currency: property.currency || "EUR",
    deposit: property.rentDetails?.deposit,
    serviceCharge: property.rentDetails?.utilities,

    sizeSqm: property.details?.area || 0,
    rooms: property.details?.rooms || 0,
    bedrooms: property.details?.bedrooms,
    bathrooms: property.details?.bathrooms,
    floor: property.details?.floor,
    totalFloors: property.details?.totalFloors,
    yearBuilt: property.details?.yearBuilt,
    availableFrom: property.rentDetails?.availableFrom,

    address: {
      country: property.location?.country || "Germany",
      city: property.location?.city || "",
      district: property.location?.district,
      street: property.location?.street,
      postalCode: property.location?.postalCode,
      fullAddress: [
        property.location?.street,
        property.location?.postalCode,
        property.location?.district,
        property.location?.city,
        property.location?.country,
      ]
        .filter(Boolean)
        .join(", "),
    },

    location: {
      lat: property.location?.lat,
      lng: property.location?.lng,
    },

    features: {
      balcony: Boolean(property.features?.balcony),
      elevator: Boolean(property.features?.elevator),
      parking: Boolean(property.features?.parking),
      garden: Boolean(property.features?.garden),
      furnished: Boolean(property.features?.furnished),
      petsAllowed: Boolean(property.features?.petsAllowed),
      basement: Boolean(property.features?.cellar),
      washingMachine: false,
      dishwasher: Boolean(property.features?.fittedKitchen),
      airConditioning: false,
      accessible: false,
    },

    ownerId: property.submittedBy?.uid || property.createdBy,
    agencyId: undefined,

    contact: {
      name: property.contact?.name || "",
      phone: property.contact?.phone,
      email: property.contact?.email || "",
      showPhone: true,
      preferredContact: "message",
    },

    imageUrls,
    mainImageUrl,

    stats: {
      views: property.viewCount || 0,
      favorites: 0,
      inquiries: 0,
    },

    moderation: {
      reviewedBy: property.review?.reviewedBy,
      reviewedAt: property.review?.reviewedAt as FirestoreDate,
      rejectionReason: property.review?.note,
    },

    isFeatured: false,

    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    publishedAt:
      property.status === "active"
        ? (property.review?.reviewedAt as FirestoreDate)
        : undefined,
  };
}

export function mapProfessionalPropertyToLegacy(
  property: ProfessionalProperty,
): Property {
  return {
    id: property.id,
    slug: property.slug,

    title: property.title,
    description: property.description,

    listingType: toLegacyListingType(property.purpose),
    propertyType: toLegacyPropertyType(property.type),
    status: toLegacyStatus(property.status),

    price: property.price || 0,
    currency: property.currency || "EUR",

    location: {
      country: property.address?.country || "Germany",
      city: property.address?.city || "",
      district: property.address?.district,
      street: property.address?.street,
      postalCode: property.address?.postalCode,
      lat: property.location?.lat,
      lng: property.location?.lng,
    },

    details: {
      rooms: property.rooms || 0,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.sizeSqm || 0,
      floor: property.floor,
      totalFloors: property.totalFloors,
      yearBuilt: property.yearBuilt,
    },

    rentDetails:
      property.purpose === "rent"
        ? {
            deposit: property.deposit,
            utilities: property.serviceCharge,
            availableFrom: property.availableFrom,
          }
        : undefined,

    saleDetails:
      property.purpose === "sale"
        ? {
            purchasePrice: property.price,
            pricePerSqm:
              property.sizeSqm > 0 ? property.price / property.sizeSqm : 0,
          }
        : undefined,

    features: {
      balcony: Boolean(property.features?.balcony),
      garden: Boolean(property.features?.garden),
      elevator: Boolean(property.features?.elevator),
      parking: Boolean(property.features?.parking),
      furnished: Boolean(property.features?.furnished),
      petsAllowed: Boolean(property.features?.petsAllowed),
      cellar: Boolean(property.features?.basement),
      fittedKitchen: Boolean(property.features?.dishwasher),
    },

    images:
      property.imageUrls?.map((url, index) => ({
        url,
        publicId: "",
      })) || [],

    contact: {
      name: property.contact?.name || "",
      phone: property.contact?.phone,
      email: property.contact?.email || "",
    },

    submittedBy: property.ownerId
      ? {
          uid: property.ownerId,
        }
      : undefined,

    review: {
      reviewedBy: property.moderation?.reviewedBy,
      reviewedAt: property.moderation?.reviewedAt,
      note: property.moderation?.rejectionReason,
    },

    viewCount: property.stats?.views || 0,

    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
}
