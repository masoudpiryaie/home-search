"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { isFavorite, toggleFavorite } from "../lib/favorites";

type FavoriteButtonProps = {
  propertyId?: string;
  variant?: "icon" | "full";
};

export default function FavoriteButton({
  propertyId,
  variant = "icon",
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
        {saved ? "Saved" : "Save property"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition ${
        saved ? "bg-red-500 text-white" : "bg-white/90 text-gray-800"
      }`}
      aria-label={saved ? "Remove from saved" : "Save property"}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
