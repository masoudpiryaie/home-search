"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">
                {labels.myAccount}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                {t.nav.myListings}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
                {labels.subtitle}
              </p>
            </div>

            <Link
              href={`/${locale}/submit-property`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black transition hover:bg-gray-100"
            >
              <PlusCircle size={18} />
              {labels.submitNew}
            </Link>
          </div>
        </section>

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
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <Home className="text-gray-400" size={26} />
            </div>

            <p className="mt-4 text-lg font-bold text-gray-950">
              {labels.noListings}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {labels.noListingsText}
            </p>

            <Link
              href={`/${locale}/submit-property`}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
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
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.7rem] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-gray-950">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-900">
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
    <div className="rounded-[1.7rem] bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 md:h-28 md:w-36">
          {mainImage ? (
            <img
              src={mainImage}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              {labels.noImage}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="line-clamp-1 text-base font-black text-gray-950 md:text-lg">
                {title}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {property.location?.city}
                {property.location?.district
                  ? `, ${property.location.district}`
                  : ""}
              </p>
            </div>

            <StatusBadge status={property.status} locale={locale} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-600">
            <span className="rounded-full bg-gray-50 px-3 py-1 capitalize">
              {getListingTypeLabel(property.listingType, locale)}
            </span>

            <span className="rounded-full bg-gray-50 px-3 py-1 capitalize">
              {getPropertyTypeLabel(property.propertyType, locale)}
            </span>

            <span className="rounded-full bg-gray-50 px-3 py-1">
              {property.details?.area} m²
            </span>

            <span className="rounded-full bg-gray-50 px-3 py-1">
              {property.details?.rooms} {labels.rooms}
            </span>

            <span className="rounded-full bg-gray-50 px-3 py-1">
              {property.price?.toLocaleString("de-DE")} €
            </span>
          </div>

          {property.status === "pending" && (
            <p className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-xs font-bold leading-5 text-orange-700">
              {labels.pendingText}
            </p>
          )}

          {property.status === "rejected" && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700">
              <p>{labels.rejectedText}</p>

              {property.review?.note && (
                <p className="mt-1 font-medium">{property.review.note}</p>
              )}
            </div>
          )}

          {property.status === "active" && property.id && (
            <Link
              href={`/${locale}/properties/${property.id}`}
              className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-xs font-bold text-white"
            >
              {labels.viewLive}
            </Link>
          )}
        </div>
      </div>
    </div>
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
      className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-bold capitalize ${className}`}
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
