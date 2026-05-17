export type InquiryStatus = "new" | "read" | "closed";

export type Inquiry = {
  id?: string;

  propertyId: string;
  propertyTitle: string;

  name: string;
  email: string;
  phone?: string;
  message: string;

  status: InquiryStatus;

  createdAt?: unknown;
};
