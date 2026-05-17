"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CheckCircle2,
  Home,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  Share2,
} from "lucide-react";

import FavoriteButton from "@/app/components/FavoriteButton";
import InquiryForm from "@/app/components/InquiryForm";
import { PropertyDetailsSkeleton } from "@/app/components/Skeletons";
import { getPropertyById } from "@/app/lib/propertyService";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import type { Property } from "@/app/types/property";
import { getLocalizedText } from "@/app/lib/localizedText";
type PropertyDetailsClientProps = {
  locale: Locale;
  propertyId: string;
};

export default function PropertyDetailsClient({
  locale,
  propertyId,
}: PropertyDetailsClientProps) {
  const t = getDictionary(locale);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await getPropertyById(propertyId);

        if (!data || data.status !== "active") {
          setNotFound(true);
          setProperty(null);
          return;
        }

        setProperty(data);
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [propertyId]);

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (notFound || !property) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-4">
        <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <Home className="text-gray-400" size={26} />
          </div>

          <h1 className="mt-4 text-xl font-black text-gray-950">
            {locale === "fa"
              ? "آگهی پیدا نشد"
              : locale === "de"
                ? "Anzeige nicht gefunden"
                : "Property not found"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {locale === "fa"
              ? "این آگهی وجود ندارد یا هنوز تایید نشده است."
              : locale === "de"
                ? "Diese Anzeige existiert nicht oder wurde noch nicht freigegeben."
                : "This property does not exist or is not approved yet."}
          </p>

          <Link
            href={`/${locale}/properties?type=rent`}
            className="mt-6 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
          >
            {locale === "fa"
              ? "بازگشت به آگهی‌ها"
              : locale === "de"
                ? "Zurück zu Anzeigen"
                : "Back to properties"}
          </Link>
        </div>
      </main>
    );
  }

  const images = property.images || [];
  const mainImage = images[0]?.url;
  const title = getLocalizedText(property.title, locale);
  const description = getLocalizedText(property.description, locale);
  return (
    <main className="min-h-screen bg-[#f7f7f4] pb-28 md:pb-10">
      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/${locale}/properties?type=${property.listingType}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm"
          >
            <ArrowLeft size={17} />
            {t.common.back}
          </Link>

          <div className="flex gap-2">
            <div className="relative h-10 w-10">
              <FavoriteButton propertyId={property.id} locale={locale} />
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] bg-white">
            {mainImage ? (
              <img
                src={mainImage}
                alt={title}
                className="h-[340px] w-full object-cover sm:h-[460px] lg:h-[560px]"
              />
            ) : (
              <div className="flex h-[340px] items-center justify-center text-sm text-gray-400 sm:h-[460px] lg:h-[560px]">
                {locale === "fa"
                  ? "بدون عکس"
                  : locale === "de"
                    ? "Kein Bild"
                    : "No image"}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {images.slice(1, 3).map((image, index) => (
              <div
                key={image.publicId || index}
                className="overflow-hidden rounded-[1.5rem] bg-white"
              >
                <img
                  src={image.url}
                  alt={`${title} ${index + 2}`}
                  className="h-40 w-full object-cover sm:h-52 lg:h-full"
                />
              </div>
            ))}

            {images.length <= 1 && (
              <>
                <PlaceholderImage locale={locale} />
                <PlaceholderImage locale={locale} />
              </>
            )}

            {images.length === 2 && <PlaceholderImage locale={locale} />}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                  {property.listingType === "rent"
                    ? t.properties.forRent
                    : t.properties.forSale}
                </span>

                <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-bold capitalize text-gray-700">
                  {getPropertyTypeLabel(property.propertyType, locale)}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
                {title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={17} />
                <span>
                  {property.location?.city}
                  {property.location?.district
                    ? `, ${property.location.district}`
                    : ""}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailBox
                  icon={<BedDouble size={20} />}
                  label={
                    locale === "fa"
                      ? "اتاق"
                      : locale === "de"
                        ? "Zimmer"
                        : "Rooms"
                  }
                  value={property.details?.rooms || "-"}
                />

                <DetailBox
                  icon={<Maximize2 size={20} />}
                  label={
                    locale === "fa"
                      ? "متراژ"
                      : locale === "de"
                        ? "Fläche"
                        : "Area"
                  }
                  value={`${property.details?.area || "-"} m²`}
                />

                <DetailBox
                  icon={<Bath size={20} />}
                  label={
                    locale === "fa" ? "حمام" : locale === "de" ? "Bad" : "Bath"
                  }
                  value={property.details?.bathrooms || 1}
                />

                <DetailBox
                  icon={<Home size={20} />}
                  label={
                    locale === "fa"
                      ? "قیمت"
                      : locale === "de"
                        ? "Preis"
                        : "Price"
                  }
                  value={`${property.price?.toLocaleString("de-DE")} €`}
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-xl font-black text-gray-950">
                {locale === "fa"
                  ? "توضیحات"
                  : locale === "de"
                    ? "Beschreibung"
                    : "Description"}
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 md:text-base">
                {description}
              </p>
            </section>

            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-xl font-black text-gray-950">
                {locale === "fa"
                  ? "جزئیات ملک"
                  : locale === "de"
                    ? "Immobiliendetails"
                    : "Property details"}
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoRow
                  label={
                    locale === "fa"
                      ? "تعداد اتاق"
                      : locale === "de"
                        ? "Zimmer"
                        : "Rooms"
                  }
                  value={property.details?.rooms}
                />

                <InfoRow
                  label={
                    locale === "fa"
                      ? "اتاق خواب"
                      : locale === "de"
                        ? "Schlafzimmer"
                        : "Bedrooms"
                  }
                  value={property.details?.bedrooms}
                />

                <InfoRow
                  label={
                    locale === "fa"
                      ? "حمام"
                      : locale === "de"
                        ? "Badezimmer"
                        : "Bathrooms"
                  }
                  value={property.details?.bathrooms}
                />

                <InfoRow
                  label={
                    locale === "fa"
                      ? "متراژ"
                      : locale === "de"
                        ? "Fläche"
                        : "Area"
                  }
                  value={
                    property.details?.area ? `${property.details.area} m²` : "-"
                  }
                />

                <InfoRow
                  label={
                    locale === "fa"
                      ? "طبقه"
                      : locale === "de"
                        ? "Etage"
                        : "Floor"
                  }
                  value={property.details?.floor}
                />

                <InfoRow
                  label={
                    locale === "fa"
                      ? "سال ساخت"
                      : locale === "de"
                        ? "Baujahr"
                        : "Year built"
                  }
                  value={property.details?.yearBuilt}
                />
              </div>
            </section>

            {property.listingType === "rent" && property.rentDetails && (
              <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
                <h2 className="text-xl font-black text-gray-950">
                  {t.form.rentDetails}
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    label={t.form.coldRent}
                    value={
                      property.rentDetails.coldRent
                        ? `${property.rentDetails.coldRent.toLocaleString(
                            "de-DE",
                          )} €`
                        : "-"
                    }
                  />

                  <InfoRow
                    label={t.form.warmRent}
                    value={
                      property.rentDetails.warmRent
                        ? `${property.rentDetails.warmRent.toLocaleString(
                            "de-DE",
                          )} €`
                        : "-"
                    }
                  />

                  <InfoRow
                    label={t.form.utilities}
                    value={
                      property.rentDetails.utilities
                        ? `${property.rentDetails.utilities.toLocaleString(
                            "de-DE",
                          )} €`
                        : "-"
                    }
                  />

                  <InfoRow
                    label={t.form.deposit}
                    value={
                      property.rentDetails.deposit
                        ? `${property.rentDetails.deposit.toLocaleString(
                            "de-DE",
                          )} €`
                        : "-"
                    }
                  />

                  <InfoRow
                    label={t.form.availableFrom}
                    value={property.rentDetails.availableFrom || "-"}
                  />
                </div>
              </section>
            )}

            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-xl font-black text-gray-950">
                {t.form.features}
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {getActiveFeatures(property, locale).map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700"
                  >
                    <CheckCircle2 size={17} className="text-green-600" />
                    {feature}
                  </div>
                ))}

                {getActiveFeatures(property, locale).length === 0 && (
                  <p className="text-sm text-gray-500">
                    {locale === "fa"
                      ? "امکانات خاصی ثبت نشده است."
                      : locale === "de"
                        ? "Keine besonderen Ausstattungen angegeben."
                        : "No special features listed."}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7 lg:hidden">
              <h2 className="text-xl font-black text-gray-950">
                {locale === "fa"
                  ? "تماس با آگهی‌دهنده"
                  : locale === "de"
                    ? "Anbieter kontaktieren"
                    : "Contact owner"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {locale === "fa"
                  ? "برای این ملک پیام ارسال کنید."
                  : locale === "de"
                    ? "Sende eine Nachricht zu dieser Immobilie."
                    : "Send a message about this property."}
              </p>

              <InquiryForm property={property} locale={locale} />
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <ContactCard property={property} locale={locale} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function PlaceholderImage({ locale }: { locale: Locale }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-[1.5rem] bg-white text-xs text-gray-400 sm:h-52 lg:h-full">
      {locale === "fa"
        ? "بدون عکس"
        : locale === "de"
          ? "Kein Bild"
          : "No image"}
    </div>
  );
}

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.3rem] bg-gray-50 p-4">
      <div className="text-gray-500">{icon}</div>
      <p className="mt-3 text-xs font-bold text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-black text-gray-950">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm font-black text-gray-950">{value || "-"}</span>
    </div>
  );
}

