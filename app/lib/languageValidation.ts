import type { Locale } from "@/app/types/property";

const persianArabicRegex = /[\u0600-\u06FF]/;
const latinRegex = /[A-Za-zÄÖÜäöüß]/;

function countMatches(text: string, regex: RegExp) {
  return [...text].filter((char) => regex.test(char)).length;
}

export function validateTextLanguage({
  locale,
  title,
  description,
}: {
  locale: Locale;
  title: string;
  description: string;
}) {
  const fullText = `${title} ${description}`.trim();

  const persianArabicCount = countMatches(fullText, persianArabicRegex);
  const latinCount = countMatches(fullText, latinRegex);

  if (locale === "fa") {
    if (persianArabicCount < 10) {
      return {
        valid: false,
        message:
          "چون زبان سایت فارسی است، لطفاً عنوان و توضیحات آگهی را فارسی بنویسید.",
      };
    }
  }

  if (locale === "en") {
    if (persianArabicCount > 5 || latinCount < 10) {
      return {
        valid: false,
        message:
          "Because the website language is English, please write the title and description in English.",
      };
    }
  }

  if (locale === "de") {
    if (persianArabicCount > 5 || latinCount < 10) {
      return {
        valid: false,
        message:
          "Da die Website auf Deutsch ist, schreibe bitte Titel und Beschreibung auf Deutsch.",
      };
    }
  }

  return {
    valid: true,
    message: "",
  };
}
