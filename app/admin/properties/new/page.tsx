import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PropertyForm from "@/app/components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <main className="px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/properties"
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm"
        >
          <ArrowLeft size={17} />
          Back to admin
        </Link>

        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <p className="text-sm font-medium text-white/60">New listing</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            Create property
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
            Add clear details, upload good images, and publish your first
            property listing.
          </p>
        </section>

        <PropertyForm />
      </div>
    </main>
  );
}
