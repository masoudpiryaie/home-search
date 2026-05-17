"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Search } from "lucide-react";

import PropertyCard from "../components/PropertyCard";
import { PropertiesGridSkeleton } from "../components/Skeletons";
import { getProperties } from "../lib/propertyService";
import { getFavoriteIds } from "../lib/favorites";
import type { Property } from "../types/property";

export default function SavedPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    try {
      const ids = getFavoriteIds();
      setFavoriteIds(ids);

      const data = await getProperties();
      setProperties(data.filter((item) => item.status === "active"));
    } catch (error) {
      console.error(error);
      alert("Could not load saved properties.");
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
                Your saved homes
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                Saved properties
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
                Keep your favorite listings here and review them later.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-md">
              <p className="text-sm text-white/60">Saved listings</p>
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
              No saved properties yet
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Tap the heart icon on any property to save it here.
            </p>

            <Link
              href="/properties?type=rent"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
            >
              <Search size={17} />
              Browse properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
