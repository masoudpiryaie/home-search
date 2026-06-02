// "use client";

// import Link from "next/link";
// import {
//   Bath,
//   BedDouble,
//   Eye,
//   Heart,
//   Home,
//   MapPin,
//   Maximize2,
// } from "lucide-react";

// import FavoriteButton from "@/app/components/FavoriteButton";
// import PropertyImage from "@/app/components/PropertyImage";
// import { getLocalizedText } from "@/app/lib/localizedText";
// import type { Locale } from "@/app/lib/i18n";
// import type { Property } from "@/app/types/property";

// type PropertyCardProps = {
//   property: Property;
//   locale: Locale;
// };

// export default function PropertyCard({ property, locale }: PropertyCardProps) {
//   const title = getLocalizedText(property.title, locale);
//   const description = getLocalizedText(property.description, locale);

//   const href = `/${locale}/properties/${property.slug}`;
//   const mainImage = property.images?.[0];

//   const isRent = property.listingType === "rent";

//   return (
//     <article className="group overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,24,40,0.14)]">
//       <div className="relative h-[235px] overflow-hidden bg-gray-100">
//         <Link href={href} className="block h-full">
//           <PropertyImage
//             image={mainImage}
//             alt={title || "Property image"}
//             size="card"
//             loading="lazy"
//             className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
//             fallbackText={
//               locale === "fa"
//                 ? "بدون عکس"
//                 : locale === "de"
//                   ? "Kein Bild"
//                   : "No image"
//             }
//           />
//         </Link>

//         <div className="absolute top-3 flex items-center gap-2 ltr:left-3 rtl:right-3">
//           <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[var(--color-primary)] shadow-sm backdrop-blur-md">
//             {isRent
//               ? locale === "fa"
//                 ? "اجاره"
//                 : locale === "de"
//                   ? "Miete"
//                   : "Rent"
//               : locale === "fa"
//                 ? "فروش"
//                 : locale === "de"
//                   ? "Kauf"
//                   : "Sale"}
//           </span>
//         </div>

//         <div className="absolute top-3 ltr:right-3 rtl:left-3">
//           {property.id && (
//             <FavoriteButton
//               propertyId={property.id}
//               locale={locale}
//               variant="icon"
//             />
//           )}
//         </div>

//         {property.images?.length > 1 && (
//           <div className="absolute bottom-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md ltr:right-3 rtl:left-3">
//             {property.images.length}{" "}
//             {locale === "fa" ? "عکس" : locale === "de" ? "Bilder" : "photos"}
//           </div>
//         )}
//       </div>

//       <div className="p-4 md:p-5">
//         <Link href={href}>
//           <h3 className="line-clamp-2 text-lg font-black leading-7 tracking-[-0.03em] text-[var(--color-text)] transition hover:text-[var(--color-primary)]">
//             {title ||
//               (locale === "fa"
//                 ? "بدون عنوان"
//                 : locale === "de"
//                   ? "Ohne Titel"
//                   : "Untitled listing")}
//           </h3>
//         </Link>

//         <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted)]">
//           <MapPin size={15} />
//           <span className="line-clamp-1">
//             {property.location?.city || "-"}
//             {property.location?.district
//               ? `${locale === "fa" ? "، " : ", "}${property.location.district}`
//               : ""}
//           </span>
//         </p>

//         {description && (
//           <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
//             {description}
//           </p>
//         )}

//         <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-[var(--color-muted)]">
//           <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
//             <Home size={14} />
//             {getPropertyTypeLabel(property.propertyType, locale)}
//           </span>

//           <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
//             <BedDouble size={14} />
//             {property.details?.rooms || "-"}{" "}
//             {locale === "fa" ? "اتاق" : locale === "de" ? "Zimmer" : "rooms"}
//           </span>

//           {property.details?.bathrooms !== undefined && (
//             <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
//               <Bath size={14} />
//               {property.details.bathrooms}
//             </span>
//           )}

//           <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
//             <Maximize2 size={14} />
//             {property.details?.area || "-"} m²
//           </span>
//         </div>

//         <div className="mt-5 flex items-end justify-between gap-3">
//           <div>
//             <p className="text-xs font-bold text-[var(--color-muted)]">
//               {isRent
//                 ? locale === "fa"
//                   ? "اجاره ماهانه"
//                   : locale === "de"
//                     ? "Monatliche Miete"
//                     : "Monthly rent"
//                 : locale === "fa"
//                   ? "قیمت"
//                   : locale === "de"
//                     ? "Preis"
//                     : "Price"}
//             </p>

//             <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--color-primary)]">
//               €{Number(property.price || 0).toLocaleString("de-DE")}
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="hidden items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-3 py-2 text-xs font-black text-[var(--color-primary)] sm:inline-flex">
//               <Eye size={14} />
//               {property.stats?.views || property.viewCount || 0}
//             </span>

//             <Link
//               href={href}
//               className="inline-flex h-11 items-center justify-center rounded-[15px] bg-[var(--color-primary)] px-4 text-xs font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
//             >
//               {locale === "fa"
//                 ? "جزئیات"
//                 : locale === "de"
//                   ? "Details"
//                   : "Details"}
//             </Link>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }

