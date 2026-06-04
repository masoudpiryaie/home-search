"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import {
  addFavorite,
  isFavorite,
  removeFavorite,
} from "@/app/lib/services/favoriteService";
import type { Locale } from "@/app/lib/i18n";

type FavoriteButtonProps = {
  propertyId?: string;
  locale?: Locale;
  variant?: "icon" | "full";
};

function getLabels(locale: Locale = "en") {
  if (locale === "fa") {
    return {
      save: "ذخیره",
      saved: "ذخیره شد",
      loginRequired: "برای ذخیره آگهی باید وارد حساب شوید.",
      error: "امکان ذخیره آگهی وجود ندارد.",
    };
  }

  if (locale === "de") {
    return {
      save: "Speichern",
      saved: "Gespeichert",
      loginRequired: "Bitte melde dich an, um die Anzeige zu speichern.",
      error: "Anzeige konnte nicht gespeichert werden.",
    };
  }

  return {
    save: "Save",
    saved: "Saved",
    loginRequired: "Please log in to save this listing.",
    error: "Could not save listing.",
  };
}

export default function FavoriteButton({
  propertyId,
  locale = "en",
  variant = "icon",
}: FavoriteButtonProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const labels = getLabels(locale);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");

  const isFull = variant === "full";

  useEffect(() => {
    async function checkFavoriteStatus() {
      if (authLoading) return;

      setMessage("");

      if (!user || !propertyId) {
        setSaved(false);
        setChecking(false);
        return;
      }

      try {
        const status = await isFavorite(user.uid, propertyId);
        setSaved(status);
      } catch (error) {
        console.error(error);
        setSaved(false);
      } finally {
        setChecking(false);
      }
    }

    checkFavoriteStatus();
  }, [authLoading, user, propertyId]);

  async function handleToggleFavorite() {
    setMessage("");

    if (!propertyId) return;

    if (!user) {
      setMessage(labels.loginRequired);
      router.push(`/${locale}/login`);
      return;
    }

    setLoading(true);

    try {
      if (saved) {
        await removeFavorite(user.uid, propertyId);
        setSaved(false);
      } else {
        await addFavorite(user.uid, propertyId);
        setSaved(true);
      }
    } catch (error) {
      console.error(error);
      setMessage(labels.error);
    } finally {
      setLoading(false);
    }
  }

  if (isFull) {
    return (
      <div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={loading || checking || !propertyId}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-[16px]  px-5 text-sm font-black shadow-sm transition disabled:opacity-60 ${
            saved
              ? "border-red-100 bg-red-50 text-red-600"
              : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          }`}
        >
          {loading || checking ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          )}

          {saved ? labels.saved : labels.save}
        </button>

        {message && (
          <p className="mt-2 text-xs font-bold leading-5 text-red-600">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggleFavorite}
        disabled={loading || checking || !propertyId}
        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm ring-1 transition disabled:opacity-60 ${
          saved
            ? "bg-red-50 text-red-600 ring-red-100"
            : "bg-white text-[var(--color-text)] ring-[var(--color-border)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
        }`}
        aria-label={saved ? labels.saved : labels.save}
      >
        {loading || checking ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Heart size={19} fill={saved ? "currentColor" : "none"} />
        )}
      </button>

      {message && (
        <p className="mt-2 max-w-[180px] text-xs font-bold leading-5 text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