function ContactCard({
  property,
  locale,
}: {
  property: Property;
  locale: Locale;
}) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm md:p-6">
      <p className="text-sm font-medium text-gray-500">
        {locale === "fa"
          ? "اطلاعات تماس"
          : locale === "de"
            ? "Kontakt"
            : "Contact"}
      </p>

      <h2 className="mt-2 text-2xl font-black text-gray-950">
        {property.contact?.name}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {locale === "fa"
          ? "برای دریافت اطلاعات بیشتر درباره این ملک پیام ارسال کنید."
          : locale === "de"
            ? "Sende eine Nachricht, um mehr Informationen zu dieser Immobilie zu erhalten."
            : "Send a message to get more information about this property."}
      </p>

      <div className="mt-5 space-y-3">
        <FavoriteButton
          propertyId={property.id}
          variant="full"
          locale={locale}
        />

        {property.contact?.email && (
          <a
            href={`mailto:${property.contact.email}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-bold text-white"
          >
            <Mail size={18} />
            {locale === "fa"
              ? "ارسال ایمیل"
              : locale === "de"
                ? "E-Mail senden"
                : "Send email"}
          </a>
        )}

        {property.contact?.phone && (
          <a
            href={`tel:${property.contact.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold text-gray-800"
          >
            <Phone size={18} />
            {locale === "fa" ? "تماس" : locale === "de" ? "Anrufen" : "Call"}
          </a>
        )}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-sm font-black text-gray-950">
          {locale === "fa"
            ? "ارسال پیام"
            : locale === "de"
              ? "Nachricht senden"
              : "Send a message"}
        </p>

        <InquiryForm property={property} locale={locale} />
      </div>
    </div>
  );
}

