"use client";

import { useState } from "react";
import { Mail, Phone, Send, User } from "lucide-react";

import { createInquiry } from "../lib/inquiryService";
import { getZodErrorMessage, inquirySchema } from "../lib/inquiryValidation";
import type { Property } from "../types/property";

type InquiryFormProps = {
  property: Property;
};

export default function InquiryForm({ property }: InquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!property.id) {
      setErrorMessage("Property ID is missing.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const inquiry = {
      propertyId: property.id,
      propertyTitle: property.title,
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim() || undefined,
      message: String(formData.get("message") || "").trim(),
      status: "new" as const,
    };

    try {
      const validatedInquiry = inquirySchema.parse(inquiry);

      await createInquiry(validatedInquiry);

      form.reset();
      setSuccess(true);
    } catch (error) {
      console.error(error);

      const message = getZodErrorMessage(error);

      if (message !== "Something went wrong.") {
        setErrorMessage(message);
      } else {
        setErrorMessage("Could not send your message.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
      <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
        <User size={18} className="text-gray-400" />

        <input
          name="name"
          required
          placeholder="Your name"
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
        <Mail size={18} className="text-gray-400" />

        <input
          name="email"
          required
          type="email"
          placeholder="Your email"
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
        <Phone size={18} className="text-gray-400" />

        <input
          name="phone"
          placeholder="Phone number, optional"
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <textarea
        name="message"
        required
        rows={5}
        placeholder="Write your message..."
        defaultValue={`Hi, I am interested in this property: ${property.title}`}
        className="w-full rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-900 placeholder:text-gray-400"
      />

      {errorMessage && (
        <div className="whitespace-pre-line rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-600">
          {errorMessage}
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          Your message was sent successfully.
        </div>
      )}

      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-black text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        <Send size={18} />
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
