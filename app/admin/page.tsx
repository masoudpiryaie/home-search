"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  Mail,
  MessageCircle,
  Plus,
} from "lucide-react";

import { getProperties } from "../lib/propertyService";
// import { getInquiries } from "../lib/inquiryService";
import { AdminListSkeleton } from "../components/Skeletons";
import type { Property } from "../types/property";
import type { Inquiry } from "../types/inquiry";
import { getLocalizedText } from "@/app/lib/localizedText";
import { getInquiries } from "../lib/inquiryService";
export default function AdminDashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  async function loadDashboardData() {
    setLoading(true);

    try {
      const [propertiesData, inquiriesData] = await Promise.all([
        getProperties(),
        getInquiries(),
      ]);

      setProperties(propertiesData);
      setInquiries(inquiriesData);
    } catch (error) {
      console.error(error);
      alert("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    return {
      totalProperties: properties.length,
      activeProperties: properties.filter((item) => item.status === "active")
        .length,
      draftProperties: properties.filter((item) => item.status === "draft")
        .length,
      newInquiries: inquiries.filter((item) => item.status === "new").length,
    };
  }, [properties, inquiries]);

  const latestProperties = properties.slice(0, 6);
  const latestInquiries = inquiries.slice(0, 4);

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <main className="px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Dashboard</p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                Welcome back
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
                Manage your properties, check new messages, and keep your
                listings updated.
              </p>
            </div>

            <Link
              href="/admin/properties/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black transition hover:bg-gray-100"
            >
              <Plus size={18} />
              Add property
            </Link>
          </div>
        </section>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total properties"
            value={loading ? "..." : stats.totalProperties}
            icon={<Building2 size={22} />}
            description="All listings"
          />

          <StatCard
            title="Active"
            value={loading ? "..." : stats.activeProperties}
            icon={<CheckCircle2 size={22} />}
            description="Visible to users"
          />

          <StatCard
            title="Draft"
            value={loading ? "..." : stats.draftProperties}
            icon={<Clock3 size={22} />}
            description="Not ready yet"
          />

          <StatCard
            title="New inquiries"
            value={loading ? "..." : stats.newInquiries}
            icon={<MessageCircle size={22} />}
            description="Need attention"
          />
        </section>

        {loading ? (
          <AdminListSkeleton />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950">
                    Latest properties
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Recently created or updated listings.
                  </p>
                </div>

                <Link
                  href="/admin/properties"
                  className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
                >
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>

              {latestProperties.length === 0 ? (
                <EmptyBox
                  icon={<Home size={26} />}
                  title="No properties yet"
                  description="Create your first property listing."
                  href="/admin/properties/new"
                  linkText="Add property"
                />
              ) : (
                <div className="space-y-3">
                  {latestProperties.map((property) => (
                    <PropertyRow key={property.id} property={property} />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950">
                    Latest inquiries
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    New messages from users.
                  </p>
                </div>

                <Link
                  href="/admin/inquiries"
                  className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
                >
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>

              {latestInquiries.length === 0 ? (
                <EmptyBox
                  icon={<Mail size={26} />}
                  title="No inquiries yet"
                  description="Messages from property pages will appear here."
                  href="/admin/inquiries"
                  linkText="Open inquiries"
                />
              ) : (
                <div className="space-y-3">
                  {latestInquiries.map((inquiry) => (
                    <InquiryRow key={inquiry.id} inquiry={inquiry} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-[1.7rem] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-gray-950">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-900">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ property }: { property: Property }) {
  const image = property.images?.[0]?.url;
  const title = getLocalizedText(property.title, "en");
  return (
    <Link
      href={`/admin/properties/${property.slug}/edit`}
      className="flex gap-4 rounded-[1.3rem] bg-gray-50 p-3 transition hover:bg-gray-100"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-gray-950">{title}</p>

        <p className="mt-1 truncate text-xs text-gray-500">
          {property.location?.city}
          {property.location?.district ? `, ${property.location.district}` : ""}
        </p>

        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-gray-600">
          <span className="rounded-full bg-white px-2 py-1 capitalize">
            {property.status}
          </span>

          <span className="rounded-full bg-white px-2 py-1">
            {property.price?.toLocaleString("de-DE")} €
          </span>
        </div>
      </div>
    </Link>
  );
}

function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  return (
    <Link
      href="/admin/inquiries"
      className="block rounded-[1.3rem] bg-gray-50 p-4 transition hover:bg-gray-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-gray-950">
            {inquiry.name}
          </p>

          <p className="mt-1 truncate text-xs text-gray-500">
            {inquiry.propertyTitle}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-black capitalize ${
            inquiry.status === "new"
              ? "bg-green-50 text-green-700"
              : inquiry.status === "read"
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {inquiry.status}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">
        {inquiry.message}
      </p>
    </Link>
  );
}

function EmptyBox({
  icon,
  title,
  description,
  href,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-gray-50 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400">
        {icon}
      </div>

      <p className="mt-4 text-lg font-black text-gray-950">{title}</p>

      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>

      <Link
        href={href}
        className="mt-5 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
      >
        {linkText}
      </Link>
    </div>
  );
}
