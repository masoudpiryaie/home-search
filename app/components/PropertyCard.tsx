import Link from "next/link";
import { Bath, BedDouble, MapPin, Maximize2, Eye } from "lucide-react";

import FavoriteButton from "@/app/components/FavoriteButton";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import { getLocalizedText } from "@/app/lib/localizedText";
import type { Property } from "@/app/types/property";
import { formatPostedAgo } from "@/app/lib/date";
import { getPropertyImageSources } from "@/app/lib/cloudinaryImage";
type Props = {
  property: Property;
  locale?: Locale;
};

export default function PropertyCard({ property, locale = "en" }: Props) {
  const t = getDictionary(locale);
  const mainImage = property.images?.[0];
  const imageSources = getPropertyImageSources(mainImage?.publicId);
  const imageUrl = imageSources.card || mainImage?.url;
  const title = getLocalizedText(property.title, locale);
  const postedAgo = formatPostedAgo(property.createdAt, locale);
  const roomsLabel =
    locale === "fa" ? "اتاق" : locale === "de" ? "Zimmer" : "rooms";

  const bathLabel = locale === "fa" ? "حمام" : locale === "de" ? "Bad" : "bath";

  return (
    <Link
      href={`/${locale}/properties/${property.id}`}
      className="group block overflow-hidden rounded-[1.8rem] border border-black/5 bg-white shadow-sm shadow-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
    >
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            srcSet={
              imageSources.card && imageSources.card2x
                ? `${imageSources.card} 640w, ${imageSources.card2x} 960w`
                : undefined
            }
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--color-muted)]">
            {locale === "fa"
              ? "بدون عکس"
              : locale === "de"
                ? "Kein Bild"
                : "No image"}
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900 shadow-sm backdrop-blur-md">
          {property.listingType === "rent"
            ? t.properties.forRent
            : t.properties.forSale}
        </div>

        <FavoriteButton propertyId={property.id} locale={locale} />

        <div className="absolute bottom-4 left-4 rounded-full bg-black/80 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
          {property.price.toLocaleString("de-DE")} €
        </div>
      </div>

      <div className="p-5">
        <h2 className="line-clamp-1 text-lg font-bold tracking-tight text-gray-950">
          {title}
        </h2>

        <div className="mt-2 flex justify-between items-center gap-1 text-sm text-gray-500">
          <div className="mt-2 flex justify-between items-center gap-1 text-sm text-gray-500">
            <MapPin size={15} />
            <span className="line-clamp-1">
              {property.location.city}
              {property.location.district
                ? `, ${property.location.district}`
                : ""}
            </span>
          </div>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-muted)]">
            <Eye size={14} />
            {locale === "fa"
              ? `${property.viewCount || 0} بازدید`
              : locale === "de"
                ? `${property.viewCount || 0} Aufrufe`
                : `${property.viewCount || 0} views`}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="flex items-center justify-center gap-1 rounded-2xl bg-gray-50 px-2 py-3 text-xs font-medium text-gray-700">
            <BedDouble size={16} />
            {property.details.rooms} {roomsLabel}
          </div>

          <div className="flex items-center justify-center gap-1 rounded-2xl bg-gray-50 px-2 py-3 text-xs font-medium text-gray-700">
            <Maximize2 size={16} />
            {property.details.area} m²
          </div>

          <div className="flex items-center justify-center gap-1 rounded-2xl bg-gray-50 px-2 py-3 text-xs font-medium text-gray-700">
            <Bath size={16} />
            {property.details.bathrooms || 1} {bathLabel}
          </div>
          {postedAgo && (
            <p className="mt-2 text-xs font-bold text-[var(--color-primary)]">
              {postedAgo}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
