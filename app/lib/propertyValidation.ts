import { z } from "zod";

export const propertySchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title is too long."),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(3000, "Description is too long."),

  listingType: z.enum(["rent", "sale"]),
  propertyType: z.enum(["apartment", "house", "studio", "room"]),
  status: z.enum([
    "pending",
    "draft",
    "active",
    "inactive",
    "rejected",
    "rented",
    "sold",
  ]),
  price: z.number().positive("Price must be more than 0."),
  currency: z.literal("EUR"),
  location: z.object({
    country: z.string(),
    city: z.string().min(2, "City is required."),
    district: z.string().optional(),
    street: z.string().optional(),
    postalCode: z.string().optional(),
  }),

  details: z.object({
    rooms: z.number().positive("Rooms must be more than 0."),
    bedrooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    area: z.number().positive("Area must be more than 0."),
    floor: z.number().optional(),
    totalFloors: z.number().optional(),
    yearBuilt: z.number().optional(),
  }),

  rentDetails: z
    .object({
      coldRent: z.number().min(0).optional(),
      warmRent: z.number().min(0).optional(),
      utilities: z.number().min(0).optional(),
      deposit: z.number().min(0).optional(),
      availableFrom: z.string().optional(),
    })
    .optional(),

  saleDetails: z
    .object({
      purchasePrice: z.number().min(0).optional(),
      pricePerSqm: z.number().min(0).optional(),
    })
    .optional(),

  features: z.object({
    balcony: z.boolean(),
    garden: z.boolean(),
    elevator: z.boolean(),
    parking: z.boolean(),
    furnished: z.boolean(),
    petsAllowed: z.boolean(),
    cellar: z.boolean(),
    fittedKitchen: z.boolean(),
  }),

  images: z.array(
    z.object({
      url: z.string().url(),
      publicId: z.string(),
    }),
  ),

  contact: z.object({
    name: z.string().min(2, "Contact name is required."),
    email: z.string().email("Contact email is not valid."),
    phone: z.string().optional(),
  }),
  submittedBy: z
    .object({
      uid: z.string().optional(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),

  review: z
    .object({
      reviewedBy: z.string().optional(),
      reviewedAt: z.unknown().optional(),
      note: z.string().optional(),
    })
    .optional(),
});

export function getZodErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join("\n");
  }

  return "Something went wrong.";
}
