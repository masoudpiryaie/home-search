"use client";

import Link from "next/link";
import {
  Bath,
  BedDouble,
  Eye,
  Heart,
  Home,
  MapPin,
  Maximize2,
} from "lucide-react";

import FavoriteButton from "@/app/components/FavoriteButton";
import PropertyImage from "@/app/components/PropertyImage";
import { getLocalizedText } from "@/app/lib/localizedText";
import type { Locale } from "@/app/lib/i18n";
import type { Property } from "@/app/types/property";

type PropertyCardProps = {
  property: Property;
  locale: Locale;
};

export default function PropertyCard({ property, locale }: PropertyCardProps) {
  const title = getLocalizedText(property.title, locale);
  const description = getLocalizedText(property.description, locale);

  const href = `/${locale}/properties/${property.slug}`;
  const mainImage = property.images?.[0];

  const isRent = property.listingType === "rent";

  return (
    <article className="group overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,24,40,0.14)]">
      <div className="relative h-[235px] overflow-hidden bg-gray-100">
        <Link href={href} className="block h-full">
          <PropertyImage
            image={mainImage}
            alt={title || "Property image"}
            size="card"
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            fallbackText={
              locale === "fa"
                ? "بدون عکس"
                : locale === "de"
                  ? "Kein Bild"
                  : "No image"
            }
          />
        </Link>

        <div className="absolute top-3 flex items-center gap-2 ltr:left-3 rtl:right-3">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[var(--color-primary)] shadow-sm backdrop-blur-md">
            {isRent
              ? locale === "fa"
                ? "اجاره"
                : locale === "de"
                  ? "Miete"
                  : "Rent"
              : locale === "fa"
                ? "فروش"
                : locale === "de"
                  ? "Kauf"
                  : "Sale"}
          </span>
        </div>

        <div className="absolute top-3 ltr:right-3 rtl:left-3">
          {property.id && (
            <FavoriteButton
              propertyId={property.id}
              locale={locale}
              variant="icon"
            />
          )}
        </div>

        {property.images?.length > 1 && (
          <div className="absolute bottom-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md ltr:right-3 rtl:left-3">
            {property.images.length}{" "}
            {locale === "fa" ? "عکس" : locale === "de" ? "Bilder" : "photos"}
          </div>
        )}
      </div>

      <div className="p-4 md:p-5">
        <Link href={href}>
          <h3 className="line-clamp-2 text-lg font-black leading-7 tracking-[-0.03em] text-[var(--color-text)] transition hover:text-[var(--color-primary)]">
            {title ||
              (locale === "fa"
                ? "بدون عنوان"
                : locale === "de"
                  ? "Ohne Titel"
                  : "Untitled listing")}
          </h3>
        </Link>

        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted)]">
          <MapPin size={15} />
          <span className="line-clamp-1">
            {property.location?.city || "-"}
            {property.location?.district
              ? `${locale === "fa" ? "، " : ", "}${property.location.district}`
              : ""}
          </span>
        </p>

        {description && (
          <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
            {description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
            <Home size={14} />
            {getPropertyTypeLabel(property.propertyType, locale)}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
            <BedDouble size={14} />
            {property.details?.rooms || "-"}{" "}
            {locale === "fa" ? "اتاق" : locale === "de" ? "Zimmer" : "rooms"}
          </span>

          {property.details?.bathrooms !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
              <Bath size={14} />
              {property.details.bathrooms}
            </span>
          )}

          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
            <Maximize2 size={14} />
            {property.details?.area || "-"} m²
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[var(--color-muted)]">
              {isRent
                ? locale === "fa"
                  ? "اجاره ماهانه"
                  : locale === "de"
                    ? "Monatliche Miete"
                    : "Monthly rent"
                : locale === "fa"
                  ? "قیمت"
                  : locale === "de"
                    ? "Preis"
                    : "Price"}
            </p>

            <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--color-primary)]">
              €{Number(property.price || 0).toLocaleString("de-DE")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-3 py-2 text-xs font-black text-[var(--color-primary)] sm:inline-flex">
              <Eye size={14} />
              {property.stats?.views || property.viewCount || 0}
            </span>

            <Link
              href={href}
              className="inline-flex h-11 items-center justify-center rounded-[15px] bg-[var(--color-primary)] px-4 text-xs font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
            >
              {locale === "fa"
                ? "جزئیات"
                : locale === "de"
                  ? "Details"
                  : "Details"}
            </Link>
          </div>
        </div>
      </div>
    </article>
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
