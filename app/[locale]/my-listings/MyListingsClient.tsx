"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Home,
  PlusCircle,
  XCircle,
} from "lucide-react";

import LoadingScreen from "@/app/components/LoadingScreen";
import { getMyProperties } from "@/app/lib/propertyService";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import { useAuth } from "@/app/context/AuthContext";
import type { Property } from "@/app/types/property";
import { getLocalizedText } from "@/app/lib/localizedText";

type MyListingsClientProps = {
  locale: Locale;
};

export default function MyListingsClient({ locale }: MyListingsClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = getDictionary(locale);
  const labels = getLabels(locale);
  const isRtl = locale === "fa";

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMyProperties(userId: string) {
    setLoading(true);

    try {
      const data = await getMyProperties(userId);
      setProperties(data);
    } catch (error) {
      console.error(error);
      alert(labels.couldNotLoad);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }

    if (!authLoading && user) {
      loadMyProperties(user.uid);
    }
  }, [authLoading, user, router, locale]);

  if (authLoading || loading) {
    return <LoadingScreen text={labels.loading} />;
  }

  if (!user) {
    return <LoadingScreen text={labels.redirecting} />;
  }

  const pendingCount = properties.filter(
    (item) => item.status === "pending",
  ).length;

  const activeCount = properties.filter(
    (item) => item.status === "active",
  ).length;

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--color-bg)] px-3 pb-28 pt-4 md:px-5 md:pb-14 md:pt-6"
    >
      <div className="mx-auto max-w-[1488px]">
        <section className="mb-5 overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:mb-6 md:rounded-[34px]">
          <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 py-7 text-white md:px-8 md:py-9">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80 backdrop-blur-md md:text-sm">
                  {labels.myAccount}
                </p>

                <h1 className="mt-4 text-[30px] font-black leading-tight tracking-[-0.04em] md:text-[46px]">
                  {t.nav.myListings}
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/75 md:text-base">
                  {labels.subtitle}
                </p>
              </div>

              <Link
                href={`/${locale}/submit-property`}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[18px] bg-white px-5 text-sm font-black text-[var(--color-primary)] shadow-[0_14px_34px_rgba(16,24,40,0.16)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)]"
              >
                <PlusCircle size={18} />
                {labels.submitNew}
              </Link>
            </div>
          </div>

          <div className="bg-[#fffdf9] px-4 py-5 md:px-6 md:py-6">
            <section className="mb-6 grid gap-3 sm:grid-cols-3">
              <StatCard
                label={labels.total}
                value={properties.length}
                icon={<Building2 size={22} />}
              />

              <StatCard
                label={labels.pending}
                value={pendingCount}
                icon={<Clock3 size={22} />}
              />

              <StatCard
                label={labels.active}
                value={activeCount}
                icon={<CheckCircle2 size={22} />}
              />
            </section>

            {properties.length === 0 ? (
              <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)]">
                  <Home className="text-[var(--color-primary)]" size={28} />
                </div>

                <p className="mt-4 text-xl font-black text-[var(--color-text)]">
                  {labels.noListings}
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[var(--color-muted)]">
                  {labels.noListingsText}
                </p>

                <Link
                  href={`/${locale}/submit-property`}
                  className="mt-6 inline-flex h-13 items-center justify-center gap-2 rounded-[17px] bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
                >
                  <PlusCircle size={17} />
                  {t.nav.submitProperty}
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {properties.map((property) => (
                  <MyListingCard
                    key={property.id}
                    property={property}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--color-muted)]">{label}</p>

          <p className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--color-text)]">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MyListingCard({
  property,
  locale,
}: {
  property: Property;
  locale: Locale;
}) {
  const mainImage = property.images?.[0]?.url;
  const labels = getLabels(locale);
  const title = getLocalizedText(property.title, locale);

  return (
    <article className="rounded-[26px] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(16,24,40,0.12)] md:p-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="h-44 w-full shrink-0 overflow-hidden rounded-[22px] bg-gray-100 md:h-32 md:w-44">
          {mainImage ? (
            <img
              src={mainImage}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--color-muted)]">
              {labels.noImage}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 px-1 pb-1 md:px-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="line-clamp-1 text-lg font-black tracking-[-0.02em] text-[var(--color-text)]">
                {title}
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--color-muted)]">
                {property.location?.city}
                {property.location?.district
                  ? `, ${property.location.district}`
                  : ""}
              </p>
            </div>

            <StatusBadge status={property.status} locale={locale} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[var(--color-text)]/75">
            <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 capitalize ring-1 ring-[var(--color-border)]">
              {getListingTypeLabel(property.listingType, locale)}
            </span>

            <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 capitalize ring-1 ring-[var(--color-border)]">
              {getPropertyTypeLabel(property.propertyType, locale)}
            </span>

            <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
              {property.details?.area} m²
            </span>

            <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
              {property.details?.rooms} {labels.rooms}
            </span>

            <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1.5 text-[var(--color-primary)]">
              {property.price?.toLocaleString("de-DE")} €
            </span>
          </div>

          {property.status === "pending" && (
            <p className="mt-4 rounded-[18px] bg-orange-50 px-4 py-3 text-xs font-bold leading-5 text-orange-700">
              {labels.pendingText}
            </p>
          )}

          {property.status === "rejected" && (
            <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700">
              <p>{labels.rejectedText}</p>

              {property.review?.note && (
                <p className="mt-1 font-medium">{property.review.note}</p>
              )}
            </div>
          )}

          {property.status === "active" && property.id && (
            <Link
              href={`/${locale}/properties/${property.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-[15px] bg-[var(--color-primary)] px-4 py-2.5 text-xs font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
            >
              <Eye size={15} />
              {labels.viewLive}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
  locale,
}: {
  status: Property["status"];
  locale: Locale;
}) {
  const className =
    status === "active"
      ? "bg-green-50 text-green-700"
      : status === "pending"
        ? "bg-orange-50 text-orange-700"
        : status === "rejected"
          ? "bg-red-50 text-red-700"
          : status === "draft"
            ? "bg-yellow-50 text-yellow-700"
            : status === "rented"
              ? "bg-blue-50 text-blue-700"
              : status === "sold"
                ? "bg-purple-50 text-purple-700"
                : "bg-gray-100 text-gray-600";

  const Icon =
    status === "active"
      ? CheckCircle2
      : status === "pending"
        ? Clock3
        : status === "rejected"
          ? XCircle
          : Clock3;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black capitalize ${className}`}
    >
      <Icon size={14} />
      {getStatusLabel(status, locale)}
    </span>
  );
}

