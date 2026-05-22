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
import { PropertyDetailsSkeleton } from "@/app/components/Skeletons";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import { getLocalizedText } from "@/app/lib/localizedText";
import type { Property } from "@/app/types/property";
import { formatListingDate, formatPostedAgo } from "@/app/lib/date";
import { getPropertyImageSources } from "@/app/lib/cloudinaryImage";
import {
  getPropertyById,
  incrementPropertyView,
} from "@/app/lib/propertyService";
import dynamic from "next/dynamic";
import PropertyMap from "@/app/components/PropertyMap";

type PropertyDetailsClientProps = {
  locale: Locale;
  propertyId: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600&auto=format&fit=crop";

export default function PropertyDetailsClient({
  locale,
  propertyId,
}: PropertyDetailsClientProps) {
  const t = getDictionary(locale);
  const isRtl = locale === "fa";

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // const postedDate = formatListingDate(property.createdAt, locale);
  const postedAgo = formatPostedAgo(property?.createdAt, locale);

  const activePropertyImage = property?.images?.[activeImageIndex];
  const activeSources = getPropertyImageSources(activePropertyImage?.publicId);

  const currentImage =
    activeSources.detail || activePropertyImage?.url || fallbackImage;

  function shouldCountView(propertyId: string) {
    if (typeof window === "undefined") return false;

    const key = `property-view-${propertyId}`;
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
        const data = await getPropertyById(propertyId);

        if (!data || data.status !== "active") {
          setNotFound(true);
          setProperty(null);
          return;
        }

        setProperty(data);
        if (data.id && shouldCountView(data.id)) {
          await incrementPropertyView(data.id);

          setProperty((current) =>
            current
              ? {
                  ...current,
                  viewCount: Number(current.viewCount || 0) + 1,
                }
              : current,
          );
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
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
        <div className="max-w-md rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <Home size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-[var(--color-text)]">
            {locale === "fa"
              ? "آگهی پیدا نشد"
              : locale === "de"
                ? "Anzeige nicht gefunden"
                : "Property not found"}
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
            {locale === "fa"
              ? "این آگهی وجود ندارد یا هنوز تایید نشده است."
              : locale === "de"
                ? "Diese Anzeige existiert nicht oder wurde noch nicht freigegeben."
                : "This property does not exist or is not approved yet."}
          </p>

          <Link
            href={`/${locale}/properties?type=rent`}
            className="mt-6 inline-flex rounded-[16px] bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-button)]"
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

  const images = property.images?.length
    ? property.images.map((image) => image.url)
    : [fallbackImage];

  // const currentImage = images[activeImageIndex] || fallbackImage;

  const title = getLocalizedText(property.title, locale);
  const description = getLocalizedText(property.description, locale);
  const price = property.price?.toLocaleString("de-DE");

  function nextImage() {
    setActiveImageIndex((value) => (value + 1) % images.length);
  }

  function prevImage() {
    setActiveImageIndex((value) => (value - 1 + images.length) % images.length);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--color-bg)] px-3 pb-28 pt-4 md:px-5 md:pb-12 md:pt-5"
    >
      <section className="mx-auto max-w-[1488px] overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:rounded-[34px]">
        <div className="grid gap-7 px-5 py-5 md:px-8 md:py-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="mb-5 hidden items-center gap-2 text-xs font-bold text-[var(--color-muted)] md:flex">
              <Link
                href={`/${locale}`}
                className="transition hover:text-[var(--color-primary)]"
              >
                {locale === "fa" ? "خانه" : locale === "de" ? "Start" : "Home"}
              </Link>

              <span>›</span>

              <Link
                href={`/${locale}/properties?type=${property.listingType}`}
                className="transition hover:text-[var(--color-primary)]"
              >
                {property.listingType === "rent"
                  ? locale === "fa"
                    ? "اجاره"
                    : locale === "de"
                      ? "Mieten"
                      : "Rent"
                  : locale === "fa"
                    ? "خرید"
                    : locale === "de"
                      ? "Kaufen"
                      : "Buy"}
              </Link>

              <span>›</span>

              <span>{property.location?.city}</span>

              {property.location?.district && (
                <>
                  <span>›</span>
                  <span>{property.location.district}</span>
                </>
              )}

              <span>›</span>

              <span className="line-clamp-1 text-[var(--color-primary)]">
                {title}
              </span>
            </div>

            <div className="mb-4 flex items-center justify-between md:hidden">
              <Link
                href={`/${locale}/properties?type=${property.listingType}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[var(--color-border)]"
              >
                {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </Link>

              <div className="flex items-center gap-2">
                <div className="relative h-11 w-11">
                  <FavoriteButton propertyId={property.id} locale={locale} />
                </div>

                <button
                  type="button"
                  onClick={copyLink}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--color-text)] shadow-sm ring-1 ring-[var(--color-border)]"
                >
                  <Share2 size={19} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[24px] bg-gray-100 md:rounded-[28px]">
              <img
                src={currentImage}
                srcSet={
                  activeSources.detail && activeSources.detail2x
                    ? `${activeSources.detail} 1200w, ${activeSources.detail2x} 1600w`
                    : undefined
                }
                sizes="(max-width: 768px) 100vw, 70vw"
                alt={title}
                className="h-[300px] w-full object-cover sm:h-[380px] md:h-[500px]"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-text)] shadow-md"
                  >
                    <ArrowLeft size={21} />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-text)] shadow-md"
                  >
                    <ArrowRight size={21} />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-sm font-black text-white backdrop-blur-md">
                {activeImageIndex + 1} / {images.length}
              </div>

              <button className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-[14px] bg-white px-4 py-3 text-sm font-black text-[var(--color-text)] shadow-md md:inline-flex">
                <Maximize2 size={18} />
                {locale === "fa"
                  ? "مشاهده عکس‌ها"
                  : locale === "de"
                    ? "Alle Fotos"
                    : "View all photos"}
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-[28px] font-black leading-tight tracking-[-0.045em] text-[var(--color-text)] md:text-[36px]">
                  {title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-[var(--color-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={17} />
                    {property.location?.city}
                    {property.location?.district
                      ? `, ${property.location.district}`
                      : ""}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fffdf9] px-3 py-1 text-sm font-black text-[var(--color-muted)] ring-1 ring-[var(--color-border)]">
                    <Eye size={15} />
                    {locale === "fa"
                      ? `${property.viewCount || 0} بازدید`
                      : locale === "de"
                        ? `${property.viewCount || 0} Aufrufe`
                        : `${property.viewCount || 0} views`}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-[var(--color-primary)]">
                    <CheckCircle2 size={15} />
                    {locale === "fa"
                      ? "معتبر"
                      : locale === "de"
                        ? "Geprüft"
                        : "Verified"}
                  </span>
                  {postedAgo && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-sm font-black text-[var(--color-primary)]">
                      {postedAgo}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-[30px] font-black text-[var(--color-primary)] md:text-[34px]">
                  €{price}
                  <span className="text-base font-bold text-[var(--color-muted)]">
                    {" "}
                    /{" "}
                    {locale === "fa"
                      ? "ماه"
                      : locale === "de"
                        ? "Monat"
                        : "month"}
                  </span>
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

            <div className="mt-5 grid grid-cols-4 gap-2 md:flex md:flex-wrap md:gap-3">
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
                  locale === "fa" ? "متراژ" : locale === "de" ? "Größe" : "Size"
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
                icon={<Sofa size={20} />}
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

            <section className="mt-7 border-t border-[var(--color-border)] pt-6">
              <h2 className="text-[22px] font-black tracking-[-0.03em] text-[var(--color-text)]">
                {locale === "fa"
                  ? "درباره این ملک"
                  : locale === "de"
                    ? "Über diese Immobilie"
                    : "About this property"}
              </h2>

              <p className="mt-3 max-w-3xl whitespace-pre-line text-sm font-semibold leading-7 text-[var(--color-muted)] md:text-base">
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

            <section className="mt-7 border-t border-[var(--color-border)] pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[22px] font-black tracking-[-0.03em] text-[var(--color-text)]">
                  {locale === "fa"
                    ? "امکانات"
                    : locale === "de"
                      ? "Ausstattung"
                      : "Amenities & features"}
                </h2>

                <button className="text-sm font-black text-[var(--color-primary)] md:hidden">
                  {locale === "fa"
                    ? "مشاهده همه"
                    : locale === "de"
                      ? "Alle ansehen"
                      : "See all"}
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
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

            <section className="mt-7 border-t border-[var(--color-border)] pt-6">
              <h2 className="mb-4 text-[22px] font-black tracking-[-0.03em] text-[var(--color-text)]">
                {t.form.location}
              </h2>
              <div className="h-[170px] overflow-hidden rounded-[22px] md:h-[230px]">
                <PropertyMap
                  lat={property.location?.lat}
                  lng={property.location?.lng}
                  locale={locale}
                />
              </div>
            </section>

            {property.listingType === "rent" && property.rentDetails && (
              <section className="mt-7 border-t border-[var(--color-border)] pt-6">
                <h2 className="text-[22px] font-black tracking-[-0.03em] text-[var(--color-text)]">
                  {t.form.rentDetails}
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

            <section className="mt-7 border-t border-[var(--color-border)] pt-6 lg:hidden">
              <h2 className="text-[22px] font-black tracking-[-0.03em] text-[var(--color-text)]">
                {locale === "fa"
                  ? "تماس با آگهی‌دهنده"
                  : locale === "de"
                    ? "Anbieter kontaktieren"
                    : "Contact agent"}
              </h2>

              <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
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
            <div className="sticky top-28 space-y-5">
              <ContactCard property={property} locale={locale} />

              <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
                <h3 className="text-xl font-black text-[var(--color-text)]">
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

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white/95 px-4 py-3 shadow-[0_-12px_35px_rgba(16,24,40,0.10)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          {property.contact?.phone ? (
            <a
              href={`tel:${property.contact.phone}`}
              className="flex h-14 items-center justify-center gap-2 rounded-[16px] border border-[var(--color-border)] bg-white text-sm font-black text-[var(--color-text)] shadow-sm"
            >
              <Phone size={19} />
              {locale === "fa" ? "تماس" : locale === "de" ? "Anrufen" : "Call"}
            </a>
          ) : (
            <a
              href={`mailto:${property.contact?.email || ""}`}
              className="flex h-14 items-center justify-center gap-2 rounded-[16px] border border-[var(--color-border)] bg-white text-sm font-black text-[var(--color-text)] shadow-sm"
            >
              <Mail size={19} />
              {locale === "fa"
                ? "پیام"
                : locale === "de"
                  ? "Nachricht"
                  : "Message"}
            </a>
          )}

          <a
            href={`mailto:${property.contact?.email || ""}`}
            className="flex h-14 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-accent)] text-sm font-black text-white shadow-[var(--shadow-button)]"
          >
            <CalendarDays size={19} />
            {locale === "fa"
              ? "رزرو بازدید"
              : locale === "de"
                ? "Besichtigung"
                : "Book a viewing"}
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
    <div className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-[16px] border border-[var(--color-border)] bg-white px-2 text-center text-xs font-black text-[var(--color-text)] shadow-sm md:min-h-[64px] md:min-w-[128px] md:flex-row md:gap-3 md:px-4">
      <span className="text-[var(--color-primary)]">{icon}</span>

      <span>{value}</span>

      <span className="text-[11px] font-bold text-[var(--color-muted)] md:hidden">
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm">
      <span className="text-sm font-bold text-[var(--color-muted)]">
        {label}
      </span>

      <span className="text-sm font-black text-[var(--color-text)]">
        {value || "-"}
      </span>
    </div>
  );
}

function Amenity({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-black text-[var(--color-muted)] shadow-sm">
      <span className="text-[var(--color-primary)]">{icon}</span>
      {label}
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
      <p className="text-xl font-black text-[var(--color-text)]">
        {locale === "fa"
          ? "تماس با مشاور"
          : locale === "de"
            ? "Anbieter kontaktieren"
            : "Contact agent"}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-lg font-black text-[var(--color-primary)]">
          {property.contact?.name?.charAt(0) || "A"}
        </div>

        <div>
          <h2 className="font-black text-[var(--color-text)]">
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
          className="mt-5 flex h-13 items-center justify-center gap-2 rounded-[16px] border border-[var(--color-border)] bg-white px-4 py-4 text-sm font-black text-[var(--color-text)] shadow-sm"
        >
          <Phone size={18} />
          {property.contact.phone}
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
        <p className="text-sm font-black text-[var(--color-text)]">
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
      petsAllowed: "Pet friendly",
      cellar: "Cellar",
      fittedKitchen: "Dishwasher",
      wifi: "Wi-Fi",
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
      wifi: "وای‌فای",
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
      wifi: "WLAN",
    },
  };

  const featureIcons = {
    balcony: <Home size={18} />,
    garden: <Home size={18} />,
    elevator: <Building2 size={18} />,
    parking: <MapPin size={18} />,
    furnished: <Sofa size={18} />,
    petsAllowed: <CheckCircle2 size={18} />,
    cellar: <Home size={18} />,
    fittedKitchen: <Home size={18} />,
    wifi: <Wifi size={18} />,
  };

  const features = property.features || {};
  const labels = featureLabels[locale] || featureLabels.en;

  const activeFeatures = Object.entries(features)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => ({
      label: labels[key as keyof typeof labels],
      icon: featureIcons[key as keyof typeof featureIcons] || (
        <CheckCircle2 size={18} />
      ),
    }))
    .filter((item) => Boolean(item.label));

  return [
    ...activeFeatures,
    {
      label: labels.wifi,
      icon: featureIcons.wifi,
    },
  ];
}
