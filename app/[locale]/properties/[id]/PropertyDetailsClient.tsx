"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Home,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Share2,
  Sofa,
  Wifi,
  Eye,
} from "lucide-react";

import FavoriteButton from "@/app/components/FavoriteButton";
import InquiryForm from "@/app/components/InquiryForm";
import PropertyImage from "@/app/components/PropertyImage";
import PropertyMap from "@/app/components/PropertyMap";
import ReportPropertyButton from "@/app/components/ReportPropertyButton";
import { PropertyDetailsSkeleton } from "@/app/components/Skeletons";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import { getLocalizedText } from "@/app/lib/localizedText";
import { formatPostedAgo } from "@/app/lib/date";
import { trackPropertyView } from "@/app/lib/propertyViews";
import {
  getPublicPropertyByIdOrSlug,
  getSimilarProperties,
} from "@/app/lib/propertyService";
import type { Property } from "@/app/types/property";

type PropertyDetailsClientProps = {
  locale: Locale;
  propertyId: string;
};

export default function PropertyDetailsClient({
  locale,
  propertyId,
}: PropertyDetailsClientProps) {
  const t = getDictionary(locale);
  const isRtl = locale === "fa";

  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const postedAgo = formatPostedAgo(property?.createdAt, locale);

  function shouldCountView(id: string) {
    if (typeof window === "undefined") return false;

    const key = `property-view-${id}`;
    const lastViewedAt = localStorage.getItem(key);

    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;

    if (lastViewedAt && now - Number(lastViewedAt) < twelveHours) {
      return false;
    }

    localStorage.setItem(key, String(now));
    return true;
  }

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await getPublicPropertyByIdOrSlug(propertyId);

        if (!data || data.status !== "active") {
          setNotFound(true);
          setProperty(null);
          return;
        }

        setProperty(data);

        if (data.id) {
          try {
            const similar = await getSimilarProperties(data);
            setSimilarProperties(similar);
          } catch (similarError) {
            console.warn("Could not load similar properties:", similarError);
            setSimilarProperties([]);
          }
        }

        if (data.id && shouldCountView(data.id)) {
          const tracked = await trackPropertyView(data.id);

          if (tracked) {
            setProperty((current) =>
              current
                ? {
                    ...current,
                    viewCount: Number(current.viewCount || 0) + 1,
                    stats: {
                      views: Number(current.stats?.views || 0) + 1,
                      favorites: Number(current.stats?.favorites || 0),
                      inquiries: Number(current.stats?.inquiries || 0),
                    },
                  }
                : current,
            );
          }
        }
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
      <main
        dir={isRtl ? "rtl" : "ltr"}
        className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10"
      >
        <div className="w-full max-w-md rounded-[24px] border border-[var(--color-border)] bg-white p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] sm:h-16 sm:w-16">
            <Home size={26} />
          </div>

          <h1 className="mt-5 text-xl font-black text-[var(--color-text)] sm:text-2xl">
            {t.propertyDetails.notFoundTitle}
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
            {t.propertyDetails.notFoundDescription}
          </p>

          <Link
            href={`/${locale}/properties?type=rent`}
            className="mt-6 inline-flex rounded-[15px] bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-button)]"
          >
            {t.propertyDetails.backToProperties}
          </Link>
        </div>
      </main>
    );
  }

  const images = property.images?.length ? property.images : [];
  const imageCount = images.length || 1;

  const title = getLocalizedText(property.title, locale);
  const description = getLocalizedText(property.description, locale);
  const price = property.price?.toLocaleString("de-DE");
  const views = property.stats?.views || property.viewCount || 0;

  function nextImage() {
    if (!images.length) return;
    setActiveImageIndex((value) => (value + 1) % images.length);
  }

  function prevImage() {
    if (!images.length) return;
    setActiveImageIndex((value) => (value - 1 + images.length) % images.length);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  const backIcon = isRtl ? <ArrowRight size={19} /> : <ArrowLeft size={19} />;

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--color-bg)] px-2.5 pb-24 pt-3 sm:px-4 sm:pb-28 md:px-5 md:pb-12 md:pt-5"
    >
      <section className="mx-auto max-w-[1488px] overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] sm:rounded-[28px] md:rounded-[34px]">
        <div className="grid gap-5 px-3 py-3 sm:px-5 sm:py-5 md:gap-7 md:px-8 md:py-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="mb-5 hidden items-center gap-2 text-xs font-bold text-[var(--color-muted)] md:flex">
              <Link
                href={`/${locale}`}
                className="transition hover:text-[var(--color-primary)]"
              >
                {t.nav.home}
              </Link>

              <span>{isRtl ? "‹" : "›"}</span>

              <Link
                href={`/${locale}/properties?type=${property.listingType}`}
                className="transition hover:text-[var(--color-primary)]"
              >
                {property.listingType === "rent" ? t.nav.rent : t.nav.buy}
              </Link>

              <span>{isRtl ? "‹" : "›"}</span>

              <span>{property.location?.city}</span>

              {property.location?.district && (
                <>
                  <span>{isRtl ? "‹" : "›"}</span>
                  <span>{property.location.district}</span>
                </>
              )}

              <span>{isRtl ? "‹" : "›"}</span>

              <span className="line-clamp-1 text-[var(--color-primary)]">
                {title}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between md:hidden">
              <Link
                href={`/${locale}/properties?type=${property.listingType}`}
                aria-label="Back"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--color-text)] shadow-sm ring-1 ring-[var(--color-border)]"
              >
                {backIcon}
              </Link>

              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10">
                  <FavoriteButton propertyId={property.id} locale={locale} />
                </div>

                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="Share"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--color-text)] shadow-sm ring-1 ring-[var(--color-border)]"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[18px] bg-gray-100 sm:rounded-[22px] md:rounded-[28px]">
              <PropertyImage
                image={images[activeImageIndex]}
                alt={title || "Property image"}
                size="detail"
                loading="eager"
                className="h-[225px] w-full object-cover sm:h-[340px] md:h-[500px]"
                fallbackText={t.propertyDetails.noImage}
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Previous image"
                    className={`absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--color-text)] shadow-md backdrop-blur-sm sm:h-11 sm:w-11 ${
                      isRtl ? "right-3 sm:right-4" : "left-3 sm:left-4"
                    }`}
                  >
                    {isRtl ? <ArrowRight size={19} /> : <ArrowLeft size={19} />}
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next image"
                    className={`absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--color-text)] shadow-md backdrop-blur-sm sm:h-11 sm:w-11 ${
                      isRtl ? "left-3 sm:left-4" : "right-3 sm:right-4"
                    }`}
                  >
                    {isRtl ? <ArrowLeft size={19} /> : <ArrowRight size={19} />}
                  </button>
                </>
              )}

              <div
                className={`absolute bottom-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-black text-white backdrop-blur-md sm:bottom-4 sm:px-3 sm:py-1.5 sm:text-sm ${
                  isRtl ? "right-3 sm:right-4" : "left-3 sm:left-4"
                }`}
              >
                {images.length ? activeImageIndex + 1 : 0} / {imageCount}
              </div>

              <button
                type="button"
                className={`absolute bottom-4 hidden items-center gap-2 rounded-[14px] bg-white px-4 py-3 text-sm font-black text-[var(--color-text)] shadow-md md:inline-flex ${
                  isRtl ? "left-4" : "right-4"
                }`}
              >
                <Maximize2 size={18} />
                {t.propertyDetails.viewAllPhotos}
              </button>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-[14px] border transition sm:h-20 sm:w-28 ${
                      activeImageIndex === index
                        ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary-soft)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    <PropertyImage
                      image={image}
                      alt={`${title || "Property image"} ${index + 1}`}
                      size="thumb"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 md:mt-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h1 className="text-start text-[22px] font-black leading-snug tracking-[-0.03em] text-[var(--color-text)] sm:text-[26px] md:text-[36px] md:tracking-[-0.045em]">
                  {title}
                </h1>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--color-muted)] sm:text-sm md:mt-3 md:gap-3">
                  <span className="inline-flex max-w-full items-center gap-1">
                    <MapPin size={16} className="shrink-0" />
                    <span className="truncate">
                      {property.location?.city}
                      {property.location?.district
                        ? `, ${property.location.district}`
                        : ""}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fffdf9] px-2.5 py-1 text-xs font-black text-[var(--color-muted)] ring-1 ring-[var(--color-border)] sm:text-sm">
                    <Eye size={14} />
                    {`${views} ${t.propertyDetails.views}`}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-xs font-black text-[var(--color-primary)] sm:text-sm">
                    <CheckCircle2 size={14} />
                    {t.propertyDetails.verified}
                  </span>

                  {postedAgo && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-xs font-black text-[var(--color-primary)] sm:text-sm">
                      {postedAgo}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-start text-[24px] font-black text-[var(--color-primary)] sm:text-[28px] md:mt-4 md:text-[34px]">
                  €{price}
                  {property.listingType === "rent" && (
                    <span className="text-sm font-bold text-[var(--color-muted)] sm:text-base">
                      {" "}
                      / {t.propertyDetails.month}
                    </span>
                  )}
                </p>
              </div>

              <div className="hidden gap-3 md:flex">
                <div className="relative h-12 w-12">
                  <FavoriteButton propertyId={property.id} locale={locale} />
                </div>

                <button
                  type="button"
                  onClick={copyLink}
                  className="flex h-12 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-sm font-black text-[var(--color-text)] shadow-sm"
                >
                  <Share2 size={18} />
                  {locale === "fa"
                    ? "اشتراک"
                    : locale === "de"
                      ? "Teilen"
                      : "Share"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:mt-5 md:flex md:flex-wrap md:gap-3">
              <DetailBox
                icon={<BedDouble size={18} />}
                label={t.form.rooms}
                value={property.details?.rooms || "-"}
              />

              <DetailBox
                icon={<Maximize2 size={18} />}
                label={
                  locale === "fa" ? "متراژ" : locale === "de" ? "Größe" : "Size"
                }
                value={`${property.details?.area || "-"} m²`}
              />

              <DetailBox
                icon={<Bath size={18} />}
                label={
                  locale === "fa" ? "حمام" : locale === "de" ? "Bad" : "Bath"
                }
                value={property.details?.bathrooms || 1}
              />

              <DetailBox
                icon={<Sofa size={18} />}
                label={
                  locale === "fa"
                    ? "مبله"
                    : locale === "de"
                      ? "Möbliert"
                      : "Furnished"
                }
                value={
                  property.features?.furnished
                    ? locale === "fa"
                      ? "بله"
                      : locale === "de"
                        ? "Ja"
                        : "Yes"
                    : "-"
                }
              />
            </div>

            <section className="mt-6 border-t border-[var(--color-border)] pt-5 md:mt-7 md:pt-6">
              <h2 className="text-start text-[19px] font-black tracking-[-0.02em] text-[var(--color-text)] sm:text-[21px] md:text-[22px]">
                {locale === "fa"
                  ? "درباره این ملک"
                  : locale === "de"
                    ? "Über diese Immobilie"
                    : "About this property"}
              </h2>

              <p className="mt-3 max-w-3xl whitespace-pre-line text-start text-sm font-semibold leading-7 text-[var(--color-muted)] md:text-base">
                {description}
              </p>

              <button className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[var(--color-primary)] md:hidden">
                {locale === "fa"
                  ? "بیشتر بخوانید"
                  : locale === "de"
                    ? "Mehr lesen"
                    : "Read more"}
                <ChevronDown size={16} />
              </button>
            </section>

            <section className="mt-6 border-t border-[var(--color-border)] pt-5 md:mt-7 md:pt-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-start text-[19px] font-black tracking-[-0.02em] text-[var(--color-text)] sm:text-[21px] md:text-[22px]">
                  {locale === "fa"
                    ? "امکانات"
                    : locale === "de"
                      ? "Ausstattung"
                      : "Amenities & features"}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {getActiveFeatures(property, locale).map((feature) => (
                  <Amenity
                    key={feature.label}
                    icon={feature.icon}
                    label={feature.label}
                  />
                ))}

                {getActiveFeatures(property, locale).length === 0 && (
                  <p className="text-sm font-semibold text-[var(--color-muted)]">
                    {locale === "fa"
                      ? "امکانات خاصی ثبت نشده است."
                      : locale === "de"
                        ? "Keine besonderen Ausstattungen angegeben."
                        : "No special features listed."}
                  </p>
                )}
              </div>
            </section>

            <section className="mt-6 border-t border-[var(--color-border)] pt-5 md:mt-7 md:pt-6">
              <h2 className="mb-4 text-start text-[19px] font-black tracking-[-0.02em] text-[var(--color-text)] sm:text-[21px] md:text-[22px]">
                {t.form.location}
              </h2>

              <div className="h-[180px] overflow-hidden rounded-[18px] sm:h-[220px] md:h-[230px] md:rounded-[22px]">
                <PropertyMap
                  lat={property.location?.lat}
                  lng={property.location?.lng}
                  locale={locale}
                />
              </div>
            </section>

            {property.listingType === "rent" && property.rentDetails && (
              <section className="mt-6 border-t border-[var(--color-border)] pt-5 md:mt-7 md:pt-6">
                <h2 className="text-start text-[19px] font-black tracking-[-0.02em] text-[var(--color-text)] sm:text-[21px] md:text-[22px]">
                  {t.form.rentDetails}
                </h2>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
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

            <section className="mt-6 border-t border-[var(--color-border)] pt-5 lg:hidden">
              <h2 className="text-start text-[19px] font-black tracking-[-0.02em] text-[var(--color-text)] sm:text-[21px]">
                {locale === "fa"
                  ? "تماس با آگهی‌دهنده"
                  : locale === "de"
                    ? "Anbieter kontaktieren"
                    : "Contact agent"}
              </h2>

              <p className="mt-2 text-start text-sm font-medium leading-6 text-[var(--color-muted)]">
                {locale === "fa"
                  ? "برای این ملک پیام ارسال کنید."
                  : locale === "de"
                    ? "Sende eine Nachricht zu dieser Immobilie."
                    : "Send a message about this property."}
              </p>

              <InquiryForm property={property} locale={locale} />
            </section>

            <div className="mt-6 border-t border-[var(--color-border)] pt-5">
              <ReportPropertyButton property={property} locale={locale} />
            </div>

            {/* {similarProperties.length > 0 && (
              <section className="mt-6 border-t border-[var(--color-border)] pt-5 md:mt-7 md:pt-6">
                <h2 className="mb-4 text-start text-[19px] font-black tracking-[-0.02em] text-[var(--color-text)] sm:text-[21px] md:text-[22px]">
                  {locale === "fa"
                    ? "آگهی‌های مشابه"
                    : locale === "de"
                      ? "Ähnliche Anzeigen"
                      : "Similar listings"}
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {similarProperties.map((item) => {
                    const itemTitle = getLocalizedText(item.title, locale);
                    const href = item.slug
                      ? `/${locale}/properties/${item.slug}`
                      : `/${locale}/properties/${item.id}`;

                    return (
                      <Link
                        key={item.id}
                        href={href}
                        className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
                      >
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <PropertyImage
                            image={item.images?.[0]}
                            alt={itemTitle || "Property image"}
                            size="thumb"
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="p-3">
                          <h3 className="line-clamp-2 text-sm font-black leading-5 text-[var(--color-text)]">
                            {itemTitle}
                          </h3>

                          <p className="mt-1 text-xs font-bold text-[var(--color-muted)]">
                            {item.location?.city || "-"}
                            {item.location?.district
                              ? `, ${item.location.district}`
                              : ""}
                          </p>

                          <p className="mt-2 text-sm font-black text-[var(--color-primary)]">
                            €{Number(item.price || 0).toLocaleString("de-DE")}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )} */}
            {similarProperties.length > 0 && (
              <section className="mt-8 sm:mt-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black text-[var(--color-text)] sm:text-2xl">
                    {t.propertyDetails.similarListings}
                  </h2>
                </div>

                <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-3 sm:-mx-0 sm:px-0">
                  {" "}
                  <div className="flex snap-x snap-mandatory gap-4">
                    {similarProperties.map((item) => {
                      const itemTitle = getLocalizedText(item.title, locale);
                      const itemCity = item.location?.city || "";
                      const itemDistrict = item.location?.district || "";
                      const itemImage = item.images?.[0];

                      return (
                        <Link
                          key={item.id}
                          href={`/${locale}/properties/${item.slug || item.id}`}
                          className="group w-[82%] shrink-0 snap-start overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-[360px] lg:w-[380px]"
                        >
                          <div className="relative h-44 overflow-hidden bg-[var(--color-bg-soft)] sm:h-52">
                            <PropertyImage
                              image={item.images?.[0]}
                              alt={itemTitle || "Property image"}
                              size="thumb"
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                              {item.listingType === "rent"
                                ? t.nav.rent
                                : t.nav.buy}
                            </div>
                          </div>

                          <div className="space-y-3 p-4">
                            <div>
                              <h3 className="line-clamp-1 text-base font-black text-[var(--color-text)]">
                                {itemTitle}
                              </h3>

                              <p className="mt-1 line-clamp-1 text-sm font-semibold text-[var(--color-muted)]">
                                {[itemDistrict, itemCity]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            </div>

                            <div className="flex items-end justify-between gap-3">
                              <div className="text-lg font-black text-[var(--color-primary)]">
                                €
                                {Number(item.price || 0).toLocaleString(locale)}
                                {item.listingType === "rent" && (
                                  <span className="text-xs font-bold text-[var(--color-muted)]">
                                    {" "}
                                    / {t.propertyDetails.month}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)]">
                                <span>
                                  {item.details?.rooms || "-"} {t.form.rooms}
                                </span>
                                <span>•</span>
                                <span>{item.details?.area || "-"} m²</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <ContactCard property={property} locale={locale} />

              <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
                <h3 className="text-start text-xl font-black text-[var(--color-text)]">
                  {t.form.location}
                </h3>

                <div className="mt-4 h-[260px] overflow-hidden rounded-[18px]">
                  <PropertyMap
                    lat={property.location?.lat}
                    lng={property.location?.lng}
                    locale={locale}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-20 z-50 border-t border-[var(--color-border)] bg-white/95 px-3 py-2.5 shadow-[0_-12px_35px_rgba(16,24,40,0.10)] backdrop-blur-xl sm:px-4 sm:py-3 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5 sm:gap-3">
          {property.contact?.phone ? (
            <a
              href={`tel:${property.contact.phone}`}
              className="flex h-12 items-center justify-center gap-2 rounded-[15px] border border-[var(--color-border)] bg-white text-sm font-black text-[var(--color-text)] shadow-sm sm:h-14 sm:rounded-[16px]"
            >
              <Phone size={18} />
              {locale === "fa" ? "تماس" : locale === "de" ? "Anrufen" : "Call"}
            </a>
          ) : (
            <a
              href={`mailto:${property.contact?.email || ""}`}
              className="flex h-12 items-center justify-center gap-2 rounded-[15px] border border-[var(--color-border)] bg-white text-sm font-black text-[var(--color-text)] shadow-sm sm:h-14 sm:rounded-[16px]"
            >
              <Mail size={18} />
              {locale === "fa"
                ? "پیام"
                : locale === "de"
                  ? "Nachricht"
                  : "Message"}
            </a>
          )}

          <a
            href={`mailto:${property.contact?.email || ""}`}
            className="flex h-12 items-center justify-center gap-2 rounded-[15px] bg-[var(--color-accent)] text-sm font-black text-white shadow-[var(--shadow-button)] sm:h-14 sm:rounded-[16px]"
          >
            <CalendarDays size={18} />
            <span className="truncate">
              {locale === "fa"
                ? "رزرو بازدید"
                : locale === "de"
                  ? "Besichtigung"
                  : "Book viewing"}
            </span>
          </a>
        </div>
      </div>
    </main>
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
    <div className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[15px] border border-[var(--color-border)] bg-white px-2 text-center text-xs font-black text-[var(--color-text)] shadow-sm sm:min-h-[68px] md:min-h-[64px] md:min-w-[128px] md:flex-row md:gap-3 md:px-4 md:text-sm">
      <span className="text-[var(--color-primary)]">{icon}</span>

      <span className="leading-none">{value}</span>

      <span className="text-[11px] font-bold leading-none text-[var(--color-muted)] md:hidden">
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[15px] border border-[var(--color-border)] bg-white px-3.5 py-3 shadow-sm sm:gap-4 sm:px-4">
      <span className="text-start text-xs font-bold text-[var(--color-muted)] sm:text-sm">
        {label}
      </span>

      <span className="shrink-0 text-end text-xs font-black text-[var(--color-text)] sm:text-sm">
        {value || "-"}
      </span>
    </div>
  );
}

function Amenity({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-[13px] border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-black text-[var(--color-muted)] shadow-sm sm:gap-2 sm:rounded-[14px] sm:px-4 sm:py-3 sm:text-sm">
      <span className="text-[var(--color-primary)]">{icon}</span>
      <span>{label}</span>
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
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-start text-xl font-black text-[var(--color-text)]">
        {locale === "fa"
          ? "تماس با مشاور"
          : locale === "de"
            ? "Anbieter kontaktieren"
            : "Contact agent"}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-lg font-black text-[var(--color-primary)]">
          {property.contact?.name?.charAt(0) || "A"}
        </div>

        <div className="min-w-0">
          <h2 className="truncate font-black text-[var(--color-text)]">
            {property.contact?.name ||
              (locale === "fa"
                ? "مشاور ملک"
                : locale === "de"
                  ? "Property Manager"
                  : "Property Manager")}
          </h2>

          <p className="text-sm font-semibold text-[var(--color-muted)]">
            {locale === "fa"
              ? "مدیر ملک"
              : locale === "de"
                ? "Property Manager"
                : "Professional Agent"}
          </p>
        </div>
      </div>

      {property.contact?.phone && (
        <a
          href={`tel:${property.contact.phone}`}
          className="mt-5 flex min-h-13 items-center justify-center gap-2 rounded-[16px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-black text-[var(--color-text)] shadow-sm"
        >
          <Phone size={18} />
          <span className="truncate">{property.contact.phone}</span>
        </a>
      )}

      <div className="mt-4 space-y-3">
        {property.contact?.email && (
          <a
            href={`mailto:${property.contact.email}`}
            className="flex h-14 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)]"
          >
            <MessageCircle size={18} />
            {locale === "fa"
              ? "پیام"
              : locale === "de"
                ? "Nachricht"
                : "Message"}
          </a>
        )}

        <a
          href={`mailto:${property.contact?.email || ""}`}
          className="flex h-14 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-accent)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)]"
        >
          <CalendarDays size={18} />
          {locale === "fa"
            ? "رزرو بازدید"
            : locale === "de"
              ? "Besichtigung buchen"
              : "Book a viewing"}
        </a>

        <FavoriteButton
          propertyId={property.id}
          variant="full"
          locale={locale}
        />
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5">
        <p className="text-start text-sm font-black text-[var(--color-text)]">
          {locale === "fa"
            ? "ارسال پیام"
            : locale === "de"
              ? "Nachricht senden"
              : "Send message"}
        </p>

        <InquiryForm property={property} locale={locale} />
      </div>
    </div>
  );
}

function getActiveFeatures(property: Property, locale: Locale) {
  const featureLabels = {
    en: {
      balcony: "Balcony",
      garden: "Garden",
      elevator: "Elevator",
      parking: "Parking",
      furnished: "Furnished",
      petsAllowed: "Pet friendly",
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

  const featureIcons = {
    balcony: <Home size={17} />,
    garden: <Home size={17} />,
    elevator: <Building2 size={17} />,
    parking: <MapPin size={17} />,
    furnished: <Sofa size={17} />,
    petsAllowed: <CheckCircle2 size={17} />,
    cellar: <Home size={17} />,
    fittedKitchen: <Home size={17} />,
  };

  const features = property.features || {};
  const labels = featureLabels[locale] || featureLabels.en;

  return Object.entries(features)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => ({
      label: labels[key as keyof typeof labels],
      icon: featureIcons[key as keyof typeof featureIcons] || (
        <CheckCircle2 size={17} />
      ),
    }))
    .filter((item) => Boolean(item.label));
}
