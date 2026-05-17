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
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">
                {labels.smallTitle}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                {t.nav.saved}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
                {labels.subtitle}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-md">
              <p className="text-sm text-white/60">{labels.savedListings}</p>
              <p className="mt-1 text-3xl font-black">
                {loading ? "..." : savedProperties.length}
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <PropertiesGridSkeleton />
        ) : savedProperties.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Heart className="text-red-500" size={26} />
            </div>

            <p className="mt-4 text-lg font-bold text-gray-900">
              {labels.emptyTitle}
            </p>

            <p className="mt-2 text-sm text-gray-500">{labels.emptyText}</p>

            <Link
              href={`/${locale}/properties?type=rent`}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
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
