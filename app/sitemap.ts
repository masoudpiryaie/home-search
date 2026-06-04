import type { MetadataRoute } from "next";

import { adminDb } from "@/app/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.andormera.com"
  ).replace(/\/$/, "");
}

function toDate(value: unknown) {
  if (!value) return new Date();

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof value.seconds === "number"
  ) {
    return new Date(value.seconds * 1000);
  }

  return new Date();
}

async function getActivePropertyUrls(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  if (!adminDb) {
    return [];
  }

  try {
    const snapshot = await adminDb
      .collection("properties")
      .where("status", "==", "active")
      .get();

    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const slug = data.slug;

        if (!slug) return null;

        const lastModified = toDate(data.updatedAt || data.createdAt);

        return {
          url: `${baseUrl}/en/properties/${slug}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: {
            languages: {
              en: `${baseUrl}/en/properties/${slug}`,
              de: `${baseUrl}/de/properties/${slug}`,
              fa: `${baseUrl}/fa/properties/${slug}`,
            },
          },
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;
  } catch (error) {
    console.warn("Could not generate property sitemap:", error);
    return [];
  }
}

async function getMarketUrls(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  if (!adminDb) {
    return [];
  }

  try {
    const snapshot = await adminDb
      .collection("marketItems")
      .where("status", "==", "active")
      .get();

    const marketBaseUrls: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/fa/market`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.6,
      },
    ];

    /**
     * فعلاً برای market صفحه detail نداریم.
     * اگر بعداً /fa/market/[id] یا /fa/market/[slug] ساختیم،
     * لینک آیتم‌ها را اینجا اضافه می‌کنیم.
     */
    const marketItemUrls: MetadataRoute.Sitemap = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        url: `${baseUrl}/fa/market`,
        lastModified: toDate(data.updatedAt || data.createdAt),
        changeFrequency: "weekly",
        priority: 0.4,
      };
    });

    return [...marketBaseUrls, ...marketItemUrls];
  } catch (error) {
    console.warn("Could not generate market sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/de`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/fa`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/en/properties?type=rent`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/de/properties?type=rent`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fa/properties?type=rent`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/properties?type=sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/de/properties?type=sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fa/properties?type=sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fa/market`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const [propertyUrls, marketUrls] = await Promise.all([
    getActivePropertyUrls(baseUrl),
    getMarketUrls(baseUrl),
  ]);

  return [...staticUrls, ...propertyUrls, ...marketUrls];
}
