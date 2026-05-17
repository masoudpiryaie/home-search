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

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

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
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black text-white">
              <Home size={18} />
            </div>

            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight text-gray-950">
                HomeRent
              </p>

              <p className="hidden text-xs text-gray-500 sm:block">
                Rent & buy homes
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/properties?type=rent"
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Rent
            </Link>

            <Link
              href="/properties?type=sale"
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Buy
            </Link>

            <Link
              href="/saved"
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Saved
            </Link>

            <Link
              href="/submit-property"
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Submit property
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Admin
                </Link>

                <Link
                  href="/admin/inquiries"
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Inquiries
                </Link>

                <Link
                  href="/admin/properties/new"
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                >
                  Add property
                </Link>
              </>
            )}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
                Login
              </Link>
            )}
          </nav>

          {isAdmin ? (
            <Link
              href="/admin/properties/new"
              className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white md:hidden"
            >
              <PlusCircle size={16} />
              Add
            </Link>
          ) : (
            <Link
              href="/submit-property"
              className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white md:hidden"
            >
              <PlusCircle size={16} />
              Submit
            </Link>
          )}
        </div>
      </header>

      {!isAdminRoute && (
        <nav className="mobile-safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-2 backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
            >
              <Home size={20} />
              Home
            </Link>

            <Link
              href="/properties?type=rent"
              className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
            >
              <Search size={20} />
              Rent
            </Link>

            <Link
              href="/properties?type=sale"
              className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
            >
              <Search size={20} />
              Buy
            </Link>

            <Link
              href="/saved"
              className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
            >
              <Heart size={20} />
              Saved
            </Link>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
              >
                <LogOut size={20} />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium text-gray-700"
              >
                <User size={20} />
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
