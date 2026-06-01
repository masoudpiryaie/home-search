import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <NotificationsClient locale={locale as Locale} />;
}
