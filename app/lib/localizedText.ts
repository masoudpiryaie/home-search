import type { Locale, LocalizedText } from "@/app/types/property";

export function getLocalizedText(
  value: string | Partial<LocalizedText> | undefined,
  locale: Locale,
) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value[locale] || value.en || value.de || value.fa || "";
}

export function createFallbackLocalizedText(value: string, locale: Locale) {
  return {
    en: locale === "en" ? value : "",
    fa: locale === "fa" ? value : "",
    de: locale === "de" ? value : "",
  };
}
