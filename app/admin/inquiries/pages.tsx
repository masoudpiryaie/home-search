"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Search } from "lucide-react";

import { getInquiries, updateInquiryStatus } from "../../lib/inquiryService";
import type { Inquiry } from "../../types/inquiry";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadInquiries() {
    setLoading(true);

    try {
      const data = await getInquiries();
      setInquiries(data);
      setFilteredInquiries(data);
    } catch (error) {
      console.error(error);
      alert("Could not load inquiries.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);

    const lowerValue = value.toLowerCase();

    const result = inquiries.filter((inquiry) => {
      return (
        inquiry.propertyTitle.toLowerCase().includes(lowerValue) ||
        inquiry.name.toLowerCase().includes(lowerValue) ||
        inquiry.email.toLowerCase().includes(lowerValue) ||
        inquiry.status.toLowerCase().includes(lowerValue)
      );
    });

    setFilteredInquiries(result);
  }

  async function handleStatusChange(
    id: string | undefined,
    status: Inquiry["status"],
  ) {
    if (!id) return;

    try {
      await updateInquiryStatus(id, status);

      setInquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );

      setFilteredInquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    } catch (error) {
      console.error(error);
      alert("Could not update inquiry.");
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  return (
    <main className="px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">
                Admin messages
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                Inquiries
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
                Read messages from users who are interested in your properties.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-md">
              <p className="text-sm text-white/60">New messages</p>
              <p className="mt-1 text-3xl font-black">
                {loading
                  ? "..."
                  : inquiries.filter((item) => item.status === "new").length}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[1.7rem] border border-black/5 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <Search size={18} className="text-gray-400" />

            <input
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search by property, name, email, or status..."
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </section>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-[1.7rem] bg-white"
              />
            ))}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <MessageCircle className="text-gray-400" size={26} />
            </div>

            <p className="mt-4 text-lg font-bold text-gray-950">
              No inquiries found
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Messages from property pages will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="rounded-[1.7rem] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={inquiry.status} />

                      <Link
                        href={`/properties/${inquiry.propertyId}`}
                        className="text-sm font-bold text-gray-950 hover:underline"
                      >
                        {inquiry.propertyTitle}
                      </Link>
                    </div>

                    <h2 className="mt-3 text-xl font-black text-gray-950">
                      {inquiry.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                      >
                        <Mail size={15} />
                        {inquiry.email}
                      </a>

                      {inquiry.phone && <span>{inquiry.phone}</span>}
                    </div>
                  </div>

                  <select
                    value={inquiry.status}
                    onChange={(event) =>
                      handleStatusChange(
                        inquiry.id,
                        event.target.value as Inquiry["status"],
                      )
                    }
                    className="w-fit rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <p className="mt-5 whitespace-pre-line rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {inquiry.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: Inquiry["status"] }) {
  const className =
    status === "new"
      ? "bg-green-50 text-green-700"
      : status === "read"
        ? "bg-blue-50 text-blue-700"
        : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-black capitalize ${className}`}
    >
      {status}
    </span>
  );
}
