"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Search } from "lucide-react";

import PropertyCard from "@/app/components/PropertyCard";
import { PropertiesGridSkeleton } from "@/app/components/Skeletons";
import { getPublicProperties } from "@/app/lib/propertyService";
import { getFavoriteIds } from "@/app/lib/favorites";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import type { Property } from "@/app/types/property";

type SavedClientProps = {
  locale: Locale;
};

export default function SavedClient({ locale }: SavedClientProps) {
  const t = getDictionary(locale);
  const labels = getLabels(locale);
  const isRtl = locale === "fa";

  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    try {
      const ids = getFavoriteIds();
      setFavoriteIds(ids);

      const data = await getPublicProperties();
      setProperties(data);
    } catch (error) {
      console.error(error);
      alert(labels.couldNotLoad);
    } finally {
      setLoading(false);
    }
  }

  const savedProperties = useMemo(() => {
    return properties.filter((property) =>
      property.id ? favoriteIds.includes(property.id) : false,
    );
  }, [properties, favoriteIds]);

  useEffect(() => {
    loadData();

    function handleUpdate() {
      setFavoriteIds(getFavoriteIds());
    }

    window.addEventListener("favorites-updated", handleUpdate);

    return () => {
      window.removeEventListener("favorites-updated", handleUpdate);
    };
  }, []);

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
                  {labels.smallTitle}
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
                  {labels.savedListings}
                </p>

                <p className="mt-1 text-4xl font-black">
                  {loading ? "..." : savedProperties.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#fffdf9] px-4 py-5 md:px-6 md:py-6">
            {loading ? (
              <PropertiesGridSkeleton />
            ) : savedProperties.length === 0 ? (
              <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)]">
                  <Heart className="text-[var(--color-primary)]" size={28} />
                </div>

                <p className="mt-4 text-xl font-black text-[var(--color-text)]">
                  {labels.emptyTitle}
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[var(--color-muted)]">
                  {labels.emptyText}
                </p>

                <Link
                  href={`/${locale}/properties?type=rent`}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-[17px] bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
                >
                  <Search size={17} />
                  {labels.browse}
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {savedProperties.map((property) => (
                  <PropertyCard
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

function getLabels(locale: Locale) {
  if (locale === "fa") {
    return {
      smallTitle: "خانه‌های ذخیره‌شده شما",
      subtitle:
        "آگهی‌های مورد علاقه خود را اینجا نگه دار و بعداً دوباره بررسی کن.",
      savedListings: "آگهی ذخیره‌شده",
      emptyTitle: "هنوز آگهی‌ای ذخیره نکرده‌ای",
      emptyText: "روی آیکن قلب در هر آگهی بزن تا آن را اینجا ذخیره کنی.",
      browse: "مشاهده آگهی‌ها",
      couldNotLoad: "امکان دریافت آگهی‌های ذخیره‌شده وجود ندارد.",
    };
  }

  if (locale === "de") {
    return {
      smallTitle: "Deine gespeicherten Wohnungen",
      subtitle:
        "Speichere interessante Anzeigen hier und prüfe sie später noch einmal.",
      savedListings: "Gespeicherte Anzeigen",
      emptyTitle: "Noch keine Anzeigen gespeichert",
      emptyText:
        "Tippe auf das Herz-Symbol einer Anzeige, um sie hier zu speichern.",
      browse: "Anzeigen ansehen",
      couldNotLoad: "Gespeicherte Anzeigen konnten nicht geladen werden.",
    };
  }

  return {
    smallTitle: "Your saved homes",
    subtitle: "Keep your favorite listings here and review them later.",
    savedListings: "Saved listings",
    emptyTitle: "No saved properties yet",
    emptyText: "Tap the heart icon on any property to save it here.",
    browse: "Browse properties",
    couldNotLoad: "Could not load saved properties.",
  };
}
