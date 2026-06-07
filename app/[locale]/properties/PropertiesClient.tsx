"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import {
  Building2,
  ChevronDown,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import PropertyCard from "@/app/components/PropertyCard";
import { PropertiesGridSkeleton } from "@/app/components/Skeletons";
import { getLocalizedText } from "@/app/lib/localizedText";
import { getPublicPropertiesPaginated } from "@/app/lib/propertyService";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import type { ListingType, Property, PropertyType } from "@/app/types/property";
import PropertyImage from "@/app/components/PropertyImage";

type SortOption = "newest" | "lowest-price" | "highest-price" | "largest-area";

type PropertiesClientProps = {
  locale: Locale;
};

const PAGE_SIZE = 9;

export default function PropertiesClient({ locale }: PropertiesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const t = getDictionary(locale);
  const isRtl = locale === "fa";

  const type = searchParams.get("type") as ListingType | null;

  const cityFromUrl = searchParams.get("city") || "";
  const minPriceFromUrl = searchParams.get("minPrice") || "";
  const maxPriceFromUrl = searchParams.get("maxPrice") || "";
  const minAreaFromUrl = searchParams.get("minArea") || "";
  const roomsFromUrl = searchParams.get("rooms") || "";
  const propertyTypeFromUrl =
    (searchParams.get("propertyType") as PropertyType | null) || "";
  const sortFromUrl =
    (searchParams.get("sort") as SortOption | null) || "newest";

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<"card" | "list">("card");

  const [city, setCity] = useState(cityFromUrl);
  const [minPrice, setMinPrice] = useState(minPriceFromUrl);
  const [maxPrice, setMaxPrice] = useState(maxPriceFromUrl);
  const [minArea, setMinArea] = useState(minAreaFromUrl);
  const [rooms, setRooms] = useState(roomsFromUrl);
  const [propertyType, setPropertyType] = useState<PropertyType | "">(
    propertyTypeFromUrl,
  );
  const [sort, setSort] = useState<SortOption>(sortFromUrl);

  function updateUrl(nextValues?: {
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    rooms?: string;
    propertyType?: string;
    sort?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (!params.get("type")) {
      params.set("type", type || "rent");
    }

    const values = {
      city,
      minPrice,
      maxPrice,
      minArea,
      rooms,
      propertyType,
      sort,
      ...nextValues,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "newest") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function resetFilters() {
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setRooms("");
    setPropertyType("");
    setSort("newest");

    const params = new URLSearchParams();
    params.set("type", type || "rent");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    setCity(cityFromUrl);
    setMinPrice(minPriceFromUrl);
    setMaxPrice(maxPriceFromUrl);
    setMinArea(minAreaFromUrl);
    setRooms(roomsFromUrl);
    setPropertyType(propertyTypeFromUrl);
    setSort(sortFromUrl);
  }, [
    cityFromUrl,
    minPriceFromUrl,
    maxPriceFromUrl,
    minAreaFromUrl,
    roomsFromUrl,
    propertyTypeFromUrl,
    sortFromUrl,
  ]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setProperties([]);
      setLastDoc(null);
      setHasMore(true);

      try {
        const result = await getPublicPropertiesPaginated({
          listingType: type || undefined,
          pageSize: PAGE_SIZE,
        });

        setProperties(result.properties);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error(error);

        alert(
          locale === "fa"
            ? "امکان دریافت آگهی‌ها وجود ندارد."
            : locale === "de"
              ? "Immobilien konnten nicht geladen werden."
              : "Could not load properties.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [type, locale]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateUrl();
    }, 500);

    return () => clearTimeout(timeout);
  }, [city, minPrice, maxPrice, minArea, rooms, propertyType, sort]);

  async function handleLoadMore() {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);

    try {
      const result = await getPublicPropertiesPaginated({
        listingType: type || undefined,
        pageSize: PAGE_SIZE,
        lastDoc,
      });

      setProperties((current) => [...current, ...result.properties]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error(error);

      alert(
        locale === "fa"
          ? "امکان دریافت آگهی‌های بیشتر وجود ندارد."
          : locale === "de"
            ? "Weitere Immobilien konnten nicht geladen werden."
            : "Could not load more properties.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (city.trim()) {
      const value = city.toLowerCase().trim();

      result = result.filter((property) => {
        const propertyCity = property.location?.city?.toLowerCase() || "";
        const district = property.location?.district?.toLowerCase() || "";
        const postalCode = property.location?.postalCode?.toLowerCase() || "";
        const street = property.location?.street?.toLowerCase() || "";

        return (
          propertyCity.includes(value) ||
          district.includes(value) ||
          postalCode.includes(value) ||
          street.includes(value)
        );
      });
    }

    if (minPrice) {
      result = result.filter(
        (property) => Number(property.price || 0) >= Number(minPrice),
      );
    }

    if (maxPrice) {
      result = result.filter(
        (property) => Number(property.price || 0) <= Number(maxPrice),
      );
    }

    if (minArea) {
      result = result.filter(
        (property) => Number(property.details?.area || 0) >= Number(minArea),
      );
    }

    if (rooms) {
      result = result.filter(
        (property) => Number(property.details?.rooms || 0) >= Number(rooms),
      );
    }

    if (propertyType) {
      result = result.filter(
        (property) => property.propertyType === propertyType,
      );
    }

    if (sort === "lowest-price") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "highest-price") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sort === "largest-area") {
      result.sort(
        (a, b) => Number(b.details?.area || 0) - Number(a.details?.area || 0),
      );
    }

    return result;
  }, [
    properties,
    city,
    minPrice,
    maxPrice,
    minArea,
    rooms,
    propertyType,
    sort,
  ]);

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--color-bg)] px-3 pb-28 pt-4 md:px-5 md:pb-14 md:pt-6"
    >
      <div className="mx-auto max-w-[1488px]">
        <section className="mb-5 overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:mb-6 md:rounded-[34px]">
          <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 py-7 text-white md:px-8 md:py-9">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[var(--color-accent)]/20 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-black text-white/80 backdrop-blur-md md:text-sm">
                  {type === "sale"
                    ? locale === "fa"
                      ? "خانه بعدی خود را بخرید"
                      : locale === "de"
                        ? "Kaufe dein nächstes Zuhause"
                        : "Buy your next home"
                    : locale === "fa"
                      ? "خانه بعدی خود را اجاره کنید"
                      : locale === "de"
                        ? "Miete dein nächstes Zuhause"
                        : "Rent your next home"}
                </p>

                <h1 className="mt-4 text-[24px] font-black leading-tight tracking-[-0.04em] md:text-[52px]">
                  {type === "sale"
                    ? t.properties.saleTitle
                    : t.properties.rentTitle}
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/70 md:text-base">
                  {type === "sale"
                    ? t.properties.saleSubtitle
                    : t.properties.rentSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#fffdf9] px-4 py-4 md:px-6 md:py-5">
            <section className="sticky top-[92px] z-40 rounded-[24px] border border-[var(--color-border)] bg-white/90 p-3 shadow-[var(--shadow-card)] backdrop-blur-xl md:top-[105px]">
              <div className="flex gap-2">
                <div className="flex h-[48px] flex-1 items-center gap-2 rounded-[18px] border border-[var(--color-border)] bg-white px-4">
                  <Search size={19} className="text-[var(--color-muted)]" />

                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder={t.properties.cityPlaceholder}
                    className="w-full bg-transparent text-xs font-semibold text-[var(--color-text)] placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters((value) => !value)}
                  className="flex h-[48px] w-[48px] items-center justify-center rounded-[18px] border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-sm md:hidden"
                  aria-label="Filters"
                >
                  <SlidersHorizontal size={22} />
                </button>
              </div>

              <div className="mt-3 hidden grid-cols-6 gap-3 md:grid">
                <FilterInput
                  value={minPrice}
                  onChange={setMinPrice}
                  placeholder={t.properties.minPrice}
                  type="number"
                />

                <FilterInput
                  value={maxPrice}
                  onChange={setMaxPrice}
                  placeholder={t.properties.maxPrice}
                  type="number"
                />

                <FilterInput
                  value={minArea}
                  onChange={setMinArea}
                  placeholder={t.properties.minArea}
                  type="number"
                />

                <FilterSelect value={rooms} onChange={setRooms}>
                  <option value="">{t.properties.rooms}</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </FilterSelect>

                <FilterSelect
                  value={propertyType}
                  onChange={(value) =>
                    setPropertyType(value as PropertyType | "")
                  }
                >
                  <option value="">{t.properties.type}</option>
                  <option value="apartment">{t.form.apartment}</option>
                  <option value="house">{t.form.house}</option>
                  <option value="studio">{t.form.studio}</option>
                  <option value="room">{t.form.room}</option>
                </FilterSelect>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[17px] border border-[var(--color-border)] bg-white px-4 text-xs font-black text-[var(--color-text)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
                >
                  <RotateCcw size={16} />
                  {t.common.reset}
                </button>
              </div>

              {showMobileFilters && (
                <div className="mt-3 grid gap-3 md:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    <FilterInput
                      value={minPrice}
                      onChange={setMinPrice}
                      placeholder={t.properties.minPrice}
                      type="number"
                    />

                    <FilterInput
                      value={maxPrice}
                      onChange={setMaxPrice}
                      placeholder={t.properties.maxPrice}
                      type="number"
                    />

                    <FilterInput
                      value={minArea}
                      onChange={setMinArea}
                      placeholder={t.properties.minArea}
                      type="number"
                    />

                    <FilterSelect value={rooms} onChange={setRooms}>
                      <option value="">{t.properties.rooms}</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </FilterSelect>
                  </div>

                  <FilterSelect
                    value={propertyType}
                    onChange={(value) =>
                      setPropertyType(value as PropertyType | "")
                    }
                  >
                    <option value="">{t.form.propertyType}</option>
                    <option value="apartment">{t.form.apartment}</option>
                    <option value="house">{t.form.house}</option>
                    <option value="studio">{t.form.studio}</option>
                    <option value="room">{t.form.room}</option>
                  </FilterSelect>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex h-[52px] items-center justify-center gap-2 rounded-[17px] border border-[var(--color-border)] bg-white px-4 text-sm font-black text-[var(--color-text)]"
                  >
                    <RotateCcw size={16} />
                    {t.common.reset}
                  </button>
                </div>
              )}
            </section>

            <div className="mb-5 mt-6 flex justify-between  gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 shadow-sm md:w-fit">
                <Building2 size={16} className="text-[var(--color-muted)]" />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="bg-transparent text-sm font-black text-[var(--color-text)]"
                >
                  <option value="newest">{t.properties.newest}</option>
                  <option value="lowest-price">
                    {t.properties.lowestPrice}
                  </option>
                  <option value="highest-price">
                    {t.properties.highestPrice}
                  </option>
                  <option value="largest-area">
                    {t.properties.largestArea}
                  </option>
                </select>

                {/* <ChevronDown size={16} className="text-[var(--color-muted)]" /> */}
              </div>
              <div className="flex items-center justify-between gap-3">
                {/* <p className="text-sm font-bold text-[var(--color-muted)]">
                  {loading
                    ? t.common.loading
                    : `${filteredProperties.length} ${t.properties.propertiesFound}`}
                </p> */}

                <div className="flex  rounded-full border border-[var(--color-border)] bg-white p-1 shadow-sm md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileViewMode("card")}
                    className={`flex h-9 w-10 items-center justify-center rounded-full transition ${
                      mobileViewMode === "card"
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-muted)]"
                    }`}
                    aria-label="Card view"
                  >
                    <LayoutGrid size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileViewMode("list")}
                    className={`flex h-9 w-10 items-center justify-center rounded-full transition ${
                      mobileViewMode === "list"
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-muted)]"
                    }`}
                    aria-label="List view"
                  >
                    <List size={19} />
                  </button>
                </div>
              </div>
            </div>

            {loading && properties.length === 0 ? (
              <PropertiesGridSkeleton />
            ) : filteredProperties.length === 0 ? (
              <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)]">
                  <Search className="text-[var(--color-primary)]" size={28} />
                </div>

                <p className="mt-4 text-xl font-black text-[var(--color-text)]">
                  {t.properties.noPropertyFound}
                </p>

                <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
                  {t.properties.tryAnotherFilter}
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-[16px] bg-[var(--color-primary)] px-6 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(7,81,91,0.22)] transition hover:bg-[var(--color-primary-dark)]"
                >
                  {t.common.reset}
                </button>
              </div>
            ) : (
              <>
                {mobileViewMode === "list" ? (
                  <>
                    <div className="grid gap-3 md:hidden">
                      {filteredProperties.map((property) => (
                        <MobilePropertyListItem
                          key={property.id}
                          property={property}
                          locale={locale}
                        />
                      ))}
                    </div>

                    <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
                      {filteredProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          locale={locale}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="inline-flex h-12 items-center justify-center rounded-[18px] bg-[var(--color-primary)] px-7 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
                    >
                      {loadingMore
                        ? locale === "fa"
                          ? "در حال دریافت..."
                          : locale === "de"
                            ? "Wird geladen..."
                            : "Loading..."
                        : locale === "fa"
                          ? "نمایش آگهی‌های بیشتر"
                          : locale === "de"
                            ? "Mehr anzeigen"
                            : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      type={type}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-[48px] w-full rounded-[17px] border border-[var(--color-border)] bg-white px-4 text-xs font-semibold text-[var(--color-text)] shadow-sm placeholder:text-gray-400"
    />
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className=" flex justify-between h-[48px] w-full rounded-[17px] border border-[var(--color-border)] bg-white px-4 text-xs font-black text-[var(--color-text)] shadow-sm"
    >
      {children}
    </select>
  );
}

function MobilePropertyListItem({
  property,
  locale,
}: {
  property: Property;
  locale: Locale;
}) {
  const title = getLocalizedText(property.title, locale);
  // const image = property.images?.[0]?.url;
  const isRtl = locale === "fa";
  const t = getDictionary(locale);
  return (
    <Link
      href={`/${locale}/properties/${property.slug}`}
      dir={isRtl ? "rtl" : "ltr"}
      className="flex gap-3 rounded-[22px]  border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-card)] transition active:scale-[0.99] rtl:grid-cols-[1fr_112px]"
    >
      <div className="h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[18px] bg-gray-100">
        {" "}
        <PropertyImage
          image={property.images?.[0]}
          alt={title || "Property image"}
          size="thumb"
          loading="lazy"
          className="h-full w-full object-cover"
          fallbackText={t.propertyDetails.noImage}
        />
      </div>

      <div className="min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-black leading-5 text-[var(--color-text)]">
            {title || "Untitled property"}
          </h3>

          <span className="shrink-0 rounded-full bg-[var(--color-primary-soft)] px-2 py-1 text-[10px] font-black text-[var(--color-primary)]">
            {property.listingType === "rent"
              ? locale === "fa"
                ? "اجاره"
                : locale === "de"
                  ? "Miete"
                  : "Rent"
              : locale === "fa"
                ? "خرید"
                : locale === "de"
                  ? "Kauf"
                  : "Buy"}
          </span>
        </div>

        <p className="mt-2 text-base font-black text-[var(--color-primary)]">
          €{property.price?.toLocaleString("de-DE")}
          {property.listingType === "rent" && (
            <span className="text-xs font-bold text-[var(--color-muted)]">
              {" "}
              / {locale === "fa" ? "ماه" : locale === "de" ? "Monat" : "month"}
            </span>
          )}
        </p>

        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-muted)]">
          {property.location?.city}
          {property.location?.district
            ? `${isRtl ? "، " : ", "}${property.location.district}`
            : ""}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-black text-[var(--color-muted)]">
          <span className="rounded-full bg-[#fffdf9] px-2 py-1 ring-1 ring-[var(--color-border)]">
            {property.details?.rooms || "-"}{" "}
            {locale === "fa" ? "اتاق" : locale === "de" ? "Zimmer" : "rooms"}
          </span>

          <span className="rounded-full bg-[#fffdf9] px-2 py-1 ring-1 ring-[var(--color-border)]">
            {property.details?.area || "-"} m²
          </span>

          <span className="rounded-full bg-[#fffdf9] px-2 py-1 ring-1 ring-[var(--color-border)]">
            {property.propertyType}
          </span>
        </div>
      </div>
    </Link>
  );
}
