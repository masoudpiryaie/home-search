"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const adminLinks = [
  {
    label: "Properties",
    href: "/admin/properties",
    icon: Building2,
  },
  {
    label: "Add property",
    href: "/admin/properties/new",
    icon: Plus,
  },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: Mail,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

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
      <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-72 shrink-0 border-r border-black/5 bg-white/80 p-4 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          <div className="rounded-[1.8rem] bg-black p-5 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <LayoutDashboard size={24} />
            </div>

            <p className="mt-4 text-lg font-black">Admin Panel</p>
            <p className="mt-1 text-sm leading-6 text-white/60">
              Manage listings and user messages.
            </p>
          </div>

          <nav className="mt-5 space-y-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active =
                pathname === link.href ||
                (link.href !== "/admin/properties" &&
                  pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
            >
              <Home size={18} />
              Back to website
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-20 left-4 right-4 z-40 rounded-[1.5rem] border border-black/5 bg-white/95 p-2 shadow-xl shadow-black/10 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== "/admin/properties" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-bold transition ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
