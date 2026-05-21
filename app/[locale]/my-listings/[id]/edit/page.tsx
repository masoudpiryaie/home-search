import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import UserEditPropertyClient from "./UserEditPropertyClient";

export default async function UserEditPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <UserEditPropertyClient locale={locale as Locale} propertyId={id} />;
}
