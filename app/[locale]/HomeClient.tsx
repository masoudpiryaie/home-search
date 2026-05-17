"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Heart, Search, SlidersHorizontal } from "lucide-react";

import { getPublicProperties } from "@/app/lib/propertyService";
import { getLocalizedText } from "@/app/lib/localizedText";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import type { Property, PropertyType } from "@/app/types/property";
import FavoriteButton from "../components/FavoriteButton";
import PropertyCard from "../components/PropertyCard";

type HomeClientProps = {
  locale: Locale;
};

const heroImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600&auto=format&fit=crop";

const fallbackImages = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=900&auto=format&fit=crop",
];

export default function HomeClient({ locale }: HomeClientProps) {
  const router = useRouter();
  const t = getDictionary(locale);
  const isRtl = locale === "fa";

  const [city, setCity] = useState("");
  const [selectedType, setSelectedType] = useState<PropertyType | "all">("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);

      try {
        const data = await getPublicProperties({
          listingType: "rent",
        });

        setProperties(data.slice(0, 8));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    if (selectedType === "all") {
      return properties;
    }

    return properties.filter(
      (property) => property.propertyType === selectedType,
    );
  }, [properties, selectedType]);

  function handleSearch() {
    const params = new URLSearchParams();

    params.set("type", "rent");

    if (city.trim()) {
      params.set("city", city.trim());
    }

    if (selectedType !== "all") {
      params.set("propertyType", selectedType);
    }

    router.push(`/${locale}/properties?${params.toString()}`);
  }

  function goToAllOffers() {
    router.push(`/${locale}/properties?type=rent`);
  }

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--color-bg)] px-3 pb-28 pt-4 md:px-5 md:pb-12 md:pt-5"
    >
      <section className="mx-auto max-w-[1488px] overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:rounded-[34px]">
        <div className="grid items-center gap-6 px-5 pb-7 pt-8 md:px-10 md:pb-10 md:pt-10 lg:min-h-[520px] lg:grid-cols-[0.82fr_1fr] lg:px-16 xl:px-20">
          <div className="max-w-[560px] text-center lg:text-start">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-sm font-black text-[var(--color-primary)]">
              <CheckCircle2 size={16} />
              {t.home.badge}
            </div>

            <h1 className="whitespace-pre-line text-[28px] font-black leading-[1.32] tracking-[-0.055em] text-[var(--color-text)] sm:text-[32px] md:text-[36px] lg:text-[48px]">
              {t.home.title}
            </h1>

            <p className="mx-auto mt-5 max-w-[500px] text-base font-semibold leading-7 text-[var(--color-text)]/80 md:text-lg lg:mx-0">
              {t.home.subtitle}
            </p>

            <div className="mt-8">
              <div className="mx-auto flex h-[66px] max-w-[540px] items-center gap-2 rounded-[24px] bg-white px-3 shadow-[0_14px_42px_rgba(16,24,40,0.10)] ring-1 ring-[var(--color-border)] lg:mx-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[var(--color-muted)]">
                  <Search size={22} />
                </div>

                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder={t.home.searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--color-text)] placeholder:text-gray-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[var(--color-primary)] bg-white text-[var(--color-text)] shadow-[0_10px_24px_rgba(34,168,107,0.16)] transition hover:bg-[var(--color-primary)] hover:text-white"
                  aria-label="Filters"
                >
                  <SlidersHorizontal size={22} />
                </button>
              </div>

              <div className="mx-auto mt-5 grid max-w-[440px] grid-cols-4 gap-2 lg:mx-0">
                <CategoryButton
                  active={selectedType === "all"}
                  onClick={() => setSelectedType("all")}
                  label={t.home.all}
                />

                <CategoryButton
                  active={selectedType === "house"}
                  onClick={() => setSelectedType("house")}
                  label={t.home.house}
                />

                <CategoryButton
                  active={selectedType === "apartment"}
                  onClick={() => setSelectedType("apartment")}
                  label={t.home.apartment}
                />

                <CategoryButton
                  active={selectedType === "room"}
                  onClick={() => setSelectedType("room")}
                  label={t.home.room}
                />
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative h-[400px] overflow-hidden rounded-[34px] bg-gray-100 xl:h-[430px]">
              <img
                src={heroImage}
                alt="Modern living room"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="bg-white px-5 pb-8 pt-3 md:px-10 md:pb-12 lg:px-16 xl:px-20">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-black tracking-[-0.03em] text-[var(--color-text)] md:text-[26px]">
              {t.home.bestOffers}
            </h2>

            <button
              type="button"
              onClick={goToAllOffers}
              className="text-sm font-black text-[var(--color-primary)] transition hover:text-[var(--color-primary-dark)]"
            >
              {t.home.seeAll}
            </button>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[280px] animate-pulse rounded-[24px] bg-gray-100"
                />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-[24px] bg-[var(--color-surface-soft)] p-8 text-center text-sm font-bold text-[var(--color-muted)]">
              {t.home.noOffers}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProperties.slice(0, 4).map((property, index) => (
                <HomeOfferCard
                  key={property.id || index}
                  property={property}
                  locale={locale}
                  fallbackImage={fallbackImages[index % fallbackImages.length]}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function CategoryButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-full px-3 text-xs font-black transition md:h-12 md:text-sm ${
        active
          ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-button)]"
          : "bg-white text-[var(--color-text)] shadow-[0_8px_24px_rgba(16,24,40,0.08)] ring-1 ring-[var(--color-border)] hover:-translate-y-0.5"
      }`}
    >
      {label}
    </button>
  );
}

function HomeOfferCard({
  property,
  locale,
  fallbackImage,
}: {
  property: Property;
  locale: Locale;
  fallbackImage: string;
}) {
  const t = getDictionary(locale);
  const title = getLocalizedText(property.title, locale);
  const image = property.images?.[0]?.url || fallbackImage;

  const propertyTypeLabel =
    property.propertyType === "house"
      ? t.home.house
      : property.propertyType === "apartment"
        ? t.home.apartment
        : property.propertyType === "room"
          ? t.home.room
          : t.home.apartment;

  return (
    <div className="grid gap-5 ">
      {" "}
      <PropertyCard key={property.id} property={property} locale={locale} />
    </div>
  );
}
