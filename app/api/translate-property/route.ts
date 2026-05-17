import { NextResponse } from "next/server";

type Locale = "en" | "fa" | "de";

type TranslateRequestBody = {
  sourceLanguage: Locale;
  title: string;
  description: string;
};

type LocalizedText = {
  en: string;
  fa: string;
  de: string;
};

const languages: Locale[] = ["en", "fa", "de"];

const languageNames: Record<Locale, string> = {
  en: "English",
  fa: "Persian/Farsi",
  de: "German",
};

function createFallbackTranslations(
  sourceLanguage: Locale,
  title: string,
  description: string,
) {
  const emptyText: LocalizedText = {
    en: "",
    fa: "",
    de: "",
  };

  return {
    title: {
      ...emptyText,
      [sourceLanguage]: title,
    },
    description: {
      ...emptyText,
      [sourceLanguage]: description,
    },
  };
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in Gemini response.");
  }

  return cleaned.slice(start, end + 1);
}

function normalizeTranslations(
  sourceLanguage: Locale,
  title: string,
  description: string,
  result: unknown,
) {
  const fallback = createFallbackTranslations(
    sourceLanguage,
    title,
    description,
  );

  if (!result || typeof result !== "object") {
    return fallback;
  }

  const data = result as {
    title?: Partial<LocalizedText>;
    description?: Partial<LocalizedText>;
  };

  const normalizedTitle: LocalizedText = {
    en: data.title?.en?.trim() || fallback.title.en,
    fa: data.title?.fa?.trim() || fallback.title.fa,
    de: data.title?.de?.trim() || fallback.title.de,
  };

  const normalizedDescription: LocalizedText = {
    en: data.description?.en?.trim() || fallback.description.en,
    fa: data.description?.fa?.trim() || fallback.description.fa,
    de: data.description?.de?.trim() || fallback.description.de,
  };

  normalizedTitle[sourceLanguage] = title;
  normalizedDescription[sourceLanguage] = description;

  return {
    title: normalizedTitle,
    description: normalizedDescription,
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as TranslateRequestBody;

    const sourceLanguage = body.sourceLanguage;
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();

    if (!languages.includes(sourceLanguage) || !title || !description) {
      return NextResponse.json(
        { error: "Invalid translation request." },
        { status: 400 },
      );
    }

    const prompt = `
You are a professional real estate translator.

Translate the following property listing title and description from ${languageNames[sourceLanguage]} into the other required languages.

Rules:
- Return JSON only.
- Do not add markdown.
- Do not add explanations.
- Keep the meaning accurate.
- Keep real estate tone natural.
- Do not translate city names such as Berlin, Hamburg, Munich.
- Do not invent facts.
- Preserve numbers, prices, areas, dates, and addresses.
- The source language text must stay exactly as provided.

Source language: ${sourceLanguage}

Title:
${title}

Description:
${description}

Return exactly this JSON structure:
{
  "title": {
    "en": "...",
    "fa": "...",
    "de": "..."
  },
  "description": {
    "en": "...",
    "fa": "...",
    "de": "..."
  }
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Gemini translation failed:", errorText);

      return NextResponse.json(
        createFallbackTranslations(sourceLanguage, title, description),
        { status: 200 },
      );
    }

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      JSON.stringify(
        createFallbackTranslations(sourceLanguage, title, description),
      );

    const jsonText = extractJson(text);
    const parsed = JSON.parse(jsonText);

    const translations = normalizeTranslations(
      sourceLanguage,
      title,
      description,
      parsed,
    );

    return NextResponse.json(translations);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not translate property text." },
      { status: 500 },
    );
  }
}
