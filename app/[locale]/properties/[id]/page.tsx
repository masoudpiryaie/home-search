import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PropertyDetailsClient from "./PropertyDetailsClient";
import { getLocalizedText } from "@/app/lib/localizedText";
import { getPropertySeoBySlug } from "@/app/lib/server/propertySeo";
import { isLocale, type Locale } from "@/app/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function stripText(value: string, maxLength = 160) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function getFallbackSeo(locale: Locale) {
  if (locale === "fa") {
    return {
      title: "جزئیات آگهی ملک | Andormera",
      description:
        "مشاهده جزئیات آگهی ملک، موقعیت، تصاویر، امکانات و اطلاعات تماس در Andormera.",
    };
  }

  if (locale === "de") {
    return {
      title: "Immobilienanzeige | Andormera",
      description:
        "Sieh dir Details, Lage, Bilder, Ausstattung und Kontaktinformationen der Immobilie auf Andormera an.",
    };
  }

  return {
    title: "Property listing details | Andormera",
    description:
      "View property details, location, photos, features and contact information on Andormera.",
  };
}

function buildSeoTitle({
  title,
  city,
  district,
  price,
  locale,
}: {
  title: string;
  city?: string;
  district?: string;
  price?: number;
  locale: Locale;
}) {
  const location = [district, city]
    .filter(Boolean)
    .join(locale === "fa" ? "، " : ", ");

  const priceText = price ? `€${price.toLocaleString("de-DE")}` : "";

  return [title, location, priceText].filter(Boolean).join(" | ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    return {
      title: "Property not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const typedLocale = locale as Locale;
  const baseUrl = getBaseUrl();
  const fallbackSeo = getFallbackSeo(typedLocale);

  const property = await getPropertySeoBySlug(id);
  // console.log(property, "property");
  if (!property) {
    return {
      title:
        typedLocale === "fa"
          ? "آگهی پیدا نشد | Andormera"
          : typedLocale === "de"
            ? "Anzeige nicht gefunden | Andormera"
            : "Property not found | Andormera",
      description: fallbackSeo.description,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const slug = property.slug || id;

  const title =
    getLocalizedText(property.title, typedLocale) || fallbackSeo.title;

  const description =
    stripText(getLocalizedText(property.description, typedLocale), 160) ||
    fallbackSeo.description;

  const seoTitle = buildSeoTitle({
    title,
    city: property.location?.city,
    district: property.location?.district,
    price: property.price,
    locale: typedLocale,
  });

  const canonicalUrl = `${baseUrl}/${typedLocale}/properties/${slug}`;
  const image = property.images?.[0]?.url;

  return {
    title: seoTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/properties/${slug}`,
        de: `${baseUrl}/de/properties/${slug}`,
        fa: `${baseUrl}/fa/properties/${slug}`,
      },
    },
    openGraph: {
      title: seoTitle,
      description,
      url: canonicalUrl,
      type: "website",
      locale:
        typedLocale === "fa"
          ? "fa_IR"
          : typedLocale === "de"
            ? "de_DE"
            : "en_US",
      siteName: "Andormera",
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: property.status === "active",
      follow: property.status === "active",
    },
  };
}

export default async function PropertyDetailsPage({ params }: Props) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <PropertyDetailsClient locale={locale as Locale} propertyId={id} />;
}
