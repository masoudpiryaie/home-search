"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Home, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Property } from "@/app/types/property";
import LoadingScreen from "@/app/components/LoadingScreen";
import {
  approveProperty,
  deleteProperty,
  getProperties,
  rejectProperty,
} from "@/app/lib/propertyService";
import {
  AdminListSkeleton,
  PropertiesGridSkeleton,
} from "@/app/components/Skeletons";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProperties() {
    setLoading(true);

    try {
      const data = await getProperties();
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error(error);
      alert("Could not load properties.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;

    const confirmed = confirm("Are you sure you want to delete this property?");
    if (!confirmed) return;

    try {
      await deleteProperty(id);
      await loadProperties();
    } catch (error) {
      console.error(error);
      alert("Could not delete property.");
    }
  }

  function handleSearch(value: string) {
    setSearch(value);

    const lowerValue = value.toLowerCase();

    const result = properties.filter((property) => {
      const title = property.title?.toLowerCase() || "";
      const city = property.location?.city?.toLowerCase() || "";
      const district = property.location?.district?.toLowerCase() || "";
      const status = property.status?.toLowerCase() || "";
      const listingType = property.listingType?.toLowerCase() || "";

      return (
        title.includes(lowerValue) ||
        city.includes(lowerValue) ||
        district.includes(lowerValue) ||
        status.includes(lowerValue) ||
        listingType.includes(lowerValue)
      );
    });

    setFilteredProperties(result);
  }

  useEffect(() => {
    loadProperties();
  }, []);

  if (loading) {
    return <AdminListSkeleton />;
  }

  async function handleApprove(id?: string) {
    if (!id) return;

    try {
      await approveProperty(id);
      await loadProperties();
    } catch (error) {
      console.error(error);
      alert("Could not approve property.");
    }
  }

  async function handleReject(id?: string) {
    if (!id) return;

    const note = prompt("Why do you want to reject this listing?") || "";

    try {
      await rejectProperty(id, note);
      await loadProperties();
    } catch (error) {
      console.error(error);
      alert("Could not reject property.");
    }
  }

  return (
    <main className="px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">
                Admin dashboard
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                Manage properties
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
                Create, review, edit, and delete your property listings.
              </p>
            </div>

            <Link
              href="/admin/properties/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black transition hover:bg-gray-100"
            >
              <Plus size={18} />
              New property
            </Link>
          </div>
        </section>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={properties.length} />

          <StatCard
            label="Active"
            value={properties.filter((item) => item.status === "active").length}
          />

          <StatCard
            label="Draft"
            value={properties.filter((item) => item.status === "draft").length}
          />

          <StatCard
            label="Rented / Sold"
            value={
              properties.filter(
                (item) => item.status === "rented" || item.status === "sold",
              ).length
            }
          />
        </section>

        <section className="mb-6 rounded-[1.7rem] border border-black/5 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <Search size={18} className="text-gray-400" />

            <input
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search by title, city, district, type, or status..."
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </section>

        {loading && properties.length === 0 ? (
          <AdminListSkeleton />
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <Home className="text-gray-400" size={26} />
            </div>

            <p className="mt-4 text-lg font-bold text-gray-950">
              No properties found
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Add your first property or change the search text.
            </p>

            <Link
              href="/admin/properties/new"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
            >
              <Plus size={17} />
              Add property
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProperties.map((property) => {
              const mainImage = property.images?.[0]?.url;

              return (
                <div
                  key={property.id}
                  className="rounded-[1.7rem] bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 md:h-28 md:w-36">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="line-clamp-1 text-base font-black text-gray-950 md:text-lg">
                            {property.title}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {property.location?.city}
                            {property.location?.district
                              ? `, ${property.location.district}`
                              : ""}
                          </p>
                        </div>

                        <StatusBadge status={property.status} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-600">
                        <span className="rounded-full bg-gray-50 px-3 py-1 capitalize">
                          {property.listingType}
                        </span>

                        <span className="rounded-full bg-gray-50 px-3 py-1 capitalize">
                          {property.propertyType}
                        </span>

                        <span className="rounded-full bg-gray-50 px-3 py-1">
                          {property.details?.area} m²
                        </span>

                        <span className="rounded-full bg-gray-50 px-3 py-1">
                          {property.details?.rooms} rooms
                        </span>

                        <span className="rounded-full bg-gray-50 px-3 py-1">
                          {property.price?.toLocaleString("de-DE")} €
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-200"
                        >
                          <Eye size={15} />
                          View
                        </Link>

                        <Link
                          href={`/admin/properties/${property.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
                        >
                          <Pencil size={15} />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(property.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                        {property.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(property.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReject(property.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-yellow-50 px-4 py-2 text-xs font-bold text-yellow-700 transition hover:bg-yellow-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.7rem] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-gray-950">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Property["status"] }) {
  const className =
    status === "active"
      ? "bg-green-50 text-green-700"
      : status === "draft"
        ? "bg-yellow-50 text-yellow-700"
        : status === "inactive"
          ? "bg-gray-100 text-gray-600"
          : status === "rented"
            ? "bg-blue-50 text-blue-700"
            : status === "sold"
              ? "bg-purple-50 text-purple-700"
              : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${className}`}
    >
      {status}
    </span>
  );
}
