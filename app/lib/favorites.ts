const FAVORITES_KEY = "home_rent_favorites";

export function getFavoriteIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const value = localStorage.getItem(FAVORITES_KEY);

  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);

    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }

    return [];
  } catch {
    return [];
  }
}

export function isFavorite(propertyId?: string) {
  if (!propertyId) {
    return false;
  }

  return getFavoriteIds().includes(propertyId);
}

export function toggleFavorite(propertyId?: string) {
  if (!propertyId || typeof window === "undefined") {
    return [];
  }

  const favoriteIds = getFavoriteIds();

  const nextFavoriteIds = favoriteIds.includes(propertyId)
    ? favoriteIds.filter((id) => id !== propertyId)
    : [...favoriteIds, propertyId];

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavoriteIds));

  window.dispatchEvent(new Event("favorites-updated"));

  return nextFavoriteIds;
}
