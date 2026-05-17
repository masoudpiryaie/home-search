import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Home, Search } from "lucide-react";

import { getDictionary, isLocale, type Locale } from "@/app/lib/i18n";

export default async function SubmitPropertySuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;
  const t = getDictionary(currentLocale);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-4 py-10">
      <div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle2 className="text-green-600" size={32} />
        </div>

        <h1 className="mt-5 text-3xl font-black text-gray-950">
          {t.submitProperty.successTitle}
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          {t.submitProperty.successText}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/${currentLocale}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold text-gray-800"
          >
            <Home size={18} />
            {t.nav.home}
          </Link>

          <Link
            href={`/${currentLocale}/properties?type=rent`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-bold text-white"
          >
            <Search size={18} />
            {currentLocale === "fa"
              ? "مشاهده آگهی‌ها"
              : currentLocale === "de"
                ? "Anzeigen ansehen"
                : "Browse"}
          </Link>
        </div>

        <Link
          href={`/${currentLocale}/my-listings`}
          className="mt-4 inline-flex text-sm font-bold text-gray-700 hover:text-black"
        >
          {currentLocale === "fa"
            ? "مشاهده آگهی‌های من"
            : currentLocale === "de"
              ? "Meine Anzeigen ansehen"
              : "View my listings"}
        </Link>
      </div>
    </main>
  );
}
