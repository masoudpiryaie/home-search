"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Home, Loader2, MapPin, Trash2 } from "lucide-react";

import FavoriteButton from "@/app/components/FavoriteButton";
import LoadingScreen from "@/app/components/LoadingScreen";
import { useAuth } from "@/app/context/AuthContext";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import { getLocalizedText } from "@/app/lib/localizedText";
import { getPropertyById } from "@/app/lib/propertyService";
import {
  getUserFavorites,
  removeFavorite,
  type Favorite,
} from "@/app/lib/services/favoriteService";
import type { Property } from "@/app/types/property";
import PropertyImage from "@/app/components/PropertyImage";

type SavedClientProps = {
  locale: Locale;
};

type SavedItem = {
  favorite: Favorite;
  property: Property;
};

export default function SavedClient({ locale }: SavedClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const t = getDictionary(locale);
  const labels = getLabels(locale);
  const isRtl = locale === "fa";

  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function loadSavedListings(userId: string) {
    setLoading(true);

    try {
      const favorites = await getUserFavorites(userId);

      const properties = await Promise.all(
        favorites.map(async (favorite) => {
          if (!favorite.propertyId) return null;

          const property = await getPropertyById(favorite.propertyId);

          if (!property) return null;

          if (property.status !== "active") return null;

          return {
            favorite,
            property,
          };
        }),
      );

      setItems(properties.filter(Boolean) as SavedItem[]);
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
      loadSavedListings(user.uid);
    }
  }, [authLoading, user, router, locale]);

  async function handleRemove(propertyId?: string) {
    if (!user || !propertyId) return;

    setRemovingId(propertyId);

    try {
      await removeFavorite(user.uid, propertyId);

      setItems((current) =>
        current.filter((item) => item.property.id !== propertyId),
      );
    } catch (error) {
      console.error(error);
      alert(labels.couldNotRemove);
    } finally {
      setRemovingId(null);
    }
  }

  if (authLoading || loading) {
    return <LoadingScreen text={labels.loading} />;
  }

  if (!user) {
    return <LoadingScreen text={labels.redirecting} />;
  }

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
                <Link
                  href={`/${locale}`}
                  className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/85 backdrop-blur-md transition hover:bg-white/25"
                >
                  <ArrowLeft size={16} />
                  {labels.backHome}
                </Link>

                <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80 backdrop-blur-md md:text-sm">
                  {labels.myAccount}
                </p>

                <h1 className="mt-4 text-[30px] font-black leading-tight tracking-[-0.04em] md:text-[46px]">
                  {t.nav.saved}
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/75 md:text-base">
                  {labels.subtitle}
                </p>
              </div>

              <div className="w-fit rounded-[22px] border border-white/10 bg-white/15 px-5 py-4 backdrop-blur-md">
                <p className="text-sm font-semibold text-white/70">
                  {labels.savedCount}
                </p>

                <p className="mt-1 text-4xl font-black">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#fffdf9] px-4 py-5 md:px-6 md:py-6">
            {items.length === 0 ? (
              <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50">
                  <Heart className="text-red-600" size={28} />
                </div>

                <p className="mt-4 text-xl font-black text-[var(--color-text)]">
                  {labels.emptyTitle}
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[var(--color-muted)]">
                  {labels.emptyText}
                </p>

                <Link
                  href={`/${locale}/properties?type=rent`}
                  className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-[17px] bg-[var(--color-primary)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
                >
                  <Home size={17} />
                  {labels.browseListings}
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map(({ property }) => (
                  <SavedListingCard
                    key={property.id}
                    property={property}
                    locale={locale}
                    removing={removingId === property.id}
                    onRemove={() => handleRemove(property.id)}
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

function SavedListingCard({
  property,
  locale,
  removing,
  onRemove,
}: {
  property: Property;
  locale: Locale;
  removing: boolean;
  onRemove: () => void;
}) {
  const labels = getLabels(locale);
  const title = getLocalizedText(property.title, locale);
  // const image = property.images?.[0]?.url;
  const href = property.slug
    ? `/${locale}/properties/${property.slug}`
    : `/${locale}/properties/${property.id}`;

  return (
    <article className="overflow-hidden rounded-[26px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(16,24,40,0.12)]">
      <div className="relative h-[220px] overflow-hidden bg-gray-100">
        {/* {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-[var(--color-muted)]">
            {labels.noImage}
          </div>
        )} */}
        <PropertyImage
          image={property.images?.[0]}
          alt={title || labels.untitled}
          size="card"
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
          fallbackText={labels.noImage}
        />

        <div className="absolute top-3 flex gap-2 ltr:right-3 rtl:left-3">
          {property.id && (
            <FavoriteButton
              propertyId={property.id}
              locale={locale}
              variant="icon"
            />
          )}
        </div>

        <div className="absolute bottom-3 ltr:left-3 rtl:right-3">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[var(--color-primary)] shadow-sm backdrop-blur-md">
            {property.listingType === "rent" ? labels.rent : labels.sale}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <Link href={href}>
          <h2 className="line-clamp-2 text-lg font-black leading-6 tracking-[-0.03em] text-[var(--color-text)] transition hover:text-[var(--color-primary)]">
            {title || labels.untitled}
          </h2>
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

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-[var(--color-muted)]">
          <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
            {property.details?.rooms || "-"} {labels.rooms}
          </span>

          <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
            {property.details?.area || "-"} m²
          </span>

          <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1.5 text-[var(--color-primary)]">
            €{property.price?.toLocaleString("de-DE") || "-"}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Link
            href={href}
            className="flex h-11 flex-1 items-center justify-center rounded-[15px] bg-[var(--color-primary)] px-4 text-xs font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
          >
            {labels.viewListing}
          </Link>

          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            aria-label={labels.remove}
          >
            {removing ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Trash2 size={17} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function getLabels(locale: Locale) {
  if (locale === "fa") {
    return {
      loading: "در حال بارگذاری آگهی‌های ذخیره‌شده...",
      redirecting: "در حال انتقال به صفحه ورود...",
      couldNotLoad: "امکان دریافت آگهی‌های ذخیره‌شده وجود ندارد.",
      couldNotRemove: "امکان حذف از ذخیره‌شده‌ها وجود ندارد.",
      backHome: "بازگشت به خانه",
      myAccount: "حساب من",
      subtitle: "آگهی‌هایی که ذخیره کرده‌ای را اینجا ببین و مدیریت کن.",
      savedCount: "تعداد ذخیره‌شده‌ها",
      emptyTitle: "هنوز آگهی ذخیره نکرده‌ای",
      emptyText: "وقتی آگهی‌ای را دوست داشتی، روی قلب بزن تا اینجا ذخیره شود.",
      browseListings: "مشاهده آگهی‌ها",
      noImage: "بدون عکس",
      rent: "اجاره",
      sale: "فروش",
      rooms: "اتاق",
      viewListing: "مشاهده آگهی",
      remove: "حذف از ذخیره‌شده‌ها",
      untitled: "بدون عنوان",
    };
  }

  if (locale === "de") {
    return {
      loading: "Gespeicherte Anzeigen werden geladen...",
      redirecting: "Weiterleitung zum Login...",
      couldNotLoad: "Gespeicherte Anzeigen konnten nicht geladen werden.",
      couldNotRemove: "Anzeige konnte nicht entfernt werden.",
      backHome: "Zurück zur Startseite",
      myAccount: "Mein Konto",
      subtitle: "Sieh und verwalte deine gespeicherten Anzeigen.",
      savedCount: "Gespeichert",
      emptyTitle: "Noch keine gespeicherten Anzeigen",
      emptyText:
        "Wenn dir eine Anzeige gefällt, tippe auf das Herz, um sie hier zu speichern.",
      browseListings: "Anzeigen ansehen",
      noImage: "Kein Bild",
      rent: "Miete",
      sale: "Kauf",
      rooms: "Zimmer",
      viewListing: "Anzeige ansehen",
      remove: "Entfernen",
      untitled: "Ohne Titel",
    };
  }

  return {
    loading: "Loading saved listings...",
    redirecting: "Redirecting to login...",
    couldNotLoad: "Could not load saved listings.",
    couldNotRemove: "Could not remove saved listing.",
    backHome: "Back home",
    myAccount: "My account",
    subtitle: "View and manage the listings you saved.",
    savedCount: "Saved listings",
    emptyTitle: "No saved listings yet",
    emptyText:
      "When you like a listing, tap the heart icon and it will appear here.",
    browseListings: "Browse listings",
    noImage: "No image",
    rent: "Rent",
    sale: "Sale",
    rooms: "rooms",
    viewListing: "View listing",
    remove: "Remove",
    untitled: "Untitled listing",
  };
}
