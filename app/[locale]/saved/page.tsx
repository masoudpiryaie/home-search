import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import SavedClient from "./SavedClient";

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <SavedClient locale={locale as Locale} />;
}
