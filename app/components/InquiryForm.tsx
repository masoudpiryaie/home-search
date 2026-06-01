"use client";

import { useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { getLocalizedText } from "@/app/lib/localizedText";
import { createInquiry } from "@/app/lib/services/inquiryService";
import type { Locale } from "@/app/lib/i18n";
import type { Property } from "@/app/types/property";

type InquiryFormProps = {
  property: Property;
  locale?: Locale;
};

function getLabels(locale: Locale = "en") {
  if (locale === "fa") {
    return {
      title: "ارسال پیام",
      name: "نام شما",
      email: "ایمیل",
      phone: "شماره تماس",
      message: "پیام شما",
      visitTime: "زمان پیشنهادی بازدید",
      send: "ارسال پیام",
      sending: "در حال ارسال...",
      success: "پیام شما با موفقیت ارسال شد.",
      missingProperty: "شناسه آگهی پیدا نشد.",
      required: "لطفاً نام، ایمیل و پیام را وارد کنید.",
      error: "ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید.",
      defaultMessage: "سلام، من به این ملک علاقه‌مند هستم.",
    };
  }

  if (locale === "de") {
    return {
      title: "Nachricht senden",
      name: "Dein Name",
      email: "E-Mail",
      phone: "Telefonnummer",
      message: "Deine Nachricht",
      visitTime: "Gewünschte Besichtigungszeit",
      send: "Nachricht senden",
      sending: "Wird gesendet...",
      success: "Deine Nachricht wurde erfolgreich gesendet.",
      missingProperty: "Property ID wurde nicht gefunden.",
      required: "Bitte gib Name, E-Mail und Nachricht ein.",
      error: "Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.",
      defaultMessage: "Hallo, ich interessiere mich für diese Immobilie.",
    };
  }

  return {
    title: "Send message",
    name: "Your name",
    email: "Email",
    phone: "Phone number",
    message: "Your message",
    visitTime: "Preferred visit time",
    send: "Send message",
    sending: "Sending...",
    success: "Your message has been sent successfully.",
    missingProperty: "Property ID was not found.",
    required: "Please enter your name, email, and message.",
    error: "Could not send message. Please try again.",
    defaultMessage: "Hello, I am interested in this property.",
  };
}

export default function InquiryForm({
  property,
  locale = "en",
}: InquiryFormProps) {
  const { user } = useAuth();
  const labels = getLabels(locale);

  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [preferredVisitTime, setPreferredVisitTime] = useState("");
  const [message, setMessage] = useState(labels.defaultMessage);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatusMessage("");
    setErrorMessage("");

    if (!property.id) {
      setErrorMessage(labels.missingProperty);
      return;
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage(labels.required);
      return;
    }

    setLoading(true);

    try {
      const title = getLocalizedText(property.title, locale);
      const propertyLocation = [
        property.location?.city,
        property.location?.district,
      ]
        .filter(Boolean)
        .join(", ");

      await createInquiry({
        propertyId: property.id,
        fromUserId: user?.uid,
        toUserId: property.submittedBy?.uid || property.createdBy,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
        preferredVisitTime: preferredVisitTime.trim() || undefined,
        propertyTitle: title,
        propertyImage: property.images?.[0]?.url,
        propertyLocation,
        propertySlug: property.slug,
      });

      setStatusMessage(labels.success);
      setMessage(labels.defaultMessage);
      setPreferredVisitTime("");
    } catch (error) {
      console.error(error);
      setErrorMessage(labels.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--color-text)]">
          <MessageCircle size={18} className="text-[var(--color-primary)]" />
          {labels.title}
        </div>

        <div className="grid gap-3">
          <Input
            value={name}
            onChange={setName}
            placeholder={labels.name}
            required
          />

          <Input
            value={email}
            onChange={setEmail}
            placeholder={labels.email}
            type="email"
            required
          />

          <Input value={phone} onChange={setPhone} placeholder={labels.phone} />

          <Input
            value={preferredVisitTime}
            onChange={setPreferredVisitTime}
            placeholder={labels.visitTime}
          />

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={labels.message}
            rows={4}
            required
            className="w-full rounded-[16px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm placeholder:text-gray-400"
          />
        </div>

        {statusMessage && (
          <p className="mt-3 rounded-[14px] bg-[var(--color-primary-soft)] px-3 py-2 text-sm font-bold leading-6 text-[var(--color-primary)]">
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-3 rounded-[14px] bg-red-50 px-3 py-2 text-sm font-bold leading-6 text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}

          {loading ? labels.sending : labels.send}
        </button>
      </div>
    </form>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      type={type}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-[16px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text)] shadow-sm placeholder:text-gray-400"
    />
  );
}
