export type Locale = "en" | "fa" | "de";

export type LocalizedText = {
  en: string;
  fa: string;
  de: string;
};
export type ListingType = "rent" | "sale";
export type PropertyStatus =
  | "pending"
  | "draft"
  | "active"
  | "inactive"
  | "rejected"
  | "rented"
  | "sold";

export type PropertyType = "apartment" | "house" | "studio" | "room";

export type PropertyImage = {
  url: string;
  publicId: string;
};

export type Property = {
  id?: string;
  title: string;
  description: string;

  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;

  price: number;
  currency: "EUR";

  location: {
    country: string;
    city: string;
    district?: string;
    street?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
  };

  details: {
    rooms: number;
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    floor?: number;
    totalFloors?: number;
    yearBuilt?: number;
  };

  rentDetails?: {
    coldRent?: number;
    warmRent?: number;
    utilities?: number;
    deposit?: number;
    availableFrom?: string;
  };

  saleDetails?: {
    purchasePrice?: number;
    pricePerSqm?: number;
  };

  features: {
    balcony: boolean;
    garden: boolean;
    elevator: boolean;
    parking: boolean;
    furnished: boolean;
    petsAllowed: boolean;
    cellar: boolean;
    fittedKitchen: boolean;
  };

  images: PropertyImage[];

  contact: {
    name: string;
    phone?: string;
    email: string;
  };

  createdBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;

  submittedBy?: {
    uid?: string;
    name?: string;
    email?: string;
  };

  review?: {
    reviewedBy?: string;
    reviewedAt?: unknown;
    note?: string;
  };
};
