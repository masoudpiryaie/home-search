"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import type { Locale } from "@/app/lib/i18n";
import { getUnreadNotificationsCount } from "@/app/lib/services/notificationService";

type NotificationBellProps = {
  locale: Locale;
};

export default function NotificationBell({ locale }: NotificationBellProps) {
  const { user, loading } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      if (loading || !user) {
        setCount(0);
        return;
      }

      try {
        const unreadCount = await getUnreadNotificationsCount(user.uid);
        setCount(unreadCount);
      } catch (error) {
        console.error(error);
        setCount(0);
      }
    }

    loadCount();
  }, [loading, user]);

  if (!user) {
    return null;
  }

  return (
    <Link
      href={`/${locale}/notifications`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
      aria-label={
        locale === "fa"
          ? "اعلان‌ها"
          : locale === "de"
            ? "Benachrichtigungen"
            : "Notifications"
      }
    >
      <Bell size={19} />

      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
