"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  Heart,
  Home,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  Share2,
} from "lucide-react";
import Link from "next/link";

import { getPropertyById } from "../../lib/propertyService";
import type { Property } from "../../types/property";
import LoadingScreen from "@/app/components/LoadingScreen";
import { PropertyDetailsSkeleton } from "@/app/components/Skeletons";
import FavoriteButton from "@/app/components/FavoriteButton";
import InquiryForm from "@/app/components/InquiryForm";

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperty() {
      try {
        const data = await getPropertyById(params.id);
        setProperty(data);
      } catch (error) {
        console.error(error);
        alert("Could not load property.");
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [params.id]);

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-950">
            Property not found
          </h1>
          <p className="mt-2 text-gray-500">
            This listing may be removed or not available anymore.
          </p>

          <Link
            href="/properties?type=rent"
            className="mt-6 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            Back to properties
          </Link>
        </div>
      </main>
    );
  }

  const mainImage = property.images?.[0]?.url;
  const otherImages = property.images?.slice(1, 5) || [];

  const features = [
    ["balcony", "Balcony", property.features?.balcony],
    ["garden", "Garden", property.features?.garden],
    ["elevator", "Elevator", property.features?.elevator],
    ["parking", "Parking", property.features?.parking],
    ["furnished", "Furnished", property.features?.furnished],
    ["petsAllowed", "Pets allowed", property.features?.petsAllowed],
    ["cellar", "Cellar", property.features?.cellar],
    ["fittedKitchen", "Fitted kitchen", property.features?.fittedKitchen],
  ].filter((item) => item[2]);

  return (
    <main className="min-h-screen bg-[#f7f7f4] pb-28 md:pb-10">
      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/properties?type=rent"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm"
            >
              <Share2 size={18} />
            </button>

            <div className="relative h-10 w-10">
              <FavoriteButton propertyId={property.id} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-sm">
            {mainImage ? (
              <img
                src={mainImage}
                alt={property.title}
                className="h-[340px] w-full object-cover sm:h-[460px] lg:h-[560px]"
              />
            ) : (
              <div className="flex h-[340px] items-center justify-center bg-gray-100 text-gray-400 sm:h-[460px] lg:h-[560px]">
                No image
              </div>
            )}

            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-gray-950 shadow-sm backdrop-blur-md">
              {property.listingType === "rent" ? "For rent" : "For sale"}
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-[1.5rem] bg-black/75 p-4 text-white backdrop-blur-md md:hidden">
              <p className="text-sm text-white/70">Price</p>
              <p className="text-2xl font-black">
                {property.price.toLocaleString("de-DE")} €
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {otherImages.length > 0 ? (
              otherImages.map((image) => (
                <div
                  key={image.publicId}
                  className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm"
                >
                  <img
                    src={image.url}
                    alt={property.title}
                    className="h-40 w-full object-cover sm:h-52 lg:h-full"
                  />
                </div>
              ))
            ) : (
              <>
                <div className="hidden rounded-[1.5rem] bg-white p-6 shadow-sm lg:block">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="mt-2 text-xl font-bold text-gray-950">
                    {property.location.city}
                  </p>
                  <p className="mt-1 text-gray-500">
                    {property.location.district}
                  </p>
                </div>

                <div className="hidden rounded-[1.5rem] bg-black p-6 text-white shadow-sm lg:block">
                  <p className="text-sm text-white/60">Type</p>
                  <p className="mt-2 text-xl font-bold">
                    {property.propertyType}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-gray-950 md:text-5xl">
                    {property.title}
                  </h1>

                  <div className="mt-3 flex items-center gap-2 text-gray-500">
                    <MapPin size={18} />
                    <p>
                      {property.location.city}
                      {property.location.district
                        ? `, ${property.location.district}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="hidden rounded-[1.5rem] bg-black px-5 py-4 text-right text-white md:block">
                  <p className="text-sm text-white/60">Price</p>
                  <p className="text-2xl font-black">
                    {property.price.toLocaleString("de-DE")} €
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-[1.3rem] bg-gray-50 p-4">
                  <BedDouble className="text-gray-500" size={22} />
                  <p className="mt-3 text-sm text-gray-500">Rooms</p>
                  <p className="font-bold text-gray-950">
                    {property.details.rooms}
                  </p>
                </div>

                <div className="rounded-[1.3rem] bg-gray-50 p-4">
                  <Maximize2 className="text-gray-500" size={22} />
                  <p className="mt-3 text-sm text-gray-500">Area</p>
                  <p className="font-bold text-gray-950">
                    {property.details.area} m²
                  </p>
                </div>

                <div className="rounded-[1.3rem] bg-gray-50 p-4">
                  <Bath className="text-gray-500" size={22} />
                  <p className="mt-3 text-sm text-gray-500">Bath</p>
                  <p className="font-bold text-gray-950">
                    {property.details.bathrooms || 1}
                  </p>
                </div>

                <div className="rounded-[1.3rem] bg-gray-50 p-4">
                  <Home className="text-gray-500" size={22} />
                  <p className="mt-3 text-sm text-gray-500">Type</p>
                  <p className="font-bold capitalize text-gray-950">
                    {property.propertyType}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-xl font-black text-gray-950">Description</h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                {property.description}
              </p>
            </section>

            {features.length > 0 && (
              <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
                <h2 className="text-xl font-black text-gray-950">Features</h2>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {features.map(([key, label]) => (
                    <div
                      key={String(key)}
                      className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3ead8] text-[#9a7a3d]">
                        <Check size={17} />
                      </span>
                      {label}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-xl font-black text-gray-950">
                Property details
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoRow label="City" value={property.location.city} />
                <InfoRow label="District" value={property.location.district} />
                <InfoRow
                  label="Postal code"
                  value={property.location.postalCode}
                />
                <InfoRow label="Street" value={property.location.street} />
                <InfoRow label="Floor" value={property.details.floor} />
                <InfoRow
                  label="Total floors"
                  value={property.details.totalFloors}
                />
                <InfoRow label="Bedrooms" value={property.details.bedrooms} />
                <InfoRow
                  label="Year built"
                  value={property.details.yearBuilt}
                />

                {property.listingType === "rent" && (
                  <>
                    <InfoRow
                      label="Cold rent"
                      value={
                        property.rentDetails?.coldRent
                          ? `${property.rentDetails.coldRent.toLocaleString(
                              "de-DE",
                            )} €`
                          : undefined
                      }
                    />
                    <InfoRow
                      label="Warm rent"
                      value={
                        property.rentDetails?.warmRent
                          ? `${property.rentDetails.warmRent.toLocaleString(
                              "de-DE",
                            )} €`
                          : undefined
                      }
                    />
                    <InfoRow
                      label="Deposit"
                      value={
                        property.rentDetails?.deposit
                          ? `${property.rentDetails.deposit.toLocaleString(
                              "de-DE",
                            )} €`
                          : undefined
                      }
                    />
                    <InfoRow
                      label="Available from"
                      value={property.rentDetails?.availableFrom}
                    />
                  </>
                )}

                {property.listingType === "sale" && (
                  <>
                    <InfoRow
                      label="Purchase price"
                      value={
                        property.saleDetails?.purchasePrice
                          ? `${property.saleDetails.purchasePrice.toLocaleString(
                              "de-DE",
                            )} €`
                          : undefined
                      }
                    />
                    <InfoRow
                      label="Price per m²"
                      value={
                        property.saleDetails?.pricePerSqm
                          ? `${Math.round(
                              property.saleDetails.pricePerSqm,
                            ).toLocaleString("de-DE")} €/m²`
                          : undefined
                      }
                    />
                  </>
                )}
              </div>
            </section>
            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7 lg:hidden">
              <h2 className="text-xl font-black text-gray-950">
                Contact owner
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Send a message about this property.
              </p>

              <InquiryForm property={property} />
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Price</p>
                <p className="mt-1 text-4xl font-black text-gray-950">
                  {property.price.toLocaleString("de-DE")} €
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  <CalendarDays size={18} />
                  Updated recently
                </div>
              </div>

              <ContactCard property={property} />
            </div>
          </aside>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-4 shadow-2xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-lg font-black text-gray-950">
              {property.price.toLocaleString("de-DE")} €
            </p>
          </div>

          <a
            href={`mailto:${property.contact.email}`}
            className="rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
          >
            Contact
          </a>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "" || value === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

function ContactCard({ property }: { property: Property }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-gray-950">Contact</h2>

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="font-bold text-gray-950">{property.contact.name}</p>
        <p className="mt-1 text-sm text-gray-500">Property contact person</p>
      </div>

      <div className="mt-5 space-y-3">
        <a
          href={`mailto:${property.contact.email}`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-bold text-white"
        >
          <Mail size={18} />
          Send email
        </a>

        {property.contact.phone && (
          <a
            href={`tel:${property.contact.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold text-gray-800"
          >
            <Phone size={18} />
            Call
          </a>
        )}
      </div>
      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-sm font-black text-gray-950">Send a message</p>

        <InquiryForm property={property} />
      </div>
    </div>
  );
}
