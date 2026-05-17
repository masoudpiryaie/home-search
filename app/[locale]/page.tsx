import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import HomeClient from "./HomeClient";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <HomeClient locale={locale as Locale} />;
}
