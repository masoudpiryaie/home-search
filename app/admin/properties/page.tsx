"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
  Home,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";

import LoadingScreen from "@/app/components/LoadingScreen";
import { useAuth } from "@/app/context/AuthContext";
import {
  getAdminProperties,
  updatePropertyStatus,
} from "@/app/lib/propertyService";
import { getLocalizedText } from "@/app/lib/localizedText";
import type { Property } from "@/app/types/property";

type StatusFilter =
  | "all"
  | "pending"
  | "active"
  | "draft"
  | "inactive"
  | "rejected"
  | "rented"
  | "sold";

function toDate(value: unknown) {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof value.seconds === "number"
  ) {
    return new Date(value.seconds * 1000);
  }

  return null;
}

function formatDate(value: unknown) {
  const date = toDate(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminPropertiesPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [rejectingProperty, setRejectingProperty] = useState<Property | null>(
    null,
  );
  const [rejectNote, setRejectNote] = useState("");

  async function loadProperties() {
    setLoading(true);

    try {
      const data = await getAdminProperties();
      setProperties(data);
    } catch (error) {
      console.error(error);
      alert("Could not load properties.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadProperties();
    }

    if (!authLoading && (!user || !isAdmin)) {
      setLoading(false);
    }
  }, [authLoading, user, isAdmin]);

  async function handleApprove(propertyId?: string) {
    if (!propertyId) return;

    setUpdatingId(propertyId);

    try {
      await updatePropertyStatus(propertyId, "active", "", user?.uid);

      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId
            ? {
                ...property,
                status: "active",
              }
            : property,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Could not approve property.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReject() {
    if (!rejectingProperty?.id) return;

    setUpdatingId(rejectingProperty.id);

    try {
      await updatePropertyStatus(
        rejectingProperty.id,
        "rejected",
        rejectNote,
        user?.uid,
      );

      setProperties((current) =>
        current.map((property) =>
          property.id === rejectingProperty.id
            ? {
                ...property,
                status: "rejected",
                review: {
                  ...property.review,
                  note: rejectNote,
                },
              }
            : property,
        ),
      );

      setRejectingProperty(null);
      setRejectNote("");
    } catch (error) {
      console.error(error);
      alert("Could not reject property.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSetStatus(
    propertyId: string | undefined,
    status: Property["status"],
  ) {
    if (!propertyId) return;

    setUpdatingId(propertyId);

    try {
      await updatePropertyStatus(propertyId, status, "", user?.uid);

      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId
            ? {
                ...property,
                status,
              }
            : property,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredProperties = useMemo(() => {
    const value = searchTerm.toLowerCase().trim();

    return properties.filter((property) => {
      const title = getLocalizedText(property.title, "en").toLowerCase();
      const city = property.location?.city?.toLowerCase() || "";
      const district = property.location?.district?.toLowerCase() || "";
      const street = property.location?.street?.toLowerCase() || "";
      const postalCode = property.location?.postalCode?.toLowerCase() || "";
      const status = property.status?.toLowerCase() || "";
      const email = property.contact?.email?.toLowerCase() || "";
      const submittedEmail = property.submittedBy?.email?.toLowerCase() || "";

      const matchesSearch =
        !value ||
        title.includes(value) ||
        city.includes(value) ||
        district.includes(value) ||
        street.includes(value) ||
        postalCode.includes(value) ||
        status.includes(value) ||
        email.includes(value) ||
        submittedEmail.includes(value);

      const matchesStatus =
        statusFilter === "all" || property.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [properties, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      all: properties.length,
      pending: properties.filter((item) => item.status === "pending").length,
      active: properties.filter((item) => item.status === "active").length,
      rejected: properties.filter((item) => item.status === "rejected").length,
    };
  }, [properties]);

  if (authLoading || loading) {
    return <LoadingScreen text="Loading properties..." />;
  }

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
        <div className="mx-auto max-w-md rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50 text-red-600">
            <XCircle size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-[var(--color-text)]">
            Access denied
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
            You need admin access to view this page.
          </p>

          <Link
            href="/en/login"
            className="mt-6 inline-flex rounded-[16px] bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-button)]"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-3 pb-24 pt-4 md:px-5 md:pb-12 md:pt-5">
      <section className="mx-auto max-w-[1488px] overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:rounded-[34px]">
        <div className="border-b border-[var(--color-border)] bg-white px-5 py-5 md:px-8 md:py-7">
          <Link
            href="/admin"
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-black text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-sm font-black text-[var(--color-primary)]">
                Admin listings
              </p>

              <h1 className="mt-4 text-[34px] font-black leading-tight tracking-[-0.04em] text-[var(--color-text)] md:text-[52px]">
                Properties
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[var(--color-muted)] md:text-base">
                Review pending listings, approve user submissions, and manage
                all properties.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadProperties}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[var(--color-border)] bg-white px-5 text-sm font-black text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
              >
                <RefreshCcw size={17} />
                Refresh
              </button>

              <Link
                href="/admin/properties/new"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
              >
                <Home size={17} />
                Add property
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#fffdf9] px-5 py-5 md:px-8 md:py-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="All" value={stats.all} />
            <StatCard label="Pending review" value={stats.pending} />
            <StatCard label="Active" value={stats.active} />
            <StatCard label="Rejected" value={stats.rejected} />
          </div>

          <div className="mt-5 rounded-[24px] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex h-[54px] flex-1 items-center gap-2 rounded-[18px] border border-[var(--color-border)] bg-white px-4">
                <Search size={19} className="text-[var(--color-muted)]" />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title, city, email, status..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--color-text)] placeholder:text-gray-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-[54px] rounded-[18px] border border-[var(--color-border)] bg-white px-4 text-sm font-black text-[var(--color-text)] shadow-sm md:w-56"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
                <option value="rejected">Rejected</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {filteredProperties.length === 0 ? (
              <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <Building2 size={30} />
                </div>

                <h2 className="mt-5 text-2xl font-black text-[var(--color-text)]">
                  No properties found
                </h2>

                <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
                  Try changing your search or filter.
                </p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <AdminPropertyCard
                  key={property.id}
                  property={property}
                  updating={updatingId === property.id}
                  onApprove={handleApprove}
                  onReject={() => {
                    setRejectingProperty(property);
                    setRejectNote("");
                  }}
                  onSetStatus={handleSetStatus}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {rejectingProperty && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm md:items-center md:p-6">
          <div className="w-full max-w-lg rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-shell)] md:p-6">
            <h2 className="text-2xl font-black text-[var(--color-text)]">
              Reject property
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
              Add a short note for the owner. This note can be shown in their
              account page.
            </p>

            <textarea
              value={rejectNote}
              onChange={(event) => setRejectNote(event.target.value)}
              rows={5}
              placeholder="Reason for rejection..."
              className="mt-5 w-full rounded-[18px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm placeholder:text-gray-400"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectingProperty(null);
                  setRejectNote("");
                }}
                className="h-12 rounded-[16px] border border-[var(--color-border)] bg-white text-sm font-black text-[var(--color-text)] shadow-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={updatingId === rejectingProperty.id}
                className="h-12 rounded-[16px] bg-red-600 text-sm font-black text-white shadow-sm disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-sm font-bold text-[var(--color-muted)]">{label}</p>

      <p className="mt-2 text-3xl font-black text-[var(--color-text)]">
        {value}
      </p>
    </div>
  );
}

function AdminPropertyCard({
  property,
  updating,
  onApprove,
  onReject,
  onSetStatus,
}: {
  property: Property;
  updating: boolean;
  onApprove: (id?: string) => Promise<void>;
  onReject: () => void;
  onSetStatus: (
    id: string | undefined,
    status: Property["status"],
  ) => Promise<void>;
}) {
  const title = getLocalizedText(property.title, "en");
  const image = property.images?.[0]?.url;

  return (
    <article className="overflow-hidden rounded-[26px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
        <div className="relative h-52 bg-gray-100 lg:h-full">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[var(--color-muted)]">
              No image
            </div>
          )}

          <div className="absolute left-4 top-4">
            <StatusBadge status={property.status} />
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h2 className="line-clamp-1 text-2xl font-black tracking-[-0.03em] text-[var(--color-text)]">
                {title || "Untitled property"}
              </h2>

              <p className="mt-2 text-sm font-semibold text-[var(--color-muted)]">
                {property.location?.city}
                {property.location?.district
                  ? `, ${property.location.district}`
                  : ""}
                {property.location?.street
                  ? ` · ${property.location.street}`
                  : ""}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-[var(--color-muted)]">
                <span className="rounded-full bg-[#fffdf9] px-3 py-1 ring-1 ring-[var(--color-border)]">
                  {property.listingType}
                </span>

                <span className="rounded-full bg-[#fffdf9] px-3 py-1 ring-1 ring-[var(--color-border)]">
                  {property.propertyType}
                </span>

                <span className="rounded-full bg-[#fffdf9] px-3 py-1 ring-1 ring-[var(--color-border)]">
                  {property.details?.area} m²
                </span>

                <span className="rounded-full bg-[#fffdf9] px-3 py-1 ring-1 ring-[var(--color-border)]">
                  {property.details?.rooms} rooms
                </span>

                <span className="rounded-full bg-[#fffdf9] px-3 py-1 ring-1 ring-[var(--color-border)]">
                  €{property.price?.toLocaleString("de-DE")}
                </span>
                <span className="rounded-full bg-[#fffdf9] px-3 py-1 ring-1 ring-[var(--color-border)]">
                  {property.viewCount || 0} views
                </span>
              </div>

              <div className="mt-4 grid gap-1 text-xs font-semibold text-[var(--color-muted)]">
                <p>Created: {formatDate(property.createdAt)}</p>
                {property.submittedBy?.email && (
                  <p>Submitted by: {property.submittedBy.email}</p>
                )}
                {property.contact?.email && (
                  <p>Contact: {property.contact.email}</p>
                )}
              </div>

              {property.status === "pending" && (
                <div className="mt-4 rounded-[18px] bg-orange-50 px-4 py-3 text-sm font-bold leading-6 text-orange-700">
                  This listing is waiting for admin review.
                </div>
              )}

              {property.status === "rejected" && property.review?.note && (
                <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                  Rejection note: {property.review.note}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {property.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => onApprove(property.id)}
                    disabled={updating}
                    className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[var(--color-primary)] px-4 text-xs font-black text-white shadow-[var(--shadow-button)] disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={onReject}
                    disabled={updating}
                    className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-red-600 px-4 text-xs font-black text-white shadow-sm disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              )}

              {property.id && (
                <Link
                  href={`/admin/properties/${property.id}/edit`}
                  className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-xs font-black text-[var(--color-text)] shadow-sm"
                >
                  <Edit size={16} />
                  Edit
                </Link>
              )}

              {property.id && property.status === "active" && (
                <Link
                  href={`/en/properties/${property.id}`}
                  className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-xs font-black text-[var(--color-text)] shadow-sm"
                >
                  <Eye size={16} />
                  View
                </Link>
              )}

              {property.status !== "inactive" && property.id && (
                <button
                  type="button"
                  onClick={() => onSetStatus(property.id, "inactive")}
                  disabled={updating}
                  className="inline-flex h-11 items-center rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-xs font-black text-[var(--color-text)] shadow-sm disabled:opacity-60"
                >
                  Inactive
                </button>
              )}

              {property.status !== "active" &&
                property.status !== "pending" &&
                property.id && (
                  <button
                    type="button"
                    onClick={() => onSetStatus(property.id, "active")}
                    disabled={updating}
                    className="inline-flex h-11 items-center rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-xs font-black text-[var(--color-text)] shadow-sm disabled:opacity-60"
                  >
                    Set active
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: Property["status"] }) {
  const className =
    status === "active"
      ? "bg-green-50 text-green-700 ring-green-100"
      : status === "pending"
        ? "bg-orange-50 text-orange-700 ring-orange-100"
        : status === "rejected"
          ? "bg-red-50 text-red-700 ring-red-100"
          : status === "draft"
            ? "bg-yellow-50 text-yellow-700 ring-yellow-100"
            : status === "rented"
              ? "bg-blue-50 text-blue-700 ring-blue-100"
              : status === "sold"
                ? "bg-purple-50 text-purple-700 ring-purple-100"
                : "bg-gray-100 text-gray-700 ring-gray-200";

  const Icon =
    status === "active"
      ? CheckCircle2
      : status === "pending"
        ? Clock3
        : status === "rejected"
          ? XCircle
          : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black capitalize ring-1 ${className}`}
    >
      <Icon size={14} />
      {status}
    </span>
  );
}