// function getPropertyTypeLabel(type: Property["propertyType"], locale: Locale) {
//   const labels = {
//     en: {
//       apartment: "Apartment",
//       house: "House",
//       studio: "Studio",
//       room: "Room",
//     },
//     fa: {
//       apartment: "آپارتمان",
//       house: "خانه",
//       studio: "استودیو",
//       room: "اتاق",
//     },
//     de: {
//       apartment: "Wohnung",
//       house: "Haus",
//       studio: "Studio",
//       room: "Zimmer",
//     },
//   };

//   return labels[locale][type] || labels.en[type];
// }
"use client";

import Link from "next/link";
import {
  Bath,
  BedDouble,
  Eye,
  Home,
  MapPin,
  Maximize2,
  ArrowUpRight,
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
  // متغیر توضیحات برای عدم بروز ارور ریلیز باقی مانده اما از رندر حذف شده است
  const description = getLocalizedText(property.description, locale);

  const href = `/${locale}/properties/${property.slug}`;
  const mainImage = property.images?.[0];

  const isRent = property.listingType === "rent";

  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(16,24,40,0.08)]">
      {/* Property Image Section */}
      <div className="relative h-[240px] overflow-hidden bg-gray-50">
        <Link href={href} className="block h-full">
          <PropertyImage
            image={mainImage}
            alt={title || "Property image"}
            size="card"
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            fallbackText={
              locale === "fa"
                ? "بدون عکس"
                : locale === "de"
                  ? "Kein Bild"
                  : "No image"
            }
          />
        </Link>

        {/* Status Badge (Rent/Sale) */}
        <div className="absolute top-4 flex items-center gap-2 ltr:left-4 rtl:right-4">
          <span className="rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] shadow-sm backdrop-blur-md">
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

        {/* Favorite Button */}
        <div className="absolute top-4 ltr:right-4 rtl:left-4">
          {property.id && (
            <FavoriteButton
              propertyId={property.id}
              locale={locale}
              variant="icon"
            />
          )}
        </div>

        {/* Images Count Badge */}
        {property.images?.length > 1 && (
          <div className="absolute bottom-4 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm ltr:right-4 rtl:left-4">
            {property.images.length}{" "}
            {locale === "fa" ? "عکس" : locale === "de" ? "Bilder" : "photos"}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col justify-between">
        <div>
          {/* Property Type & Location */}
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[var(--color-muted)] mb-2">
            <span className="inline-flex items-center gap-1 text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-2 py-0.5 rounded-md text-[11px]">
              <Home size={12} />
              {getPropertyTypeLabel(property.propertyType, locale)}
            </span>

            <div className="flex items-center gap-1 max-w-[65%]">
              <MapPin size={13} className="shrink-0" />
              <span className="line-clamp-1">
                {property.location?.city || "-"}
                {property.location?.district
                  ? `${locale === "fa" ? "، " : ", "}${property.location.district}`
                  : ""}
              </span>
            </div>
          </div>

          {/* Title */}
          <Link href={href} className="block group/title">
            <h3 className="line-clamp-1 text-base font-bold leading-7 text-[var(--color-text)] transition group-hover/title:text-[var(--color-primary)]">
              {title ||
                (locale === "fa"
                  ? "بدون عنوان"
                  : locale === "de"
                    ? "Ohne Titel"
                    : "Untitled listing")}
            </h3>
          </Link>

          {/* Features Specs Row */}
          <div className="mt-4 flex items-center gap-4 border-b border-gray-100 pb-4 text-xs font-medium text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1">
              <BedDouble size={15} className="text-gray-400" />
              <span>
                {property.details?.rooms || "-"}{" "}
                <span className="text-[11px] text-gray-400">
                  {locale === "fa" ? "اتاق" : locale === "de" ? "Zim" : "rms"}
                </span>
              </span>
            </span>

            {property.details?.bathrooms !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Bath size={15} className="text-gray-400" />
                <span>
                  {property.details.bathrooms}{" "}
                  <span className="text-[11px] text-gray-400">
                    {locale === "fa"
                      ? "سرویس"
                      : locale === "de"
                        ? "Bad"
                        : "bath"}
                  </span>
                </span>
              </span>
            )}

            <span className="inline-flex items-center gap-1">
              <Maximize2 size={15} className="text-gray-400" />
              <span>
                {property.details?.area || "-"}{" "}
                <span className="text-[11px] text-gray-400">m²</span>
              </span>
            </span>
          </div>
        </div>

        {/* Footer: Price & Action */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-[var(--color-muted)] block">
              {isRent
                ? locale === "fa"
                  ? "اجاره ماهانه"
                  : locale === "de"
                    ? "Monatliche Miete"
                    : "Monthly rent"
                : locale === "fa"
                  ? "قیمت خرید"
                  : locale === "de"
                    ? "Kaufpreis"
                    : "Purchase price"}
            </span>

            <span className="text-xl font-extrabold tracking-tight text-[var(--color-text)] block mt-0.5">
              €{Number(property.price || 0).toLocaleString("de-DE")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Views Count */}
            <span className="hidden items-center gap-1 text-[11px] font-medium text-[var(--color-muted)] sm:inline-flex">
              <Eye size={13} />
              {property.stats?.views || property.viewCount || 0}
            </span>

            {/* Micro Action Button */}
            <Link
              href={href}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-[var(--color-text)] shadow-sm transition-all duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white group-hover:border-transparent"
            >
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:rotate-45"
              />
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
