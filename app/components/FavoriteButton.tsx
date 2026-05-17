"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { isFavorite, toggleFavorite } from "../lib/favorites";
import { type Locale } from "../lib/i18n";

type FavoriteButtonProps = {
  propertyId?: string;
  variant?: "icon" | "full";
  locale?: Locale;
};

export default function FavoriteButton({
  propertyId,
  variant = "icon",
  locale = "en",
}: FavoriteButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(propertyId));

    function handleUpdate() {
      setSaved(isFavorite(propertyId));
    }

    window.addEventListener("favorites-updated", handleUpdate);

    return () => {
      window.removeEventListener("favorites-updated", handleUpdate);
    };
  }, [propertyId]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    toggleFavorite(propertyId);
    setSaved(isFavorite(propertyId));
  }

  const saveText =
    locale === "fa"
      ? "ذخیره آگهی"
      : locale === "de"
        ? "Anzeige speichern"
        : "Save property";

  const savedText =
    locale === "fa" ? "ذخیره شده" : locale === "de" ? "Gespeichert" : "Saved";

  const addLabel =
    locale === "fa"
      ? "ذخیره آگهی"
      : locale === "de"
        ? "Anzeige speichern"
        : "Save property";

  const removeLabel =
    locale === "fa"
      ? "حذف از ذخیره‌شده‌ها"
      : locale === "de"
        ? "Aus gespeicherten Anzeigen entfernen"
        : "Remove from saved";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold transition ${
          saved
            ? "bg-red-50 text-red-600"
            : "border border-gray-200 bg-white text-gray-800"
        }`}
      >
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
        {saved ? savedText : saveText}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`absolute right-4 top-1 flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition ${
        saved ? "bg-red-500 text-white" : "bg-white/90 text-gray-800"
      }`}
      aria-label={saved ? removeLabel : addLabel}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
