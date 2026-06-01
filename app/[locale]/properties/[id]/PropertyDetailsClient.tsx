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
  ChevronLeft,
  ChevronRight,
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
  Heart,
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
  const [descExpanded, setDescExpanded] = useState(false);

  const postedAgo = formatPostedAgo(property?.createdAt, locale);

  function shouldCountView(id: string) {
    if (typeof window === "undefined") return false;
    const key = `property-view-${id}`;
    const lastViewedAt = localStorage.getItem(key);
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;
    if (lastViewedAt && now - Number(lastViewedAt) < twelveHours) return false;
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
          } catch {
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

  if (loading) return <PropertyDetailsSkeleton />;

  if (notFound || !property) {
    return (
      <main
        dir={isRtl ? "rtl" : "ltr"}
        className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4"
      >
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-6 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <Home size={22} />
          </div>
          <h1 className="mt-4 text-lg font-black text-[var(--color-text)]">
            {locale === "fa"
              ? "آگهی پیدا نشد"
              : locale === "de"
                ? "Anzeige nicht gefunden"
                : "Property not found"}
          </h1>
          <p className="mt-1.5 text-xs font-medium leading-5 text-[var(--color-muted)]">
            {locale === "fa"
              ? "این آگهی وجود ندارد یا هنوز تایید نشده است."
              : locale === "de"
                ? "Diese Anzeige existiert nicht oder wurde noch nicht freigegeben."
                : "This property does not exist or is not approved yet."}
          </p>
          <Link
            href={`/${locale}/properties?type=rent`}
            className="mt-5 inline-flex rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-black text-white shadow-[var(--shadow-button)]"
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

  const images = property.images?.length ? property.images : [];
  const imageCount = images.length || 1;
  const title = getLocalizedText(property.title, locale);
  const description = getLocalizedText(property.description, locale);
  const price = property.price?.toLocaleString("de-DE");
  const views = property.stats?.views || property.viewCount || 0;

  function nextImage() {
    if (!images.length) return;
    setActiveImageIndex((v) => (v + 1) % images.length);
  }
  function prevImage() {
    if (!images.length) return;
    setActiveImageIndex((v) => (v - 1 + images.length) % images.length);
  }
  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  const backIcon = isRtl ? (
    <ChevronRight size={18} />
  ) : (
    <ChevronLeft size={18} />
  );

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--color-bg)] pb-20 md:pb-10 md:pt-4 md:px-4"
    >
      {/* ─── Mobile: full-bleed image hero ─── */}
      <div className="relative md:hidden">
        <div
          className="relative overflow-hidden bg-gray-100"
          style={{ height: "260px" }}
        >
          <PropertyImage
            image={images[activeImageIndex]}
            alt={title || "Property image"}
            size="detail"
            loading="eager"
            className="h-full w-full object-cover"
            fallbackText={
              locale === "fa"
                ? "بدون عکس"
                : locale === "de"
                  ? "Kein Bild"
                  : "No image"
            }
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top bar */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-3 pt-safe-top pt-3">
            <Link
              href={`/${locale}/properties?type=${property.listingType}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md"
            >
              {backIcon}
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md"
              >
                <Share2 size={15} />
              </button>
              <div className="h-8 w-8">
                <FavoriteButton propertyId={property.id} locale={locale} />
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className={`absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md ${isRtl ? "right-2" : "left-2"}`}
              >
                {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <button
                type="button"
                onClick={nextImage}
                className={`absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md ${isRtl ? "left-2" : "right-2"}`}
              >
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </>
          )}

          {/* Counter */}
          <div
            className={`absolute bottom-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-md ${isRtl ? "right-3" : "left-3"}`}
          >
            <span>{images.length ? activeImageIndex + 1 : 0}</span>
            <span className="opacity-60">/</span>
            <span className="opacity-60">{imageCount}</span>
          </div>

          {/* Dot indicators */}
          {images.length > 1 && images.length <= 8 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`rounded-full transition-all ${i === activeImageIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content card — slides up over image */}
        <div className="relative -mt-4 rounded-t-[20px] bg-white px-4 pt-4 pb-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {/* Pill handle */}
          <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-gray-200" />

          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 size={11} />
              {locale === "fa"
                ? "معتبر"
                : locale === "de"
                  ? "Geprüft"
                  : "Verified"}
            </span>
            {postedAgo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-primary)]">
                {postedAgo}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
              <Eye size={11} />
              {views}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[17px] font-black leading-snug tracking-tight text-[var(--color-text)]">
            {title}
          </h1>

          {/* Location */}
          <div className="mt-1 flex items-center gap-1 text-[12px] font-medium text-[var(--color-muted)]">
            <MapPin
              size={12}
              className="shrink-0 text-[var(--color-primary)]"
            />
            <span className="truncate">
              {property.location?.city}
              {property.location?.district
                ? `, ${property.location.district}`
                : ""}
            </span>
          </div>

          {/* Price */}
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-[22px] font-black tracking-tight text-[var(--color-primary)]">
              €{price}
            </span>
            {property.listingType === "rent" && (
              <span className="text-[12px] font-medium text-[var(--color-muted)]">
                / {locale === "fa" ? "ماه" : locale === "de" ? "Monat" : "mo"}
              </span>
            )}
          </div>

          {/* Detail chips */}
          <div className="mt-3 flex gap-2">
            {property.details?.rooms && (
              <MobileChip
                icon={<BedDouble size={13} />}
                value={`${property.details.rooms}`}
                label={
                  locale === "fa" ? "اتاق" : locale === "de" ? "Zi." : "bed"
                }
              />
            )}
            {property.details?.area && (
              <MobileChip
                icon={<Maximize2 size={13} />}
                value={`${property.details.area}`}
                label="m²"
              />
            )}
            {property.details?.bathrooms && (
              <MobileChip
                icon={<Bath size={13} />}
                value={`${property.details.bathrooms}`}
                label={
                  locale === "fa" ? "حمام" : locale === "de" ? "Bad" : "bath"
                }
              />
            )}
            {property.features?.furnished && (
              <MobileChip
                icon={<Sofa size={13} />}
                value={
                  locale === "fa" ? "مبله" : locale === "de" ? "Möbl." : "Furn."
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile: remaining content ─── */}
      <div className="md:hidden bg-white px-4 pb-4 space-y-5">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-4 px-4">
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  activeImageIndex === index
                    ? "border-[var(--color-primary)]"
                    : "border-transparent opacity-60"
                }`}
              >
                <PropertyImage
                  image={image}
                  alt=""
                  size="thumb"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <h2 className="text-[14px] font-black text-[var(--color-text)]">
            {locale === "fa"
              ? "درباره این ملک"
              : locale === "de"
                ? "Über diese Immobilie"
                : "About"}
          </h2>
          <p
            className={`mt-2 text-[13px] font-medium leading-6 text-[var(--color-muted)] ${!descExpanded ? "line-clamp-4" : ""}`}
          >
            {description}
          </p>
          {description && description.length > 200 && (
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="mt-1.5 inline-flex items-center gap-0.5 text-[12px] font-bold text-[var(--color-primary)]"
            >
              {descExpanded
                ? locale === "fa"
                  ? "کمتر"
                  : locale === "de"
                    ? "Weniger"
                    : "Less"
                : locale === "fa"
                  ? "بیشتر"
                  : locale === "de"
                    ? "Mehr"
                    : "More"}
              <ChevronDown
                size={13}
                className={`transition-transform ${descExpanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Amenities */}
        {getActiveFeatures(property, locale).length > 0 && (
          <div className="border-t border-[var(--color-border)] pt-4">
            <h2 className="text-[14px] font-black text-[var(--color-text)] mb-2.5">
              {locale === "fa"
                ? "امکانات"
                : locale === "de"
                  ? "Ausstattung"
                  : "Features"}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {getActiveFeatures(property, locale).map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-gray-50 px-2.5 py-1.5 text-[12px] font-bold text-[var(--color-muted)]"
                >
                  <span className="text-[var(--color-primary)]">{f.icon}</span>
                  {f.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rent details */}
        {property.listingType === "rent" && property.rentDetails && (
          <div className="border-t border-[var(--color-border)] pt-4">
            <h2 className="text-[14px] font-black text-[var(--color-text)] mb-2.5">
              {t.form.rentDetails}
            </h2>
            <div className="grid grid-cols-2 gap-1.5">
              {property.rentDetails.coldRent && (
                <MobileInfoCard
                  label={t.form.coldRent}
                  value={`${property.rentDetails.coldRent.toLocaleString("de-DE")} €`}
                />
              )}
              {property.rentDetails.warmRent && (
                <MobileInfoCard
                  label={t.form.warmRent}
                  value={`${property.rentDetails.warmRent.toLocaleString("de-DE")} €`}
                />
              )}
              {property.rentDetails.utilities && (
                <MobileInfoCard
                  label={t.form.utilities}
                  value={`${property.rentDetails.utilities.toLocaleString("de-DE")} €`}
                />
              )}
              {property.rentDetails.deposit && (
                <MobileInfoCard
                  label={t.form.deposit}
                  value={`${property.rentDetails.deposit.toLocaleString("de-DE")} €`}
                />
              )}
              {property.rentDetails.availableFrom && (
                <MobileInfoCard
                  label={t.form.availableFrom}
                  value={property.rentDetails.availableFrom}
                  className="col-span-2"
                />
              )}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <h2 className="text-[14px] font-black text-[var(--color-text)] mb-2.5">
            {t.form.location}
          </h2>
          <div className="h-[160px] overflow-hidden rounded-xl">
            <PropertyMap
              lat={property.location?.lat}
              lng={property.location?.lng}
              locale={locale}
            />
          </div>
        </div>

        {/* Contact card (mobile) */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-black text-[var(--color-primary)]">
              {property.contact?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-[13px] font-black text-[var(--color-text)]">
                {property.contact?.name ||
                  (locale === "fa"
                    ? "مشاور ملک"
                    : locale === "de"
                      ? "Property Manager"
                      : "Property Manager")}
              </p>
              <p className="text-[11px] font-medium text-[var(--color-muted)]">
                {locale === "fa" ? "مدیر ملک" : "Professional Agent"}
              </p>
            </div>
          </div>
          <InquiryForm property={property} locale={locale} />
        </div>

        {/* Report */}
        <div className="border-t border-[var(--color-border)] pt-3 pb-1">
          <ReportPropertyButton property={property} locale={locale} />
        </div>

        {/* Similar */}
        {similarProperties.length > 0 && (
          <div className="border-t border-[var(--color-border)] pt-4">
            <h2 className="text-[14px] font-black text-[var(--color-text)] mb-2.5">
              {locale === "fa"
                ? "آگهی‌های مشابه"
                : locale === "de"
                  ? "Ähnliche Anzeigen"
                  : "Similar listings"}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
              {similarProperties.map((item) => {
                const itemTitle = getLocalizedText(item.title, locale);
                const href = item.slug
                  ? `/${locale}/properties/${item.slug}`
                  : `/${locale}/properties/${item.id}`;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="w-40 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm"
                  >
                    <div className="h-24 overflow-hidden bg-gray-100">
                      <PropertyImage
                        image={item.images?.[0]}
                        alt={itemTitle || ""}
                        size="thumb"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-2.5">
                      <h3 className="line-clamp-2 text-[12px] font-bold leading-4 text-[var(--color-text)]">
                        {itemTitle}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">
                        {item.location?.city || "-"}
                      </p>
                      <p className="mt-1 text-[13px] font-black text-[var(--color-primary)]">
                        €{Number(item.price || 0).toLocaleString("de-DE")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Desktop layout ─── */}
      <section className="mx-auto hidden max-w-[1488px] overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:block">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)]">
              <Link
                href={`/${locale}`}
                className="hover:text-[var(--color-primary)] transition"
              >
                {locale === "fa" ? "خانه" : locale === "de" ? "Start" : "Home"}
              </Link>
              <span className="opacity-40">{isRtl ? "‹" : "›"}</span>
              <Link
                href={`/${locale}/properties?type=${property.listingType}`}
                className="hover:text-[var(--color-primary)] transition"
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
              <span className="opacity-40">{isRtl ? "‹" : "›"}</span>
              <span>{property.location?.city}</span>
              {property.location?.district && (
                <>
                  <span className="opacity-40">{isRtl ? "‹" : "›"}</span>
                  <span>{property.location.district}</span>
                </>
              )}
              <span className="opacity-40">{isRtl ? "‹" : "›"}</span>
              <span className="line-clamp-1 text-[var(--color-primary)]">
                {title}
              </span>
            </div>

            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl bg-gray-100">
              <PropertyImage
                image={images[activeImageIndex]}
                alt={title || "Property image"}
                size="detail"
                loading="eager"
                className="h-[420px] w-full object-cover xl:h-[480px]"
                fallbackText={
                  locale === "fa"
                    ? "بدون عکس"
                    : locale === "de"
                      ? "Kein Bild"
                      : "No image"
                }
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className={`absolute top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--color-text)] shadow-md backdrop-blur-sm ${isRtl ? "right-3" : "left-3"}`}
                  >
                    {isRtl ? (
                      <ChevronRight size={18} />
                    ) : (
                      <ChevronLeft size={18} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className={`absolute top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--color-text)] shadow-md backdrop-blur-sm ${isRtl ? "left-3" : "right-3"}`}
                  >
                    {isRtl ? (
                      <ChevronLeft size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                </>
              )}
              <div
                className={`absolute bottom-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md ${isRtl ? "right-3" : "left-3"}`}
              >
                {images.length ? activeImageIndex + 1 : 0} / {imageCount}
              </div>
              <button
                type="button"
                className={`absolute bottom-3 hidden items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[var(--color-text)] shadow-md md:inline-flex ${isRtl ? "left-3" : "right-3"}`}
              >
                <Maximize2 size={15} />
                {locale === "fa"
                  ? "همه عکس‌ها"
                  : locale === "de"
                    ? "Alle Fotos"
                    : "All photos"}
              </button>
            </div>

            {images.length > 1 && (
              <div className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${activeImageIndex === index ? "border-[var(--color-primary)]" : "border-transparent opacity-60 hover:opacity-80"}`}
                  >
                    <PropertyImage
                      image={image}
                      alt=""
                      size="thumb"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Title row */}
            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 size={12} />
                    {locale === "fa"
                      ? "معتبر"
                      : locale === "de"
                        ? "Geprüft"
                        : "Verified"}
                  </span>
                  {postedAgo && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                      {postedAgo}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">
                    <Eye size={12} />
                    {views}{" "}
                    {locale === "fa"
                      ? "بازدید"
                      : locale === "de"
                        ? "Aufrufe"
                        : "views"}
                  </span>
                </div>
                <h1 className="text-2xl font-black leading-snug tracking-tight text-[var(--color-text)] xl:text-3xl">
                  {title}
                </h1>
                <div className="mt-1.5 flex items-center gap-1 text-sm font-medium text-[var(--color-muted)]">
                  <MapPin size={14} className="text-[var(--color-primary)]" />
                  <span>
                    {property.location?.city}
                    {property.location?.district
                      ? `, ${property.location.district}`
                      : ""}
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[var(--color-primary)] xl:text-3xl">
                    €{price}
                  </span>
                  {property.listingType === "rent" && (
                    <span className="text-sm font-medium text-[var(--color-muted)]">
                      /{" "}
                      {locale === "fa"
                        ? "ماه"
                        : locale === "de"
                          ? "Monat"
                          : "month"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="h-10 w-10">
                  <FavoriteButton propertyId={property.id} locale={locale} />
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-bold text-[var(--color-text)] shadow-sm"
                >
                  <Share2 size={15} />
                  {locale === "fa"
                    ? "اشتراک"
                    : locale === "de"
                      ? "Teilen"
                      : "Share"}
                </button>
              </div>
            </div>

            {/* Detail chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              <DetailBox
                icon={<BedDouble size={16} />}
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
                icon={<Maximize2 size={16} />}
                label={
                  locale === "fa" ? "متراژ" : locale === "de" ? "Größe" : "Size"
                }
                value={`${property.details?.area || "-"} m²`}
              />
              <DetailBox
                icon={<Bath size={16} />}
                label={
                  locale === "fa" ? "حمام" : locale === "de" ? "Bad" : "Bath"
                }
                value={property.details?.bathrooms || 1}
              />
              <DetailBox
                icon={<Sofa size={16} />}
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

            {/* About */}
            <section className="mt-5 border-t border-[var(--color-border)] pt-5">
              <h2 className="text-base font-black text-[var(--color-text)]">
                {locale === "fa"
                  ? "درباره این ملک"
                  : locale === "de"
                    ? "Über diese Immobilie"
                    : "About this property"}
              </h2>
              <p className="mt-2 max-w-3xl whitespace-pre-line text-sm font-medium leading-7 text-[var(--color-muted)]">
                {description}
              </p>
            </section>

            {/* Amenities */}
            <section className="mt-5 border-t border-[var(--color-border)] pt-5">
              <h2 className="text-base font-black text-[var(--color-text)] mb-3">
                {locale === "fa"
                  ? "امکانات"
                  : locale === "de"
                    ? "Ausstattung"
                    : "Amenities & features"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {getActiveFeatures(property, locale).map((f) => (
                  <Amenity key={f.label} icon={f.icon} label={f.label} />
                ))}
                {getActiveFeatures(property, locale).length === 0 && (
                  <p className="text-sm font-medium text-[var(--color-muted)]">
                    {locale === "fa"
                      ? "امکانات خاصی ثبت نشده است."
                      : locale === "de"
                        ? "Keine besonderen Ausstattungen angegeben."
                        : "No special features listed."}
                  </p>
                )}
              </div>
            </section>

            {/* Map */}
            <section className="mt-5 border-t border-[var(--color-border)] pt-5">
              <h2 className="text-base font-black text-[var(--color-text)] mb-3">
                {t.form.location}
              </h2>
              <div className="h-[200px] overflow-hidden rounded-2xl">
                <PropertyMap
                  lat={property.location?.lat}
                  lng={property.location?.lng}
                  locale={locale}
                />
              </div>
            </section>

            {/* Rent details */}
            {property.listingType === "rent" && property.rentDetails && (
              <section className="mt-5 border-t border-[var(--color-border)] pt-5">
                <h2 className="text-base font-black text-[var(--color-text)] mb-3">
                  {t.form.rentDetails}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  <InfoRow
                    label={t.form.coldRent}
                    value={
                      property.rentDetails.coldRent
                        ? `${property.rentDetails.coldRent.toLocaleString("de-DE")} €`
                        : "-"
                    }
                  />
                  <InfoRow
                    label={t.form.warmRent}
                    value={
                      property.rentDetails.warmRent
                        ? `${property.rentDetails.warmRent.toLocaleString("de-DE")} €`
                        : "-"
                    }
                  />
                  <InfoRow
                    label={t.form.utilities}
                    value={
                      property.rentDetails.utilities
                        ? `${property.rentDetails.utilities.toLocaleString("de-DE")} €`
                        : "-"
                    }
                  />
                  <InfoRow
                    label={t.form.deposit}
                    value={
                      property.rentDetails.deposit
                        ? `${property.rentDetails.deposit.toLocaleString("de-DE")} €`
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

            {/* Desktop inline contact (hidden on lg+) */}
            <section className="mt-5 border-t border-[var(--color-border)] pt-5 lg:hidden">
              <h2 className="text-base font-black text-[var(--color-text)] mb-1">
                {locale === "fa"
                  ? "تماس با آگهی‌دهنده"
                  : locale === "de"
                    ? "Anbieter kontaktieren"
                    : "Contact agent"}
              </h2>
              <InquiryForm property={property} locale={locale} />
            </section>

            <div className="mt-5 border-t border-[var(--color-border)] pt-4">
              <ReportPropertyButton property={property} locale={locale} />
            </div>

            {/* Similar */}
            {similarProperties.length > 0 && (
              <section className="mt-5 border-t border-[var(--color-border)] pt-5">
                <h2 className="text-base font-black text-[var(--color-text)] mb-3">
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
                        className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="h-28 overflow-hidden bg-gray-100">
                          <PropertyImage
                            image={item.images?.[0]}
                            alt={itemTitle || ""}
                            size="thumb"
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="line-clamp-2 text-xs font-black leading-4 text-[var(--color-text)]">
                            {itemTitle}
                          </h3>
                          <p className="mt-0.5 text-[11px] font-medium text-[var(--color-muted)]">
                            {item.location?.city || "-"}
                            {item.location?.district
                              ? `, ${item.location.district}`
                              : ""}
                          </p>
                          <p className="mt-1.5 text-sm font-black text-[var(--color-primary)]">
                            €{Number(item.price || 0).toLocaleString("de-DE")}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <ContactCard property={property} locale={locale} />
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
                <h3 className="text-sm font-black text-[var(--color-text)] mb-3">
                  {t.form.location}
                </h3>
                <div className="h-[220px] overflow-hidden rounded-xl">
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

      {/* ─── Mobile bottom CTA bar ─── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-white/95 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          {property.contact?.phone ? (
            <a
              href={`tel:${property.contact.phone}`}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white text-sm font-bold text-[var(--color-text)] shadow-sm"
            >
              <Phone size={16} />
              {locale === "fa" ? "تماس" : locale === "de" ? "Anrufen" : "Call"}
            </a>
          ) : (
            <a
              href={`mailto:${property.contact?.email || ""}`}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white text-sm font-bold text-[var(--color-text)] shadow-sm"
            >
              <Mail size={16} />
              {locale === "fa"
                ? "پیام"
                : locale === "de"
                  ? "Nachricht"
                  : "Message"}
            </a>
          )}
          <a
            href={`mailto:${property.contact?.email || ""}`}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] text-sm font-bold text-white shadow-[var(--shadow-button)]"
          >
            <CalendarDays size={16} />
            {locale === "fa"
              ? "رزرو بازدید"
              : locale === "de"
                ? "Besichtigung"
                : "Book viewing"}
          </a>
        </div>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function MobileChip({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-[var(--color-primary-soft)] px-2.5 py-1.5 text-[12px] font-black text-[var(--color-primary)]">
      {icon}
      <span>{value}</span>
      {label && <span className="font-medium opacity-70">{label}</span>}
    </div>
  );
}

function MobileInfoCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-gray-50 px-3 py-2.5 ${className || ""}`}
    >
      <p className="text-[11px] font-medium text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] font-black text-[var(--color-text)]">
        {value}
      </p>
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
    <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-black text-[var(--color-text)] shadow-sm">
      <span className="text-[var(--color-primary)]">{icon}</span>
      <span>{value}</span>
      <span className="text-xs font-medium text-[var(--color-muted)]">
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 shadow-sm">
      <span className="text-xs font-medium text-[var(--color-muted)]">
        {label}
      </span>
      <span className="shrink-0 text-xs font-black text-[var(--color-text)]">
        {value || "-"}
      </span>
    </div>
  );
}

function Amenity({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-bold text-[var(--color-muted)] shadow-sm">
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
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
      <p className="text-sm font-black text-[var(--color-text)]">
        {locale === "fa"
          ? "تماس با مشاور"
          : locale === "de"
            ? "Anbieter kontaktieren"
            : "Contact agent"}
      </p>

      <div className="mt-3 flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-black text-[var(--color-primary)]">
          {property.contact?.name?.charAt(0) || "A"}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black text-[var(--color-text)]">
            {property.contact?.name ||
              (locale === "fa" ? "مشاور ملک" : "Property Manager")}
          </h2>
          <p className="text-xs font-medium text-[var(--color-muted)]">
            {locale === "fa" ? "مدیر ملک" : "Professional Agent"}
          </p>
        </div>
      </div>

      {property.contact?.phone && (
        <a
          href={`tel:${property.contact.phone}`}
          className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-bold text-[var(--color-text)] shadow-sm"
        >
          <Phone size={15} />
          <span className="truncate text-sm">{property.contact.phone}</span>
        </a>
      )}

      <div className="mt-3 space-y-2">
        {property.contact?.email && (
          <a
            href={`mailto:${property.contact.email}`}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white shadow-[var(--shadow-button)]"
          >
            <MessageCircle size={15} />
            {locale === "fa"
              ? "پیام"
              : locale === "de"
                ? "Nachricht"
                : "Message"}
          </a>
        )}
        <a
          href={`mailto:${property.contact?.email || ""}`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-bold text-white shadow-[var(--shadow-button)]"
        >
          <CalendarDays size={15} />
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

      <div className="mt-4 border-t border-[var(--color-border)] pt-4">
        <p className="text-xs font-black text-[var(--color-text)] mb-2">
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
    balcony: <Home size={14} />,
    garden: <Home size={14} />,
    elevator: <Building2 size={14} />,
    parking: <MapPin size={14} />,
    furnished: <Sofa size={14} />,
    petsAllowed: <CheckCircle2 size={14} />,
    cellar: <Home size={14} />,
    fittedKitchen: <Home size={14} />,
  };
  const features = property.features || {};
  const labels = featureLabels[locale] || featureLabels.en;
  return Object.entries(features)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => ({
      label: labels[key as keyof typeof labels],
      icon: featureIcons[key as keyof typeof featureIcons] || (
        <CheckCircle2 size={14} />
      ),
    }))
    .filter((item) => Boolean(item.label));
}
