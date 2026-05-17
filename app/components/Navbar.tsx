"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Home,
  LogIn,
  LogOut,
  PlusCircle,
  Search,
  User,
} from "lucide-react";
import { Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { getDictionary, locales, type Locale } from "../lib/i18n";

function getCurrentLocale(pathname: string): Locale {
  const firstSegment = pathname.split("/")[1];

  if (locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return "en";
}

function localizedHref(locale: Locale, href: string) {
  if (href === "/") {
    return `/${locale}`;
  }

  return `/${locale}${href}`;
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  const pathname = usePathname();
  const currentLocale = getCurrentLocale(pathname);
  const t = getDictionary(currentLocale);

  const isAdminRoute = pathname.startsWith(`/${currentLocale}/admin`);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error(error);
      alert("Could not logout.");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link
            href={localizedHref(currentLocale, "/")}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black text-white">
              <Home size={18} />
            </div>

            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight text-gray-950">
                {t.common.siteName}
              </p>

              <p className="hidden text-xs text-gray-500 sm:block">
                {currentLocale === "fa"
                  ? "اجاره و خرید خانه"
                  : currentLocale === "de"
                    ? "Immobilien mieten & kaufen"
                    : "Rent & buy homes"}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {t.nav.rent}
            </Link>

            <Link
              href={`${localizedHref(currentLocale, "/properties")}?type=sale`}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {t.nav.buy}
            </Link>

            <Link
              href={localizedHref(currentLocale, "/saved")}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {t.nav.saved}
            </Link>

            <Link
              href={localizedHref(currentLocale, "/submit-property")}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {t.nav.submitProperty}
            </Link>

            {user && (
              <Link
                href={localizedHref(currentLocale, "/my-listings")}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                {t.nav.myListings}
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  href={localizedHref(currentLocale, "/admin")}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {t.nav.admin}
                </Link>

                <Link
                  href={localizedHref(currentLocale, "/admin/inquiries")}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {t.nav.inquiries}
                </Link>

                <Link
                  href={localizedHref(currentLocale, "/admin/properties/new")}
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                >
                  {t.nav.addProperty}
                </Link>
              </>
            )}

            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                {t.nav.logout}
              </button>
            ) : (
              <Link
                href={localizedHref(currentLocale, "/login")}
                className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
                {t.nav.login}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>

            {isAdmin ? (
              <Link
                href={localizedHref(currentLocale, "/admin/properties/new")}
                className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                <PlusCircle size={16} />
                {currentLocale === "fa"
                  ? "افزودن"
                  : currentLocale === "de"
                    ? "Neu"
                    : "Add"}
              </Link>
            ) : (
              <Link
                href={localizedHref(currentLocale, "/submit-property")}
                className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                <PlusCircle size={16} />
                {currentLocale === "fa"
                  ? "ثبت"
                  : currentLocale === "de"
                    ? "Anzeige"
                    : "Submit"}
              </Link>
            )}
          </div>
        </div>
      </header>

      {!isAdminRoute && (
        <nav className="mobile-safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-2 backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5">
            <Link
              href={localizedHref(currentLocale, "/")}
              className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
            >
              <Home size={20} />
              {t.nav.home}
            </Link>

            <Link
              href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
              className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
            >
              <Search size={20} />
              {t.nav.rent}
            </Link>

            <Link
              href={`${localizedHref(currentLocale, "/properties")}?type=sale`}
              className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
            >
              <Search size={20} />
              {t.nav.buy}
            </Link>

            <Link
              href={localizedHref(currentLocale, "/saved")}
              className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
            >
              <Heart size={20} />
              {t.nav.saved}
            </Link>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
              >
                <LogOut size={20} />
                {t.nav.logout}
              </button>
            ) : (
              <Link
                href={localizedHref(currentLocale, "/login")}
                className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
              >
                <User size={20} />
                {t.nav.login}
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
