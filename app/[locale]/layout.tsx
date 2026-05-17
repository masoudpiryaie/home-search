import { notFound } from "next/navigation";

import { getDirection, isLocale, type Locale } from "../lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const direction = getDirection(typedLocale);

  return (
    <div lang={typedLocale} dir={direction}>
      {children}
    </div>
  );
}
