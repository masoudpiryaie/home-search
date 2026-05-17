"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Home, MapPin, Search } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("");

  function handleSearch(type: "rent" | "sale") {
    const params = new URLSearchParams();

    params.set("type", type);

    if (city.trim()) {
      params.set("city", city.trim());
    }

    router.push(`/properties?${params.toString()}`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f4]">
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 md:px-6 md:pb-20 md:pt-16">
        <div className="absolute right-[-120px] top-10 h-72 w-72 rounded-full bg-[#f3ead8] blur-3xl md:h-96 md:w-96" />
        <div className="absolute left-[-120px] top-80 h-72 w-72 rounded-full bg-white blur-3xl md:h-96 md:w-96" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#c7a76c]" />
              Find homes in Germany
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-gray-950 sm:text-5xl md:text-7xl">
              Find a better place to live.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              Search modern apartments and houses for rent or sale. Simple
              filters, clear information, and a smooth mobile experience.
            </p>

            <div className="mt-7 rounded-[2rem] border border-black/5 bg-white p-3 shadow-xl shadow-black/5 md:max-w-2xl">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
                  <MapPin className="text-gray-500" size={20} />

                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch("rent");
                      }
                    }}
                    placeholder="City, district, or postcode"
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSearch("rent")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  <Search size={18} />
                  Rent
                </button>

                <button
                  type="button"
                  onClick={() => handleSearch("sale")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#c7a76c] px-5 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Buy
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-xl">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-950">250+</p>
                <p className="mt-1 text-xs text-gray-500">Listings</p>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-950">18</p>
                <p className="mt-1 text-xs text-gray-500">Cities</p>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-950">24/7</p>
                <p className="mt-1 text-xs text-gray-500">Search</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto max-w-md rounded-[2.5rem] bg-white p-3 shadow-2xl shadow-black/10 md:max-w-lg">
              <div className="overflow-hidden rounded-[2rem]">
                <img
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop"
                  alt="Modern apartment"
                  className="h-[420px] w-full object-cover md:h-[560px]"
                />
              </div>

              <div className="absolute bottom-8 left-7 right-7 rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      Modern apartment
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Berlin Mitte · 2 rooms · 64 m²
                    </p>
                  </div>

                  <p className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    €1,450
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -left-3 top-8 hidden rounded-3xl bg-white p-4 shadow-xl md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3ead8]">
                  <Building2 className="text-[#9a7a3d]" size={22} />
                </div>

                <div>
                  <p className="text-sm font-bold">Verified homes</p>
                  <p className="text-xs text-gray-500">Clean listing data</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 bottom-28 hidden rounded-3xl bg-black p-4 text-white shadow-xl md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Home size={22} />
                </div>

                <div>
                  <p className="text-sm font-bold">Rent or buy</p>
                  <p className="text-xs text-white/60">All in one place</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
