"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Property } from "@/app/types/property";
import { getPropertyById } from "@/app/lib/propertyService";
import LoadingScreen from "@/app/components/LoadingScreen";
import PropertyForm from "@/app/components/PropertyForm";

export default function EditPropertyPage() {
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
    return <LoadingScreen text="Loading property..." />;
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-black text-gray-950">
            Property not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This property may be deleted or unavailable.
          </p>

          <Link
            href="/admin/properties"
            className="mt-6 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
          >
            Back to admin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/properties"
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm"
        >
          <ArrowLeft size={17} />
          Back to admin
        </Link>

        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <p className="text-sm font-medium text-white/60">Edit listing</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            Update property
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
            Change property details, images, status, and contact information.
          </p>
        </section>

        <PropertyForm
          mode="edit"
          propertyId={params.id}
          initialData={property}
        />
      </div>
    </main>
  );
}
