"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import type { Locale } from "@/app/lib/i18n";
import {
  reportProperty,
  type ReportReason,
} from "@/app/lib/services/reportService";
import type { Property } from "@/app/types/property";

type ReportPropertyButtonProps = {
  property: Property;
  locale: Locale;
};

function getLabels(locale: Locale) {
  if (locale === "fa") {
    return {
      button: "گزارش آگهی",
      title: "گزارش مشکل آگهی",
      description: "اگر این آگهی مشکل دارد، دلیل آن را انتخاب کن.",
      reason: "دلیل گزارش",
      details: "توضیحات بیشتر",
      submit: "ارسال گزارش",
      sending: "در حال ارسال...",
      success: "گزارش شما ثبت شد.",
      error: "امکان ثبت گزارش وجود ندارد.",
      login: "برای گزارش آگهی بهتر است وارد حساب شوید.",
      close: "بستن",
      reasons: {
        scam: "کلاهبرداری",
        wrong_info: "اطلاعات اشتباه",
        duplicate: "آگهی تکراری",
        offensive: "محتوای نامناسب",
        unavailable: "ملک دیگر موجود نیست",
        other: "سایر",
      },
    };
  }

  if (locale === "de") {
    return {
      button: "Anzeige melden",
      title: "Problem melden",
      description: "Wenn diese Anzeige ein Problem hat, wähle bitte den Grund.",
      reason: "Grund",
      details: "Weitere Details",
      submit: "Melden",
      sending: "Wird gesendet...",
      success: "Deine Meldung wurde gesendet.",
      error: "Meldung konnte nicht gesendet werden.",
      login: "Bitte melde dich an, wenn möglich.",
      close: "Schließen",
      reasons: {
        scam: "Betrug",
        wrong_info: "Falsche Informationen",
        duplicate: "Doppelte Anzeige",
        offensive: "Unangemessener Inhalt",
        unavailable: "Nicht mehr verfügbar",
        other: "Andere",
      },
    };
  }

  return {
    button: "Report listing",
    title: "Report listing problem",
    description: "If this listing has a problem, please choose the reason.",
    reason: "Reason",
    details: "More details",
    submit: "Submit report",
    sending: "Sending...",
    success: "Your report was submitted.",
    error: "Could not submit report.",
    login: "Please log in if possible.",
    close: "Close",
    reasons: {
      scam: "Scam",
      wrong_info: "Wrong information",
      duplicate: "Duplicate listing",
      offensive: "Offensive content",
      unavailable: "No longer available",
      other: "Other",
    },
  };
}

export default function ReportPropertyButton({
  property,
  locale,
}: ReportPropertyButtonProps) {
  const { user } = useAuth();
  const labels = getLabels(locale);

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("wrong_info");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!property.id) return;

    setLoading(true);
    setMessage("");

    try {
      await reportProperty({
        propertyId: property.id,
        propertySlug: property.slug,
        reportedBy: user?.uid,
        reason,
        description,
      });

      setMessage(labels.success);
      setDescription("");
    } catch (error) {
      console.error(error);
      setMessage(labels.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMessage("");
        }}
        className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
      >
        <AlertTriangle size={15} />
        {labels.button}
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm md:items-center md:p-6">
          <div className="w-full max-w-lg rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-shell)] md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[var(--color-text)]">
                  {labels.title}
                </h2>

                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-muted)]">
                  {labels.description}
                </p>

                {!user && (
                  <p className="mt-2 text-xs font-bold text-orange-600">
                    {labels.login}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)]"
                aria-label={labels.close}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="text-sm font-black text-[var(--color-text)]">
                {labels.reason}
              </label>

              <select
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ReportReason)
                }
                className="h-12 rounded-[16px] border border-[var(--color-border)] bg-white px-4 text-sm font-black text-[var(--color-text)] shadow-sm"
              >
                <option value="scam">{labels.reasons.scam}</option>
                <option value="wrong_info">{labels.reasons.wrong_info}</option>
                <option value="duplicate">{labels.reasons.duplicate}</option>
                <option value="offensive">{labels.reasons.offensive}</option>
                <option value="unavailable">
                  {labels.reasons.unavailable}
                </option>
                <option value="other">{labels.reasons.other}</option>
              </select>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder={labels.details}
                className="rounded-[16px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm placeholder:text-gray-400"
              />

              {message && (
                <p className="rounded-[14px] bg-[var(--color-primary-soft)] px-3 py-2 text-sm font-bold text-[var(--color-primary)]">
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] text-sm font-black text-white shadow-[var(--shadow-button)] disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? labels.sending : labels.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
