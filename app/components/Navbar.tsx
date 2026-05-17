"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Building2,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentLocale = getCurrentLocale(pathname);
  const t = getDictionary(currentLocale);

  const isRtl = currentLocale === "fa";
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
      <header className="md:sticky top-0 z-50 bg-[var(--color-bg)]/80 px-3 pt-3 backdrop-blur-xl md:px-5 md:pt-4">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="mx-auto flex h-[76px] max-w-[1488px] items-center justify-between rounded-[26px] border border-[var(--color-border)] bg-white/95 px-4 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-3xl md:h-[86px] md:px-6"
        >
          <Link href={homeHref} className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center text-[var(--color-primary)] transition group-hover:scale-105 md:h-12 md:w-12">
              <Home size={38} strokeWidth={2.2} />
            </div>

            <div className="leading-tight">
              <p className="text-[18px] font-black tracking-[-0.04em] text-[var(--color-text)] md:text-[22px]">
                {isAdminRoute ? "HomeRent Admin" : t.common.siteName}
              </p>

              <p className="hidden text-xs font-semibold text-[var(--color-muted)] sm:block">
                {isAdminRoute ? "Manage listings" : t.nav.tagline}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {!isAdminRoute && (
              <>
                <DesktopNavLink
                  href={localizedHref(currentLocale, "/")}
                  active={pathname === localizedHref(currentLocale, "/")}
                >
                  {t.nav.home}
                </DesktopNavLink>

                <DesktopNavLink
                  href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
                  active={false}
                >
                  {t.nav.rent}
                </DesktopNavLink>

                <DesktopNavLink
                  href={`${localizedHref(currentLocale, "/properties")}?type=sale`}
                  active={false}
                >
                  {t.nav.buy}
                </DesktopNavLink>

                {/* <DesktopNavLink href="#" active={false}>
                  {t.nav.agents}
                </DesktopNavLink> */}

                <DesktopNavLink
                  href={localizedHref(currentLocale, "/saved")}
                  active={isPublicActive("/saved")}
                >
                  <span className="inline-flex items-center gap-2">
                    {t.nav.saved}
                    <Heart size={18} />
                  </span>
                </DesktopNavLink>

                {user && (
                  <DesktopNavLink
                    href={localizedHref(currentLocale, "/my-listings")}
                    active={isPublicActive("/my-listings")}
                  >
                    {t.nav.myListings}
                  </DesktopNavLink>
                )}

                {isAdmin && (
                  <DesktopNavLink href="/admin" active={false}>
                    {t.nav.admin}
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
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isAdminRoute && (
              <Suspense fallback={null}>
                <LanguageSwitcher />
              </Suspense>
            )}

            {!isAdminRoute && (
              <Link
                href={localizedHref(currentLocale, "/submit-property")}
                className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[var(--color-accent)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-dark)]"
              >
                <PlusCircle size={18} />
                {t.nav.submitProperty}
              </Link>
            )}

            {isAdminRoute && (
              <Link
                href="/admin/properties/new"
                className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[var(--color-accent)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-dark)]"
              >
                <PlusCircle size={18} />
                Add property
              </Link>
            )}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-text)] shadow-sm transition hover:bg-gray-50"
              >
                <LogOut size={18} />
                {isAdminRoute ? "Logout" : t.nav.logout}
              </button>
            ) : (
              <Link
                href={localizedHref(currentLocale, "/login")}
                className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-text)] shadow-sm transition hover:bg-gray-50"
              >
                <User size={18} />
                {t.nav.login}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {!isAdminRoute && (
              <Link
                href={localizedHref(currentLocale, "/submit-property")}
                className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[var(--color-accent)] px-3 text-xs font-black text-white shadow-[var(--shadow-button)]"
              >
                <PlusCircle size={17} />
                {t.nav.submitProperty}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-sm"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={22} />
            </button>
            {isAdminRoute && (
              <Link
                href="/admin/properties/new"
                className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[var(--color-accent)] px-4 text-sm font-black text-white shadow-[var(--shadow-button)]"
              >
                <PlusCircle size={17} />
                Add
              </Link>
            )}
          </div>
        </div>
      </header>
      {isMobileMenuOpen && (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="fixed left-3 right-3 top-[92px] z-50 rounded-[24px] border border-[var(--color-border)] bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-2xl md:hidden"
        >
          <div className="flex flex-col gap-1">
            {!isAdminRoute && (
              <>
                <MobileDropdownLink
                  href={localizedHref(currentLocale, "/")}
                  active={pathname === localizedHref(currentLocale, "/")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t.nav.home}
                </MobileDropdownLink>

                <MobileDropdownLink
                  href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
                  active={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t.nav.rent}
                </MobileDropdownLink>

                <MobileDropdownLink
                  href={`${localizedHref(currentLocale, "/properties")}?type=sale`}
                  active={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t.nav.buy}
                </MobileDropdownLink>

                <MobileDropdownLink
                  href={localizedHref(currentLocale, "/saved")}
                  active={isPublicActive("/saved")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t.nav.saved}
                </MobileDropdownLink>

                {user && (
                  <MobileDropdownLink
                    href={localizedHref(currentLocale, "/my-listings")}
                    active={isPublicActive("/my-listings")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.nav.myListings}
                  </MobileDropdownLink>
                )}

                {isAdmin && (
                  <MobileDropdownLink
                    href="/admin"
                    active={false}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.nav.admin}
                  </MobileDropdownLink>
                )}

                <div className="my-2 h-px bg-[var(--color-border)]" />

                <Suspense fallback={null}>
                  <LanguageSwitcher />
                </Suspense>
              </>
            )}

            {isAdminRoute && (
              <>
                <MobileDropdownLink
                  href="/admin"
                  active={pathname === "/admin"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </MobileDropdownLink>

                <MobileDropdownLink
                  href="/admin/properties"
                  active={isAdminActive("/admin/properties")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Properties
                </MobileDropdownLink>

                <MobileDropdownLink
                  href="/admin/inquiries"
                  active={isAdminActive("/admin/inquiries")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inquiries
                </MobileDropdownLink>
              </>
            )}

            <div className="my-2 h-px bg-[var(--color-border)]" />

            {user ? (
              <button
                type="button"
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                {isAdminRoute ? "Logout" : t.nav.logout}
              </button>
            ) : (
              <MobileDropdownLink
                href={localizedHref(currentLocale, "/login")}
                active={isPublicActive("/login")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.login}
              </MobileDropdownLink>
            )}
          </div>
        </div>
      )}
      {!isAdminRoute && (
        <nav
          dir={isRtl ? "rtl" : "ltr"}
          className="mobile-safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white/95 px-4 pb-2 pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:hidden"
        >
          <div className="mx-auto grid max-w-md grid-cols-4 items-end gap-1">
            <MobileNavLink
              href={localizedHref(currentLocale, "/")}
              active={pathname === localizedHref(currentLocale, "/")}
              icon={<Home size={22} />}
              label={t.nav.home}
            />

            <MobileNavLink
              href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
              active={isPublicActive("/properties")}
              icon={<Search size={22} />}
              label={t.nav.search}
            />

            <MobileNavLink
              href={localizedHref(currentLocale, "/saved")}
              active={isPublicActive("/saved")}
              icon={<Heart size={22} />}
              label={t.nav.saved}
            />

            {user ? (
              <MobileNavLink
                href={localizedHref(currentLocale, "/my-listings")}
                active={isPublicActive("/my-listings")}
                icon={<Building2 size={22} />}
                label={t.nav.mine}
              />
            ) : (
              <MobileNavLink
                href={localizedHref(currentLocale, "/login")}
                active={isPublicActive("/login")}
                icon={<User size={22} />}
                label={t.nav.profile}
              />
            )}
          </div>
        </nav>
      )}

      {isAdminRoute && (
        <nav className="mobile-safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white/95 px-4 pb-2 pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
            <MobileNavLink
              href="/admin"
              active={pathname === "/admin"}
              icon={<LayoutDashboard size={22} />}
              label="Home"
            />

            <MobileNavLink
              href="/admin/properties"
              active={isAdminActive("/admin/properties")}
              icon={<Building2 size={22} />}
              label="Listings"
            />

            <MobileNavLink
              href="/admin/inquiries"
              active={isAdminActive("/admin/inquiries")}
              icon={<ShieldCheck size={22} />}
              label="Leads"
            />

            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-[var(--color-muted)] transition hover:bg-gray-50"
            >
              <LogOut size={22} />
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
        "relative text-sm font-bold transition",
        active
          ? "text-[var(--color-primary)]"
          : "text-[var(--color-text)] hover:text-[var(--color-primary)]",
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[31px] left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-[var(--color-primary)]" />
      )}
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
          ? "text-[var(--color-primary)]"
          : "text-[var(--color-text)] hover:text-[var(--color-primary)]",
      )}
    >
      {icon}
      <span className="max-w-[72px] truncate">{label}</span>
    </Link>
  );
}
function MobileDropdownLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center rounded-2xl px-4 py-3 text-sm font-bold transition",
        active
          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          : "text-[var(--color-text)] hover:bg-gray-50 hover:text-[var(--color-primary)]",
      )}
    >
      {children}
    </Link>
  );
}
