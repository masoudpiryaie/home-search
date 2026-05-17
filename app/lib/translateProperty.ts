import type { Locale, LocalizedText } from "@/app/types/property";

type TranslatePropertyTextInput = {
  sourceLanguage: Locale;
  title: string;
  description: string;
};

type TranslatePropertyTextResult = {
  title: LocalizedText;
  description: LocalizedText;
};

function createFallbackLocalizedText(
  value: string,
  locale: Locale,
): LocalizedText {
  return {
    en: locale === "en" ? value : "",
    fa: locale === "fa" ? value : "",
    de: locale === "de" ? value : "",
  };
}

export async function translatePropertyText({
  sourceLanguage,
  title,
  description,
}: TranslatePropertyTextInput): Promise<TranslatePropertyTextResult> {
  try {
    const response = await fetch("/api/translate-property", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceLanguage,
        title,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error("Translation request failed.");
    }

    const data = (await response.json()) as TranslatePropertyTextResult;

    return {
      title: {
        en: data.title?.en || "",
        fa: data.title?.fa || "",
        de: data.title?.de || "",
      },
      description: {
        en: data.description?.en || "",
        fa: data.description?.fa || "",
        de: data.description?.de || "",
      },
    };
  } catch (error) {
    console.error(error);

    return {
      title: createFallbackLocalizedText(title, sourceLanguage),
      description: createFallbackLocalizedText(description, sourceLanguage),
    };
  }
}
