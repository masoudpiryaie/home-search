"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Earth, Languages } from "lucide-react";

import { locales, type Locale } from "@/app/lib/i18n";

const languageLabels: Record<Locale, string> = {
  en: "English",
  fa: "فارسی",
  de: "Deutsch",
};

const shortLabels: Record<Locale, string> = {
  en: "EN",
  fa: "FA",
  de: "DE",
};

const languageFlags: Record<Locale, string> = {
  en: "us",
  fa: "🇮🇷",
  de: "🇩🇪",
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

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const currentLocale = getCurrentLocale(pathname);

  function handleChange(nextLocale: Locale) {
    const nextPathname = replaceLocale(pathname, nextLocale);
    const queryString = searchParams.toString();

    setOpen(false);
    router.push(queryString ? `${nextPathname}?${queryString}` : nextPathname);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-3 text-sm font-black text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50">
          <Earth size={16} className="text-gray-500" />
        </span>

        <span className="hidden sm:inline">{shortLabels[currentLocale]}</span>

        <span className="sm:hidden">{shortLabels[currentLocale]}</span>

        <ChevronDown
          size={16}
          className={`text-gray-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-[80] w-28 overflow-hidden rounded-3xl border border-black/5 bg-white p-2 shadow-2xl shadow-black/15 backdrop-blur-xl"
        >
          <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
            Language
          </div>

          {locales.map((locale) => {
            const active = locale === currentLocale;

            return (
              <button
                key={locale}
                type="button"
                role="menuitem"
                onClick={() => handleChange(locale)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xs">{shortLabels[locale]}</span>
                </span>

                {active && <Check size={17} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
