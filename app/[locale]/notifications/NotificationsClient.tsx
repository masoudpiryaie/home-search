"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  CircleCheck,
  Clock,
  Home,
  XCircle,
} from "lucide-react";

import LoadingScreen from "@/app/components/LoadingScreen";
import { useAuth } from "@/app/context/AuthContext";
import type { Locale } from "@/app/lib/i18n";
import { toDate } from "@/app/lib/firestoreHelpers";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "@/app/lib/services/notificationService";
import type { FirestoreDate } from "@/app/lib/firestoreHelpers";
type NotificationsClientProps = {
  locale: Locale;
};

function getLabels(locale: Locale) {
  if (locale === "fa") {
    return {
      title: "اعلان‌ها",
      subtitle: "وضعیت آگهی‌ها و پیام‌های مهم شما اینجا نمایش داده می‌شود.",
      back: "بازگشت",
      loading: "در حال بارگذاری اعلان‌ها...",
      emptyTitle: "اعلانی وجود ندارد",
      emptyText: "فعلاً اعلان جدیدی برای شما ثبت نشده است.",
      markAll: "خواندن همه",
      openProperty: "مشاهده آگهی",
      loginTitle: "ورود لازم است",
      loginText: "برای دیدن اعلان‌ها باید وارد حساب کاربری شوید.",
      goLogin: "رفتن به ورود",
      unread: "خوانده نشده",
      read: "خوانده شده",
    };
  }

  if (locale === "de") {
    return {
      title: "Benachrichtigungen",
      subtitle:
        "Hier siehst du wichtige Updates zu deinen Anzeigen und Nachrichten.",
      back: "Zurück",
      loading: "Benachrichtigungen werden geladen...",
      emptyTitle: "Keine Benachrichtigungen",
      emptyText: "Du hast momentan keine neuen Benachrichtigungen.",
      markAll: "Alle als gelesen markieren",
      openProperty: "Anzeige öffnen",
      loginTitle: "Login erforderlich",
      loginText: "Bitte melde dich an, um deine Benachrichtigungen zu sehen.",
      goLogin: "Zum Login",
      unread: "Ungelesen",
      read: "Gelesen",
    };
  }

  return {
    title: "Notifications",
    subtitle: "Important updates about your listings and messages appear here.",
    back: "Back",
    loading: "Loading notifications...",
    emptyTitle: "No notifications",
    emptyText: "You do not have any notifications yet.",
    markAll: "Mark all as read",
    openProperty: "Open property",
    loginTitle: "Login required",
    loginText: "Please log in to view your notifications.",
    goLogin: "Go to login",
    unread: "Unread",
    read: "Read",
  };
}

function formatDate(value: FirestoreDate, locale: Locale) {
  const date = toDate(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getNotificationIcon(type: AppNotification["type"]) {
  if (type === "listing_approved") {
    return <CircleCheck size={22} />;
  }

  if (type === "listing_rejected") {
    return <XCircle size={22} />;
  }

  return <Bell size={22} />;
}

export default function NotificationsClient({
  locale,
}: NotificationsClientProps) {
  const labels = getLabels(locale);
  const { user, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  useEffect(() => {
    async function loadNotifications() {
      if (authLoading) return;

      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await getUserNotifications(user.uid);
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [authLoading, user]);

  async function handleMarkOneAsRead(notificationId?: string) {
    if (!notificationId) return;

    try {
      await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleMarkAllAsRead() {
    if (!user) return;

    setUpdating(true);

    try {
      await markAllNotificationsAsRead(user.uid);

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  }

  if (authLoading || loading) {
    return <LoadingScreen text={labels.loading} />;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
        <div className="mx-auto max-w-md rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <Bell className="mx-auto text-[var(--color-primary)]" size={38} />

          <h1 className="mt-5 text-2xl font-black text-[var(--color-text)]">
            {labels.loginTitle}
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
            {labels.loginText}
          </p>

          <Link
            href={`/${locale}/login`}
            className="mt-6 inline-flex rounded-[16px] bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-button)]"
          >
            {labels.goLogin}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={locale === "fa" ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--color-bg)] px-3 pb-24 pt-4 md:px-5 md:pb-12 md:pt-5"
    >
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:rounded-[34px]">
        <div className="border-b border-[var(--color-border)] bg-white px-5 py-5 md:px-8 md:py-7">
          <Link
            href={`/${locale}`}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-black text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={17} />
            {labels.back}
          </Link>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-sm font-black text-[var(--color-primary)]">
                {unreadCount} {labels.unread}
              </p>

              <h1 className="mt-4 text-[34px] font-black leading-tight tracking-[-0.04em] text-[var(--color-text)] md:text-[52px]">
                {labels.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[var(--color-muted)] md:text-base">
                {labels.subtitle}
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={updating}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)] disabled:opacity-60"
              >
                <CheckCheck size={18} />
                {labels.markAll}
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#fffdf9] px-5 py-5 md:px-8 md:py-7">
          {notifications.length === 0 ? (
            <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <Bell size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-black text-[var(--color-text)]">
                {labels.emptyTitle}
              </h2>

              <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
                {labels.emptyText}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notifications.map((notification) => {
                const propertySlug =
                  typeof notification.data?.propertySlug === "string"
                    ? notification.data.propertySlug
                    : "";

                const propertyId =
                  typeof notification.data?.propertyId === "string"
                    ? notification.data.propertyId
                    : "";

                const propertyLink = propertySlug || propertyId;

                return (
                  <article
                    key={notification.id}
                    className={`rounded-[24px] border p-5 shadow-[var(--shadow-card)] ${
                      notification.isRead
                        ? "border-[var(--color-border)] bg-white"
                        : "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white text-[var(--color-primary)] shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-black text-[var(--color-text)]">
                              {notification.title}
                            </h2>

                            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[var(--color-muted)] ring-1 ring-[var(--color-border)]">
                              {notification.isRead
                                ? labels.read
                                : labels.unread}
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-semibold leading-7 text-[var(--color-muted)]">
                            {notification.body}
                          </p>

                          <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-muted)]">
                            <Clock size={14} />
                            {formatDate(notification.createdAt, locale)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkOneAsRead(notification.id)}
                            className="h-10 rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-xs font-black text-[var(--color-text)] shadow-sm"
                          >
                            {labels.read}
                          </button>
                        )}

                        {propertyLink && (
                          <Link
                            href={`/${locale}/properties/${propertyLink}`}
                            className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[var(--color-primary)] px-4 text-xs font-black text-white shadow-[var(--shadow-button)]"
                          >
                            <Home size={15} />
                            {labels.openProperty}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
