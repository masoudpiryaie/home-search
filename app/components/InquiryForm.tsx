"use client";

import { useState } from "react";
import { Mail, Phone, Send, User } from "lucide-react";

import { createInquiry } from "../lib/inquiryService";
import { getZodErrorMessage, inquirySchema } from "../lib/inquiryValidation";
import { type Locale } from "../lib/i18n";
import type { Property } from "../types/property";
import { getLocalizedText } from "../lib/localizedText";
type InquiryFormProps = {
  property: Property;
  locale?: Locale;
};

export default function InquiryForm({
  property,
  locale = "en",
}: InquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const labels = getLabels(locale);
  const propertyTitle = getLocalizedText(property.title, locale);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!property.id) {
      setErrorMessage(labels.propertyIdMissing);
      return;
    }

    setLoading(true);
    setSuccess(false);
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const inquiry = {
      propertyId: property.id,
      propertyTitle,
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
        setErrorMessage(labels.couldNotSend);
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
          placeholder={labels.name}
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
        <Mail size={18} className="text-gray-400" />

        <input
          name="email"
          required
          type="email"
          placeholder={labels.email}
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
        <Phone size={18} className="text-gray-400" />

        <input
          name="phone"
          placeholder={labels.phone}
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <textarea
        name="message"
        required
        rows={5}
        placeholder={labels.messagePlaceholder}
        defaultValue={labels.defaultMessage(propertyTitle)}
        className="w-full rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-900 placeholder:text-gray-400"
      />

      {errorMessage && (
        <div className="whitespace-pre-line rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-600">
          {errorMessage}
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {labels.success}
        </div>
      )}

      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-black text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        <Send size={18} />
        {loading ? labels.sending : labels.send}
      </button>
    </form>
  );
}

function getLabels(locale: Locale) {
  if (locale === "fa") {
    return {
      name: "نام شما",
      email: "ایمیل شما",
      phone: "شماره تماس، اختیاری",
      messagePlaceholder: "پیام خود را بنویسید...",
      send: "ارسال پیام",
      sending: "در حال ارسال...",
      success: "پیام شما با موفقیت ارسال شد.",
      couldNotSend: "امکان ارسال پیام وجود ندارد.",
      propertyIdMissing: "شناسه آگهی وجود ندارد.",
      defaultMessage: (title: string) =>
        `سلام، من به این آگهی علاقه‌مند هستم: ${title}`,
    };
  }

  if (locale === "de") {
    return {
      name: "Dein Name",
      email: "Deine E-Mail",
      phone: "Telefonnummer, optional",
      messagePlaceholder: "Schreibe deine Nachricht...",
      send: "Nachricht senden",
      sending: "Wird gesendet...",
      success: "Deine Nachricht wurde erfolgreich gesendet.",
      couldNotSend: "Die Nachricht konnte nicht gesendet werden.",
      propertyIdMissing: "Immobilien-ID fehlt.",
      defaultMessage: (title: string) =>
        `Hallo, ich interessiere mich für diese Immobilie: ${title}`,
    };
  }

  return {
    name: "Your name",
    email: "Your email",
    phone: "Phone number, optional",
    messagePlaceholder: "Write your message...",
    send: "Send message",
    sending: "Sending...",
    success: "Your message was sent successfully.",
    couldNotSend: "Could not send your message.",
    propertyIdMissing: "Property ID is missing.",
    defaultMessage: (title: string) =>
      `Hi, I am interested in this property: ${title}`,
  };
}
