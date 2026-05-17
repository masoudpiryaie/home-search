import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import PropertyDetailsClient from "./PropertyDetailsClient";

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <PropertyDetailsClient locale={locale as Locale} propertyId={id} />;
}
