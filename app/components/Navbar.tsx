"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { getDictionary, locales, type Locale } from "@/app/lib/i18n";

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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  const pathname = usePathname();
  const currentLocale = getCurrentLocale(pathname);
  const t = getDictionary(currentLocale);

  const isAdminRoute = pathname.startsWith("/admin");

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error(error);
      alert("Could not logout.");
    }
  }

  function isPublicActive(href: string) {
    const fullHref = localizedHref(currentLocale, href);
    return pathname === fullHref || pathname.startsWith(`${fullHref}/`);
  }

  function isAdminActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const homeHref = isAdminRoute ? "/admin" : localizedHref(currentLocale, "/");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href={homeHref} className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white shadow-sm transition group-hover:scale-105">
              <Home size={19} />
            </div>

            <div className="leading-tight">
              <p className="text-base font-black tracking-tight text-gray-950">
                {isAdminRoute ? "HomeRent Admin" : t.common.siteName}
              </p>

              <p className="hidden text-xs font-medium text-gray-500 sm:block">
                {isAdminRoute
                  ? "Manage listings"
                  : currentLocale === "fa"
                    ? "اجاره و خرید خانه"
                    : currentLocale === "de"
                      ? "Immobilien mieten & kaufen"
                      : "Rent & buy homes"}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-black/5 bg-gray-50/80 p-1 md:flex">
            {!isAdminRoute && (
              <>
                <DesktopNavLink
                  href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
                  active={isPublicActive("/properties")}
                >
                  {t.nav.rent}
                </DesktopNavLink>

                <DesktopNavLink
                  href={`${localizedHref(currentLocale, "/properties")}?type=sale`}
                  active={isPublicActive("/properties")}
                >
                  {t.nav.buy}
                </DesktopNavLink>

                <DesktopNavLink
                  href={localizedHref(currentLocale, "/saved")}
                  active={isPublicActive("/saved")}
                >
                  {t.nav.saved}
                </DesktopNavLink>

                {user && (
                  <DesktopNavLink
                    href={localizedHref(currentLocale, "/my-listings")}
                    active={isPublicActive("/my-listings")}
                  >
                    {t.nav.myListings}
                  </DesktopNavLink>
                )}
              </>
            )}

            {isAdminRoute && (
              <>
                <DesktopNavLink href="/admin" active={pathname === "/admin"}>
                  Dashboard
                </DesktopNavLink>

                <DesktopNavLink
                  href="/admin/properties"
                  active={isAdminActive("/admin/properties")}
                >
                  Properties
                </DesktopNavLink>

                <DesktopNavLink
                  href="/admin/inquiries"
                  active={isAdminActive("/admin/inquiries")}
                >
                  Inquiries
                </DesktopNavLink>
              </>
            )}

            {isAdmin && !isAdminRoute && (
              <DesktopNavLink href="/admin" active={false}>
                Admin
              </DesktopNavLink>
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!isAdminRoute && (
              <Suspense fallback={null}>
                <LanguageSwitcher />
              </Suspense>
            )}

            {!isAdminRoute && (
              <Link
                href={localizedHref(currentLocale, "/submit-property")}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                <PlusCircle size={17} />
                {t.nav.submitProperty}
              </Link>
            )}

            {isAdminRoute && (
              <Link
                href="/admin/properties/new"
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                <PlusCircle size={17} />
                Add property
              </Link>
            )}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
              >
                <LogOut size={17} />
                {isAdminRoute ? "Logout" : t.nav.logout}
              </button>
            ) : (
              <Link
                href={localizedHref(currentLocale, "/login")}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
              >
                <User size={17} />
                {t.nav.login}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {!isAdminRoute && (
              <Suspense fallback={null}>
                <LanguageSwitcher />
              </Suspense>
            )}

            {isAdminRoute ? (
              <Link
                href="/admin/properties/new"
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-bold text-white shadow-sm"
              >
                <PlusCircle size={16} />
                Add
              </Link>
            ) : (
              <Link
                href={localizedHref(currentLocale, "/submit-property")}
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-bold text-white shadow-sm"
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
        <nav className="mobile-safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-2 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
            <MobileNavLink
              href={localizedHref(currentLocale, "/")}
              active={pathname === localizedHref(currentLocale, "/")}
              icon={<Home size={20} />}
              label={t.nav.home}
            />

            <MobileNavLink
              href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
              active={isPublicActive("/properties")}
              icon={<Search size={20} />}
              label={t.nav.rent}
            />

            <Link
              href={localizedHref(currentLocale, "/submit-property")}
              className="relative -mt-7 flex flex-col items-center gap-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-black text-white shadow-xl shadow-black/20">
                <PlusCircle size={24} />
              </div>
              <span className="text-[11px] font-black text-gray-900">
                {currentLocale === "fa"
                  ? "ثبت"
                  : currentLocale === "de"
                    ? "Anzeige"
                    : "Submit"}
              </span>
            </Link>

            <MobileNavLink
              href={localizedHref(currentLocale, "/saved")}
              active={isPublicActive("/saved")}
              icon={<Heart size={20} />}
              label={t.nav.saved}
            />

            {user ? (
              <MobileNavLink
                href={localizedHref(currentLocale, "/my-listings")}
                active={isPublicActive("/my-listings")}
                icon={<Building2 size={20} />}
                label={
                  currentLocale === "fa"
                    ? "آگهی‌ها"
                    : currentLocale === "de"
                      ? "Meine"
                      : "Mine"
                }
              />
            ) : (
              <MobileNavLink
                href={localizedHref(currentLocale, "/login")}
                active={isPublicActive("/login")}
                icon={<User size={20} />}
                label={t.nav.login}
              />
            )}
          </div>
        </nav>
      )}

      {isAdminRoute && (
        <nav className="mobile-safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-2 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
            <MobileNavLink
              href="/admin"
              active={pathname === "/admin"}
              icon={<LayoutDashboard size={20} />}
              label="Home"
            />

            <MobileNavLink
              href="/admin/properties"
              active={isAdminActive("/admin/properties")}
              icon={<Building2 size={20} />}
              label="Listings"
            />

            <MobileNavLink
              href="/admin/inquiries"
              active={isAdminActive("/admin/inquiries")}
              icon={<ShieldCheck size={20} />}
              label="Leads"
            />

            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-gray-600 transition hover:bg-gray-50"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

function DesktopNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-bold transition",
        active
          ? "bg-white text-gray-950 shadow-sm"
          : "text-gray-600 hover:bg-white hover:text-gray-950",
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition",
        active
          ? "bg-gray-950 text-white"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-950",
      )}
    >
      {icon}
      <span className="max-w-[64px] truncate">{label}</span>
    </Link>
  );
}
