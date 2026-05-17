import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import MyListingsClient from "./MyListingsClient";

export default async function MyListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <MyListingsClient locale={locale as Locale} />;
}
