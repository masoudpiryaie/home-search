"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import LoadingScreen from "@/app/components/LoadingScreen";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/app/lib/firebase";

type InquiryStatus = "new" | "contacted" | "closed";

type FirestoreDate =
  | {
      seconds?: number;
      nanoseconds?: number;
      toDate?: () => Date;
    }
  | Date
  | string
  | number
  | null
  | undefined;

type Inquiry = {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyImage?: string;
  propertyLocation?: string;

  name?: string;
  email?: string;
  phone?: string;
  message?: string;

  status?: InquiryStatus;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
};

function toDate(value: FirestoreDate) {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }

  return null;
}

function formatDate(value: FirestoreDate) {
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

function getStatusStyle(status: InquiryStatus) {
  if (status === "contacted") {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }

  if (status === "closed") {
    return "bg-gray-100 text-gray-600 ring-gray-200";
  }

  return "bg-[var(--color-primary-soft)] text-[var(--color-primary)] ring-[var(--color-primary-soft)]";
}

function getStatusIcon(status: InquiryStatus) {
  if (status === "contacted") return <Clock size={15} />;
  if (status === "closed") return <XCircle size={15} />;

  return <CheckCircle2 size={15} />;
}

export default function AdminInquiriesPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">(
    "all",
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadInquiries() {
    setLoading(true);

    try {
      const inquiriesQuery = query(
        collection(db, "inquiries"),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(inquiriesQuery);

      const data = snapshot.docs.map((item) => {
        const inquiry = item.data() as Omit<Inquiry, "id">;

        return {
          id: item.id,
          status: inquiry.status || "new",
          ...inquiry,
        };
      });

      setInquiries(data);
    } catch (error) {
      console.error(error);
      alert("Could not load inquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadInquiries();
    }

    if (!authLoading && (!user || !isAdmin)) {
      setLoading(false);
    }
  }, [authLoading, user, isAdmin]);

  async function updateInquiryStatus(id: string, status: InquiryStatus) {
    setUpdatingId(id);

    try {
      await updateDoc(doc(db, "inquiries", id), {
        status,
        updatedAt: new Date(),
      });

      setInquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    } catch (error) {
      console.error(error);
      alert("Could not update inquiry status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteInquiry(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inquiry?",
    );

    if (!confirmed) return;

    setUpdatingId(id);

    try {
      await deleteDoc(doc(db, "inquiries", id));

      setInquiries((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert("Could not delete inquiry.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredInquiries = useMemo(() => {
    const value = searchTerm.toLowerCase().trim();

    return inquiries.filter((inquiry) => {
      const matchesStatus =
        statusFilter === "all" || inquiry.status === statusFilter;

      const searchableText = [
        inquiry.name,
        inquiry.email,
        inquiry.phone,
        inquiry.message,
        inquiry.propertyTitle,
        inquiry.propertyLocation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !value || searchableText.includes(value);

      return matchesStatus && matchesSearch;
    });
  }, [inquiries, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      all: inquiries.length,
      new: inquiries.filter((item) => item.status === "new").length,
      contacted: inquiries.filter((item) => item.status === "contacted").length,
      closed: inquiries.filter((item) => item.status === "closed").length,
    };
  }, [inquiries]);

  if (authLoading || loading) {
    return <LoadingScreen text="Loading inquiries..." />;
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
                Admin inbox
              </p>

              <h1 className="mt-4 text-[34px] font-black leading-tight tracking-[-0.04em] text-[var(--color-text)] md:text-[52px]">
                Inquiries
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[var(--color-muted)] md:text-base">
                Manage messages from users who are interested in listed
                properties.
              </p>
            </div>

            <button
              type="button"
              onClick={loadInquiries}
              className="h-12 rounded-[16px] bg-[var(--color-primary)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-[#fffdf9] px-5 py-5 md:px-8 md:py-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="All inquiries" value={stats.all} />
            <StatCard label="New" value={stats.new} />
            <StatCard label="Contacted" value={stats.contacted} />
            <StatCard label="Closed" value={stats.closed} />
          </div>

          <div className="mt-5 rounded-[24px] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex h-[54px] flex-1 items-center gap-2 rounded-[18px] border border-[var(--color-border)] bg-white px-4">
                <Search size={19} className="text-[var(--color-muted)]" />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, property or message..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--color-text)] placeholder:text-gray-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as InquiryStatus | "all")
                }
                className="h-[54px] rounded-[18px] border border-[var(--color-border)] bg-white px-4 text-sm font-black text-[var(--color-text)] shadow-sm md:w-56"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {filteredInquiries.length === 0 ? (
              <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <MessageCircle size={30} />
                </div>

                <h2 className="mt-5 text-2xl font-black text-[var(--color-text)]">
                  No inquiries found
                </h2>

                <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
                  Try changing your search or filter.
                </p>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => (
                <InquiryCard
                  key={inquiry.id}
                  inquiry={inquiry}
                  updating={updatingId === inquiry.id}
                  onStatusChange={updateInquiryStatus}
                  onDelete={deleteInquiry}
                />
              ))
            )}
          </div>
        </div>
      </section>
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

function InquiryCard({
  inquiry,
  updating,
  onStatusChange,
  onDelete,
}: {
  inquiry: Inquiry;
  updating: boolean;
  onStatusChange: (id: string, status: InquiryStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const status = inquiry.status || "new";

  return (
    <article className="overflow-hidden rounded-[26px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
        <div className="border-b border-[var(--color-border)] bg-[#fffdf9] p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${getStatusStyle(
                  status,
                )}`}
              >
                {getStatusIcon(status)}
                {status}
              </span>

              <p className="mt-4 text-sm font-bold text-[var(--color-muted)]">
                Received
              </p>

              <p className="mt-1 text-sm font-black text-[var(--color-text)]">
                {formatDate(inquiry.createdAt)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDelete(inquiry.id)}
              disabled={updating}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 size={17} />
            </button>
          </div>

          <div className="mt-5 rounded-[18px] border border-[var(--color-border)] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <User size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[var(--color-text)]">
                  {inquiry.name || "Unknown user"}
                </p>

                <p className="truncate text-xs font-semibold text-[var(--color-muted)]">
                  {inquiry.email || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm font-semibold text-[var(--color-muted)]">
              {inquiry.email && (
                <a
                  href={`mailto:${inquiry.email}`}
                  className="flex items-center gap-2 transition hover:text-[var(--color-primary)]"
                >
                  <Mail size={16} />
                  {inquiry.email}
                </a>
              )}

              {inquiry.phone && (
                <a
                  href={`tel:${inquiry.phone}`}
                  className="flex items-center gap-2 transition hover:text-[var(--color-primary)]"
                >
                  <Phone size={16} />
                  {inquiry.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <Building2 size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="line-clamp-1 text-xl font-black tracking-[-0.03em] text-[var(--color-text)]">
                    {inquiry.propertyTitle || "Property inquiry"}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-muted)]">
                    {inquiry.propertyLocation || "No location"}
                  </p>
                </div>
              </div>

              {inquiry.propertyId && (
                <Link
                  href={`/en/properties/${inquiry.propertyId}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-xs font-black text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                >
                  <ExternalLink size={15} />
                  Open property
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(inquiry.id, "new")}
                disabled={updating}
                className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-black text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-soft)] disabled:opacity-50"
              >
                New
              </button>

              <button
                type="button"
                onClick={() => onStatusChange(inquiry.id, "contacted")}
                disabled={updating}
                className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-black text-[var(--color-text)] shadow-sm transition hover:bg-blue-50 disabled:opacity-50"
              >
                Contacted
              </button>

              <button
                type="button"
                onClick={() => onStatusChange(inquiry.id, "closed")}
                disabled={updating}
                className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-black text-[var(--color-text)] shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                Closed
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[20px] border border-[var(--color-border)] bg-[#fffdf9] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-black text-[var(--color-text)]">
              <MessageCircle
                size={18}
                className="text-[var(--color-primary)]"
              />
              Message
            </div>

            <p className="whitespace-pre-line text-sm font-medium leading-7 text-[var(--color-muted)]">
              {inquiry.message || "No message provided."}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={15} />
              Created: {formatDate(inquiry.createdAt)}
            </span>

            {inquiry.updatedAt && (
              <span className="inline-flex items-center gap-1">
                <Clock size={15} />
                Updated: {formatDate(inquiry.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
