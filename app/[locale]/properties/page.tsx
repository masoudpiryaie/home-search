import { Suspense } from "react";
import { notFound } from "next/navigation";

import { PropertiesGridSkeleton } from "@/app/components/Skeletons";
import { isLocale, type Locale } from "@/app/lib/i18n";
import PropertiesClient from "./PropertiesClient";

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 md:px-6 md:py-10">
          <div className="mx-auto max-w-7xl">
            <PropertiesGridSkeleton />
          </div>
        </main>
      }
    >
      <PropertiesClient locale={locale as Locale} />
    </Suspense>
  );
}
