import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import SubmitPropertyClient from "./SubmitPropertyClient";

export default async function SubmitPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <SubmitPropertyClient locale={locale as Locale} />;
}