function getPropertyTypeLabel(type: Property["propertyType"], locale: Locale) {
  const labels = {
    en: {
      apartment: "Apartment",
      house: "House",
      studio: "Studio",
      room: "Room",
    },
    fa: {
      apartment: "آپارتمان",
      house: "خانه",
      studio: "استودیو",
      room: "اتاق",
    },
    de: {
      apartment: "Wohnung",
      house: "Haus",
      studio: "Studio",
      room: "Zimmer",
    },
  };

  return labels[locale][type] || labels.en[type];
}

function getActiveFeatures(property: Property, locale: Locale) {
  const featureLabels = {
    en: {
      balcony: "Balcony",
      garden: "Garden",
      elevator: "Elevator",
      parking: "Parking",
      furnished: "Furnished",
      petsAllowed: "Pets allowed",
      cellar: "Cellar",
      fittedKitchen: "Fitted kitchen",
    },
    fa: {
      balcony: "بالکن",
      garden: "باغ",
      elevator: "آسانسور",
      parking: "پارکینگ",
      furnished: "مبله",
      petsAllowed: "حیوان خانگی مجاز",
      cellar: "انباری",
      fittedKitchen: "آشپزخانه آماده",
    },
    de: {
      balcony: "Balkon",
      garden: "Garten",
      elevator: "Aufzug",
      parking: "Parkplatz",
      furnished: "Möbliert",
      petsAllowed: "Haustiere erlaubt",
      cellar: "Keller",
      fittedKitchen: "Einbauküche",
    },
  };

  const features = property.features || {};
  const labels = featureLabels[locale] || featureLabels.en;

  return Object.entries(features)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => labels[key as keyof typeof labels])
    .filter(Boolean);
}
