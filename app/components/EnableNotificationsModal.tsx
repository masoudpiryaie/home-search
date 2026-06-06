"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, X } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { requestAndSavePushToken } from "@/app/lib/pushNotifications";

export default function EnableNotificationsModal() {
  const { user, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const dismissed = localStorage.getItem("notification-modal-dismissed");

    if (dismissed === "true") return;

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      const timer = window.setTimeout(() => {
        setOpen(true);
      }, 1800);

      return () => window.clearTimeout(timer);
    }
  }, [loading, user]);

  function closeModal() {
    localStorage.setItem("notification-modal-dismissed", "true");
    setOpen(false);
  }

  async function handleEnable() {
    if (!user) return;

    setSaving(true);

    try {
      const token = await requestAndSavePushToken(user.uid);

      if (token) {
        localStorage.setItem("notification-modal-dismissed", "true");
        setOpen(false);
      } else {
        alert("امکان فعال‌سازی نوتیفیکیشن وجود ندارد.");
      }
    } catch (error) {
      console.error(error);
      alert("فعال‌سازی نوتیفیکیشن انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-shell)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Bell size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[var(--color-text)]">
                فعال‌سازی نوتیفیکیشن
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-muted)]">
                اگر آگهی شما تایید یا رد شود، یا کسی برای آگهی شما پیام بفرستد،
                در مرورگر به شما اطلاع می‌دهیم.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={handleEnable}
            disabled={saving}
            className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] text-sm font-black text-white shadow-[var(--shadow-button)] disabled:opacity-60"
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            فعال‌سازی
          </button>

          <button
            type="button"
            onClick={closeModal}
            className="h-11 rounded-[16px] border border-[var(--color-border)] bg-white text-sm font-black text-[var(--color-text)]"
          >
            فعلاً نه
          </button>
        </div>
      </div>
    </div>
  );
}
