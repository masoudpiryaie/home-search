"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  MapPin,
  PlusCircle,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import FavoriteButton from "@/app/components/FavoriteButton";
import { getPublicProperties } from "@/app/lib/propertyService";
import { getLocalizedText } from "@/app/lib/localizedText";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import type { Property, PropertyType } from "@/app/types/property";

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

  function handleSeeAll() {
    router.push(`/${locale}/properties?type=rent`);
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-3 pb-28 pt-3 md:px-5 md:pb-10 md:pt-5">
      <section
        dir={isRtl ? "rtl" : "ltr"}
        className="mx-auto max-w-[1488px] overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:rounded-[34px]"
      >
        <div className="px-4 pb-6 pt-5 md:px-8 md:pb-8 md:pt-7">
          <div
            className={`grid items-center gap-5 lg:min-h-[500px] ${
              isRtl
                ? "lg:grid-cols-[1.04fr_0.96fr]"
                : "lg:grid-cols-[0.96fr_1.04fr]"
            }`}
          >
            <HeroText
              locale={locale}
              city={city}
              setCity={setCity}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              handleSearch={handleSearch}
            />

            <HeroImage locale={locale} />
          </div>
        </div>

        <section className="bg-[#fffdf9] px-4 pb-8 pt-2 md:px-8 md:pb-12 md:pt-4">
          <div className="mb-5 flex items-center justify-between md:mb-6">
            <h2 className="relative text-[24px] font-black tracking-[-0.03em] text-[var(--color-text)] md:text-[30px]">
              {t.home.bestOffers}
              <span className="absolute -bottom-2 h-[3px] w-12 rounded-full bg-[var(--color-accent)] ltr:left-0 rtl:right-0" />
            </h2>

            <button
              type="button"
              onClick={handleSeeAll}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
            >
              {t.home.seeAll}
              {isRtl ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
            </button>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[318px] animate-pulse rounded-[24px] bg-white shadow-[var(--shadow-card)]"
                />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-[24px] bg-white p-8 text-center text-sm font-bold text-[var(--color-muted)] shadow-[var(--shadow-card)]">
              {t.home.noOffers}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProperties.slice(0, 4).map((property, index) => (
                <OfferCard
                  key={property.id || index}
                  property={property}
                  locale={locale}
                  fallbackImage={fallbackImages[index % fallbackImages.length]}
                />
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          </div>
        </section>
      </section>
    </main>
  );
}

function HeroText({
  locale,
  city,
  setCity,
  selectedType,
  setSelectedType,
  handleSearch,
}: {
  locale: Locale;
  city: string;
  setCity: (value: string) => void;
  selectedType: PropertyType | "all";
  setSelectedType: (value: PropertyType | "all") => void;
  handleSearch: () => void;
}) {
  const t = getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-[620px] px-1 py-4 text-center lg:mx-0 lg:px-6 lg:py-0 ltr:lg:text-left rtl:lg:text-right">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-xs font-black text-[var(--color-primary)] md:mb-7 md:text-sm">
        <CheckCircle2 size={17} />
        {t.home.badge}
      </div>

      <h1 className="whitespace-pre-line text-[36px] font-black leading-[1.05] tracking-[-0.045em] text-[var(--color-text)] sm:text-[48px] md:text-[54px] lg:text-[54px]">
        {t.home.title}
      </h1>

      <p className="mx-auto mt-4 max-w-[520px] text-[15px] font-medium leading-7 text-[var(--color-muted)] md:mt-5 md:text-[19px] lg:mx-0">
        {t.home.subtitle}
      </p>

      <div className="mt-7 md:mt-8">
        <div className="mx-auto flex h-[64px] max-w-[610px] items-center gap-2 rounded-[18px] border border-[var(--color-border)] bg-white px-2 shadow-[0_10px_32px_rgba(15,23,42,0.08)] md:h-[70px] md:rounded-[20px] md:px-3 lg:mx-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[var(--color-muted)]">
            <MapPin size={22} />
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
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--color-text)] placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[var(--color-primary)] text-white shadow-[0_10px_24px_rgba(7,81,91,0.28)]"
          >
            <SlidersHorizontal size={22} />
          </button>
        </div>

        <div className="mx-auto mt-4 grid max-w-[560px] grid-cols-4 gap-2 md:mt-5 md:gap-3 lg:mx-0">
          <CategoryButton
            active={selectedType === "all"}
            onClick={() => setSelectedType("all")}
            icon={<Building2 size={17} />}
            label={t.home.all}
          />

          <CategoryButton
            active={selectedType === "house"}
            onClick={() => setSelectedType("house")}
            icon={<Home size={17} />}
            label={t.home.house}
          />

          <CategoryButton
            active={selectedType === "apartment"}
            onClick={() => setSelectedType("apartment")}
            icon={<Building2 size={17} />}
            label={t.home.apartment}
          />

          <CategoryButton
            active={selectedType === "room"}
            onClick={() => setSelectedType("room")}
            icon={<Users size={17} />}
            label={t.home.room}
          />
        </div>
      </div>
    </div>
  );
}

function HeroImage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <div className="hidden lg:block">
      <div className="relative h-[410px] overflow-hidden rounded-[28px] bg-gray-100 xl:h-[500px]">
        <img
          src={heroImage}
          alt="Modern home"
          className="h-full w-full object-cover"
        />

        <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-[14px] bg-[var(--color-primary)] px-4 py-3 text-sm font-black text-white shadow-lg">
          <CheckCircle2 size={17} />
          {t.home.badge}
        </div>
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[48px] items-center justify-center gap-2 rounded-[14px] border px-2 text-xs font-black transition md:h-[54px] md:rounded-[16px] md:text-sm ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_10px_24px_rgba(7,81,91,0.22)]"
          : "border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-[0_8px_22px_rgba(15,23,42,0.05)] hover:-translate-y-0.5"
      }`}
    >
      <span className="hidden sm:inline-flex">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function OfferCard({
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
  const isRtl = locale === "fa";

  return (
    <article className="overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
      <div className="relative h-[170px] overflow-hidden bg-gray-100 md:h-[178px]">
        <img src={image} alt={title} className="h-full w-full object-cover" />

        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[var(--color-primary)] shadow-sm">
          <CheckCircle2 size={14} />
          {t.home.verified}
        </div>

        <div className="absolute right-3 top-3">
          <FavoriteButton propertyId={property.id} locale={locale} />
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <h3 className="line-clamp-1 text-[15px] font-black text-[var(--color-text)]">
          {title}
        </h3>

        <p className="mt-2 text-[15px] font-black text-[var(--color-primary)]">
          €{property.price?.toLocaleString("de-DE")}
          <span className="font-semibold text-[var(--color-muted)]">
            {" "}
            / {t.home.month}
          </span>
        </p>

        <p className="mt-2 line-clamp-1 text-xs font-semibold text-[var(--color-muted)]">
          {property.location?.city}
          {property.location?.district
            ? ` ${isRtl ? "،" : "·"} ${property.location.district}`
            : ""}
          {" · "}
          {property.details?.rooms} {t.home.rooms}
          {" · "}
          {property.details?.area} m²
        </p>
      </div>
    </article>
  );
}
