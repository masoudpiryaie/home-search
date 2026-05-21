"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import LoadingScreen from "@/app/components/LoadingScreen";
import PropertyForm from "@/app/components/PropertyForm";
import { useAuth } from "@/app/context/AuthContext";
import { getPropertyById } from "@/app/lib/propertyService";
import { type Locale } from "@/app/lib/i18n";
import type { Property } from "@/app/types/property";

type Props = {
  locale: Locale;
  propertyId: string;
};

export default function UserEditPropertyClient({ locale, propertyId }: Props) {
  const { user, loading: authLoading } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      if (authLoading) return;

      if (!user) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getPropertyById(propertyId);

        if (!data) {
          setNotAllowed(true);
          setLoading(false);
          return;
        }

        const isOwner =
          data.submittedBy?.uid === user.uid || data.createdBy === user.uid;

        if (!isOwner) {
          setNotAllowed(true);
          setLoading(false);
          return;
        }

        setProperty(data);
      } catch (error) {
        console.error(error);
        setNotAllowed(true);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [authLoading, user, propertyId]);

  if (authLoading || loading) {
    return <LoadingScreen text="Loading listing..." />;
  }

  if (notAllowed || !property) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
        <div className="mx-auto max-w-md rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <AlertTriangle className="mx-auto text-red-600" size={36} />

          <h1 className="mt-4 text-2xl font-black text-[var(--color-text)]">
            {locale === "fa"
              ? "دسترسی مجاز نیست"
              : locale === "de"
                ? "Kein Zugriff"
                : "Access denied"}
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
            {locale === "fa"
              ? "شما اجازه ویرایش این آگهی را ندارید."
              : locale === "de"
                ? "Du darfst diese Anzeige nicht bearbeiten."
                : "You are not allowed to edit this listing."}
          </p>
        </div>
      </main>
    );
  }

  const editCount = property.editCount || 0;
  const remainingEdits = Math.max(0, 2 - editCount);

  if (editCount >= 2) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <AlertTriangle className="mx-auto text-orange-600" size={38} />

          <h1 className="mt-4 text-2xl font-black text-[var(--color-text)]">
            {locale === "fa"
              ? "حد ویرایش تمام شده است"
              : locale === "de"
                ? "Bearbeitungslimit erreicht"
                : "Edit limit reached"}
          </h1>

          <p className="mt-3 text-sm font-medium leading-7 text-[var(--color-muted)]">
            {locale === "fa"
              ? "شما قبلاً ۲ بار این آگهی را ویرایش کرده‌اید و دیگر امکان ویرایش وجود ندارد."
              : locale === "de"
                ? "Du hast diese Anzeige bereits 2 Mal bearbeitet. Weitere Änderungen sind nicht möglich."
                : "You have already edited this listing 2 times. More edits are not allowed."}
          </p>

          <Link
            href={`/${locale}/my-listings`}
            className="mt-6 inline-flex rounded-[16px] bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-button)]"
          >
            {locale === "fa"
              ? "بازگشت به آگهی‌های من"
              : locale === "de"
                ? "Zurück zu meinen Anzeigen"
                : "Back to my listings"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/${locale}/my-listings`}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[var(--color-text)] shadow-sm"
        >
          <ArrowLeft size={17} />
          {locale === "fa" ? "بازگشت" : locale === "de" ? "Zurück" : "Back"}
        </Link>

        <section className="mb-6 rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[var(--color-text)] md:text-5xl">
            {locale === "fa"
              ? "ویرایش آگهی"
              : locale === "de"
                ? "Anzeige bearbeiten"
                : "Edit listing"}
          </h1>

          <p className="mt-3 text-sm font-bold leading-6 text-[var(--color-muted)]">
            {locale === "fa"
              ? `این آگهی ${editCount} بار ویرایش شده است. شما ${remainingEdits} بار دیگر می‌توانید ویرایش کنید.`
              : locale === "de"
                ? `Diese Anzeige wurde ${editCount} Mal bearbeitet. Du kannst sie noch ${remainingEdits} Mal bearbeiten.`
                : `This listing has been edited ${editCount} time(s). You can edit it ${remainingEdits} more time(s).`}
          </p>

          <p className="mt-2 rounded-[18px] bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-bold leading-6 text-[var(--color-primary)]">
            {locale === "fa"
              ? "بعد از ویرایش، آگهی دوباره برای بررسی ادمین ارسال می‌شود."
              : locale === "de"
                ? "Nach der Bearbeitung wird die Anzeige erneut zur Prüfung gesendet."
                : "After editing, your listing will be sent for admin review again."}
          </p>
        </section>

        <PropertyForm
          initialData={property}
          propertyId={propertyId}
          mode="edit"
          submitMode="public"
          locale={locale}
        />
      </div>
    </main>
  );
}
