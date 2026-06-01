"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
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
  X,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { getDictionary, locales, type Locale } from "@/app/lib/i18n";
import Logo from "./logo";
import NotificationBell from "@/app/components/NotificationBell";

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

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  const pathname = usePathname();
  const currentLocale = getCurrentLocale(pathname);
  const t = getDictionary(currentLocale);

  const isRtl = currentLocale === "fa";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const homeHref = isAdminRoute ? "/admin" : localizedHref(currentLocale, "/");

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      const clickedInsideMenu = mobileMenuRef.current?.contains(target);
      const clickedOnMenuButton = mobileMenuButtonRef.current?.contains(target);

      if (!clickedInsideMenu && !clickedOnMenuButton) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--color-bg)]/80 px-2.5 pt-2 backdrop-blur-xl sm:px-3 md:px-5 md:pt-4">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="mx-auto flex h-[66px] max-w-[1488px] items-center justify-between rounded-[22px] border border-[var(--color-border)] bg-white/95 px-3 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:h-[72px] sm:px-4 md:h-[86px] md:rounded-[26px] md:px-6"
        >
          <Logo
            homeHref={homeHref}
            isAdminRoute={isAdminRoute}
            siteName={t.common.siteName}
            tagline={t.nav.tagline}
          />

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
              <>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--color-border)] bg-white shadow-sm">
                  <NotificationBell locale={currentLocale} />
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-text)] shadow-sm transition hover:bg-gray-50"
                >
                  <LogOut size={18} />
                  {isAdminRoute ? "Logout" : t.nav.logout}
                </button>
              </>
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
            {user && (
              <div className="relative flex h-10 w-10 items-center justify-center rounded-[16px] border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-sm">
                <NotificationBell locale={currentLocale} />
              </div>
            )}

            {!isAdminRoute && (
              <Link
                href={localizedHref(currentLocale, "/submit-property")}
                className="hidden h-10 items-center gap-1.5 rounded-[16px] bg-[var(--color-accent)] px-3 text-xs font-black text-white shadow-[var(--shadow-button)] xs:inline-flex"
              >
                <PlusCircle size={16} />
                {t.nav.submitProperty}
              </Link>
            )}

            {isAdminRoute && (
              <Link
                href="/admin/properties/new"
                className="inline-flex h-10 items-center gap-1.5 rounded-[16px] bg-[var(--color-accent)] px-3 text-xs font-black text-white shadow-[var(--shadow-button)]"
              >
                <PlusCircle size={16} />
                Add
              </Link>
            )}

            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-sm transition active:scale-95"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] md:hidden" />

          <div
            ref={mobileMenuRef}
            dir={isRtl ? "rtl" : "ltr"}
            className="fixed left-2.5 right-2.5 top-[82px] z-50 rounded-[28px] border border-[var(--color-border)] bg-white/95 p-3 shadow-[0_22px_60px_rgba(15,23,42,0.20)] backdrop-blur-2xl sm:left-4 sm:right-4 sm:top-[90px] md:hidden"
          >
            <div className="mb-3 flex items-center justify-between rounded-[22px] bg-[var(--color-bg)] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[var(--color-text)]">
                  {user
                    ? user.email
                    : localeText(currentLocale, {
                        fa: "حساب کاربری",
                        de: "Konto",
                        en: "Account",
                      })}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-[var(--color-muted)]">
                  {isAdminRoute
                    ? "Admin panel"
                    : localeText(currentLocale, {
                        fa: "منوی سریع",
                        de: "Schnellmenü",
                        en: "Quick menu",
                      })}
                </p>
              </div>

              {user ? (
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[17px] border border-[var(--color-border)] bg-white shadow-sm">
                  <NotificationBell locale={currentLocale} />
                </div>
              ) : (
                <Link
                  href={localizedHref(currentLocale, "/login")}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[17px] border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-sm"
                >
                  <User size={19} />
                </Link>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {!isAdminRoute && (
                <>
                  <MobileDropdownLink
                    href={localizedHref(currentLocale, "/")}
                    active={pathname === localizedHref(currentLocale, "/")}
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<Home size={19} />}
                  >
                    {t.nav.home}
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
                    active={false}
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<Search size={19} />}
                  >
                    {t.nav.rent}
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    href={`${localizedHref(currentLocale, "/properties")}?type=sale`}
                    active={false}
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<Building2 size={19} />}
                  >
                    {t.nav.buy}
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    href={localizedHref(currentLocale, "/saved")}
                    active={isPublicActive("/saved")}
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<Heart size={19} />}
                  >
                    {t.nav.saved}
                  </MobileDropdownLink>

                  {user && (
                    <MobileDropdownLink
                      href={localizedHref(currentLocale, "/my-listings")}
                      active={isPublicActive("/my-listings")}
                      onClick={() => setIsMobileMenuOpen(false)}
                      icon={<Building2 size={19} />}
                    >
                      {t.nav.myListings}
                    </MobileDropdownLink>
                  )}

                  {isAdmin && (
                    <MobileDropdownLink
                      href="/admin"
                      active={false}
                      onClick={() => setIsMobileMenuOpen(false)}
                      icon={<ShieldCheck size={19} />}
                    >
                      {t.nav.admin}
                    </MobileDropdownLink>
                  )}

                  <div className="my-2 h-px bg-[var(--color-border)]" />

                  <div className="rounded-[20px] border border-[var(--color-border)] bg-white px-3 py-2 shadow-sm">
                    <Suspense fallback={null}>
                      <LanguageSwitcher />
                    </Suspense>
                  </div>
                </>
              )}

              {isAdminRoute && (
                <>
                  <MobileDropdownLink
                    href="/admin"
                    active={pathname === "/admin"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<LayoutDashboard size={19} />}
                  >
                    Dashboard
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    href="/admin/properties"
                    active={isAdminActive("/admin/properties")}
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<Building2 size={19} />}
                  >
                    Properties
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    href="/admin/inquiries"
                    active={isAdminActive("/admin/inquiries")}
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<ShieldCheck size={19} />}
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
                  className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-black text-red-600 transition active:scale-[0.98] hover:bg-red-50"
                >
                  <LogOut size={19} />
                  <span>{isAdminRoute ? "Logout" : t.nav.logout}</span>
                </button>
              ) : (
                <MobileDropdownLink
                  href={localizedHref(currentLocale, "/login")}
                  active={isPublicActive("/login")}
                  onClick={() => setIsMobileMenuOpen(false)}
                  icon={<User size={19} />}
                >
                  {t.nav.login}
                </MobileDropdownLink>
              )}
            </div>
          </div>
        </>
      )}

      {!isAdminRoute && (
        <nav
          dir={isRtl ? "rtl" : "ltr"}
          className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-white/95 px-3 pb-2 pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:hidden"
        >
          <div className="mx-auto grid max-w-md grid-cols-4 items-end gap-1 rounded-[24px] bg-white">
            <MobileNavLink
              href={localizedHref(currentLocale, "/")}
              active={pathname === localizedHref(currentLocale, "/")}
              icon={<Home size={21} />}
              label={t.nav.home}
            />

            <MobileNavLink
              href={`${localizedHref(currentLocale, "/properties")}?type=rent`}
              active={isPublicActive("/properties")}
              icon={<Search size={21} />}
              label={t.nav.search}
            />

            <MobileNavLink
              href={localizedHref(currentLocale, "/saved")}
              active={isPublicActive("/saved")}
              icon={<Heart size={21} />}
              label={t.nav.saved}
            />

            {user ? (
              <MobileNavLink
                href={localizedHref(currentLocale, "/my-listings")}
                active={isPublicActive("/my-listings")}
                icon={<Building2 size={21} />}
                label={t.nav.mine}
              />
            ) : (
              <MobileNavLink
                href={localizedHref(currentLocale, "/login")}
                active={isPublicActive("/login")}
                icon={<User size={21} />}
                label={t.nav.profile}
              />
            )}
          </div>
        </nav>
      )}

      {isAdminRoute && (
        <nav className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-white/95 px-3 pb-2 pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
            <MobileNavLink
              href="/admin"
              active={pathname === "/admin"}
              icon={<LayoutDashboard size={21} />}
              label="Home"
            />

            <MobileNavLink
              href="/admin/properties"
              active={isAdminActive("/admin/properties")}
              icon={<Building2 size={21} />}
              label="Listings"
            />

            <MobileNavLink
              href="/admin/inquiries"
              active={isAdminActive("/admin/inquiries")}
              icon={<ShieldCheck size={21} />}
              label="Leads"
            />

            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-[11px] font-bold text-[var(--color-muted)] transition active:scale-95 hover:bg-gray-50"
            >
              <LogOut size={21} />
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
        "flex min-w-0 flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-[11px] font-bold transition active:scale-95",
        active
          ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          : "text-[var(--color-muted)] hover:bg-gray-50 hover:text-[var(--color-primary)]",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full",
          active && "bg-white shadow-sm",
        )}
      >
        {icon}
      </span>

      <span className="max-w-[72px] truncate leading-none">{label}</span>
    </Link>
  );
}

function MobileDropdownLink({
  href,
  active,
  onClick,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-black transition active:scale-[0.98]",
        active
          ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          : "text-[var(--color-text)] hover:bg-gray-50 hover:text-[var(--color-primary)]",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[15px]",
          active ? "bg-white shadow-sm" : "bg-[var(--color-bg)]",
        )}
      >
        {icon}
      </span>

      <span className="truncate">{children}</span>
    </Link>
  );
}

function localeText(
  locale: Locale,
  values: {
    fa: string;
    de: string;
    en: string;
  },
) {
  return values[locale] || values.en;
}
