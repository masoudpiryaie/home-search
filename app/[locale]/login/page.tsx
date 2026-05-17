import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/app/lib/i18n";
import LoginClient from "./LoginClient";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LoginClient locale={locale as Locale} />;
}
