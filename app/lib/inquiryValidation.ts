import { z } from "zod";

export const inquirySchema = z.object({
  propertyId: z.string().min(1, "Property ID is missing."),
  propertyTitle: z.string().min(1, "Property title is missing."),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name is too long."),

  email: z.string().email("Email is not valid."),

  phone: z.string().max(40, "Phone number is too long.").optional(),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(1500, "Message is too long."),

  status: z.enum(["new", "read", "closed"]),
});

export function getZodErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join("\n");
  }

  return "Something went wrong.";
}
