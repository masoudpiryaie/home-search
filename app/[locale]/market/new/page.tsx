import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import NewMarketItemClient from "./NewMarketItemClient";

export default async function NewMarketItemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale) || locale !== "fa") {
    notFound();
  }

  return <NewMarketItemClient locale={locale as Locale} />;
}
