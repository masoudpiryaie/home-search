import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import MarketClient from "./MarketClient";

export default async function MarketPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale) || locale !== "fa") {
    notFound();
  }

  return <MarketClient locale={locale as Locale} />;
}
