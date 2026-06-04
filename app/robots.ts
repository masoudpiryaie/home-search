import type { MetadataRoute } from "next";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.andormera.com"
  ).replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/en/login",
          "/de/login",
          "/fa/login",
          "/en/my-listings",
          "/de/my-listings",
          "/fa/my-listings",
          "/en/saved",
          "/de/saved",
          "/fa/saved",
          "/en/notifications",
          "/de/notifications",
          "/fa/notifications",
          "/en/submit-property",
          "/de/submit-property",
          "/fa/submit-property",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
