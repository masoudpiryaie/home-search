import type { PropertyImage } from "@/app/types/property";

export type MarketItemStatus = "active" | "inactive" | "sold" | "deleted";

export type MarketItem = {
  id?: string;

  title: string;
  description?: string;

  address: string;
  price: number;
  quantity: number;

  image?: PropertyImage;

  availableAt?: string;

  contactName: string;
  contactPhone?: string;
  contactEmail?: string;

  status: MarketItemStatus;

  createdBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};