function getListingTypeLabel(type: Property["listingType"], locale: Locale) {
  if (locale === "fa") {
    return type === "rent" ? "اجاره" : "فروش";
  }

  if (locale === "de") {
    return type === "rent" ? "Miete" : "Kauf";
  }

  return type === "rent" ? "Rent" : "Sale";
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

function getStatusLabel(status: Property["status"], locale: Locale) {
  const labels = {
    en: {
      pending: "Pending",
      draft: "Draft",
      active: "Active",
      inactive: "Inactive",
      rejected: "Rejected",
      rented: "Rented",
      sold: "Sold",
    },
    fa: {
      pending: "در انتظار بررسی",
      draft: "پیش‌نویس",
      active: "فعال",
      inactive: "غیرفعال",
      rejected: "رد شده",
      rented: "اجاره رفته",
      sold: "فروخته شده",
    },
    de: {
      pending: "Wartet",
      draft: "Entwurf",
      active: "Aktiv",
      inactive: "Inaktiv",
      rejected: "Abgelehnt",
      rented: "Vermietet",
      sold: "Verkauft",
    },
  };

  return labels[locale][status] || labels.en[status];
}

function getLabels(locale: Locale) {
  if (locale === "fa") {
    return {
      loading: "در حال بارگذاری آگهی‌های شما...",
      redirecting: "در حال انتقال به صفحه ورود...",
      couldNotLoad: "امکان دریافت آگهی‌های شما وجود ندارد.",
      myAccount: "حساب من",
      subtitle: "وضعیت آگهی‌هایی که برای بررسی ارسال کرده‌ای را ببین.",
      submitNew: "ثبت آگهی جدید",
      total: "همه",
      pending: "در انتظار بررسی",
      active: "فعال",
      noListings: "هنوز آگهی‌ای نداری",
      noListingsText: "اولین آگهی خود را ثبت کن تا اینجا نمایش داده شود.",
      noImage: "بدون عکس",
      rooms: "اتاق",
      pendingText: "آگهی شما در انتظار بررسی ادمین است.",
      rejectedText: "آگهی شما رد شده است.",
      viewLive: "مشاهده آگهی فعال",
    };
  }

  if (locale === "de") {
    return {
      loading: "Deine Anzeigen werden geladen...",
      redirecting: "Weiterleitung zum Login...",
      couldNotLoad: "Deine Anzeigen konnten nicht geladen werden.",
      myAccount: "Mein Konto",
      subtitle: "Verfolge den Status deiner eingereichten Anzeigen.",
      submitNew: "Neue Anzeige aufgeben",
      total: "Gesamt",
      pending: "Wartet",
      active: "Aktiv",
      noListings: "Du hast noch keine Anzeigen",
      noListingsText: "Gib deine erste Anzeige auf, dann erscheint sie hier.",
      noImage: "Kein Bild",
      rooms: "Zimmer",
      pendingText: "Deine Anzeige wartet auf die Admin-Prüfung.",
      rejectedText: "Deine Anzeige wurde abgelehnt.",
      viewLive: "Live-Anzeige ansehen",
    };
  }

  return {
    loading: "Loading your listings...",
    redirecting: "Redirecting to login...",
    couldNotLoad: "Could not load your listings.",
    myAccount: "My account",
    subtitle: "Track the status of properties you submitted for review.",
    submitNew: "Submit new listing",
    total: "Total",
    pending: "Pending",
    active: "Active",
    noListings: "You have no listings yet",
    noListingsText: "Submit your first property and it will appear here.",
    noImage: "No image",
    rooms: "rooms",
    pendingText: "Your listing is waiting for admin review.",
    rejectedText: "Your listing was rejected.",
    viewLive: "View live listing",
  };
}
