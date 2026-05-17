"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";

import { locales, type Locale } from "../lib/i18n";

const labels: Record<Locale, string> = {
  en: "EN",
  fa: "FA",
  de: "DE",
};

function getCurrentLocale(pathname: string): Locale {
  const firstSegment = pathname.split("/")[1];

  if (locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return "en";
}

function replaceLocale(pathname: string, nextLocale: Locale) {
  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (locales.includes(firstSegment as Locale)) {
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }

  return `/${nextLocale}${pathname}`;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLocale = getCurrentLocale(pathname);

  function handleChange(nextLocale: Locale) {
    const nextPathname = replaceLocale(pathname, nextLocale);
    const queryString = searchParams.toString();

    router.push(queryString ? `${nextPathname}?${queryString}` : nextPathname);
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1">
      <Languages size={16} className="text-gray-400" />

      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleChange(locale)}
          className={`rounded-full px-3 py-1 text-xs font-black transition ${
            currentLocale === locale
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {labels[locale]}
        </button>
      ))}
    </div>
  );
}
