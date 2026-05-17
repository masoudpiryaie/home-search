"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import PropertyCard from "@/app/components/PropertyCard";
import { PropertiesGridSkeleton } from "@/app/components/Skeletons";
import { getPublicProperties } from "@/app/lib/propertyService";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import type { ListingType, Property, PropertyType } from "@/app/types/property";

type SortOption = "newest" | "lowest-price" | "highest-price" | "largest-area";

type PropertyFormProps = {
  initialData?: Property;
  propertyId?: string;
  mode?: "create" | "edit";
  submitMode?: "admin" | "public";
  locale?: Locale;
};

export default function PropertyForm({
  initialData,
  propertyId,
  mode = "create",
  submitMode = "admin",
  locale = "en",
}: PropertyFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const t = getDictionary(locale);

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

  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (city.trim()) {
      const value = city.toLowerCase().trim();

      result = result.filter((property) => {
        const propertyCity = property.location?.city?.toLowerCase() || "";
        const district = property.location?.district?.toLowerCase() || "";
        const postalCode = property.location?.postalCode?.toLowerCase() || "";

        return (
          propertyCity.includes(value) ||
          district.includes(value) ||
          postalCode.includes(value)
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

      try {
        const data = await getPublicProperties({
          listingType: type || undefined,
        });

        setProperties(data);
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

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">
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

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                {type === "sale"
                  ? t.properties.saleTitle
                  : t.properties.rentTitle}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
                {type === "sale"
                  ? t.properties.saleSubtitle
                  : t.properties.rentSubtitle}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-md">
              <p className="text-sm text-white/60">
                {t.properties.availableListings}
              </p>

              <p className="mt-1 text-3xl font-black">
                {loading ? "..." : filteredProperties.length}
              </p>
            </div>
          </div>
        </section>

        <section className="sticky top-[65px] z-40 mb-6 rounded-[1.7rem] border border-black/5 bg-white/90 p-3 shadow-lg shadow-black/5 backdrop-blur-xl md:top-[73px]">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3">
              <Search size={18} className="text-gray-400" />

              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t.properties.cityPlaceholder}
                className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters((value) => !value)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 md:hidden"
            >
              <SlidersHorizontal size={20} />
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
              onChange={(value) => setPropertyType(value as PropertyType | "")}
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
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
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
                className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700"
              >
                <RotateCcw size={16} />
                {t.common.reset}
              </button>
            </div>
          )}
        </section>

        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-600">
            {loading
              ? t.common.loading
              : `${filteredProperties.length} ${t.properties.propertiesFound}`}
          </p>

          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
            <Building2 size={16} className="text-gray-400" />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="bg-transparent text-sm font-semibold text-gray-700"
            >
              <option value="newest">{t.properties.newest}</option>
              <option value="lowest-price">{t.properties.lowestPrice}</option>
              <option value="highest-price">{t.properties.highestPrice}</option>
              <option value="largest-area">{t.properties.largestArea}</option>
            </select>

            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>

        {loading && properties.length === 0 ? (
          <PropertiesGridSkeleton />
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <Search className="text-gray-400" size={26} />
            </div>

            <p className="mt-4 text-lg font-bold text-gray-900">
              {t.properties.noPropertyFound}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {t.properties.tryAnotherFilter}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
            >
              {t.common.reset}
            </button>
          </div>
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
      className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
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
      className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
    >
      {children}
    </select>
  );
}
