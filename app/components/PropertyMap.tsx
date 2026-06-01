"use client";

import dynamic from "next/dynamic";

import type { Locale } from "@/app/lib/i18n";

type PropertyMapProps = {
  lat?: number;
  lng?: number;
  locale: Locale;
};

const PropertyMapClient = dynamic(() => import("./PropertyMapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[170px] w-full animate-pulse rounded-[22px] bg-[var(--color-primary-soft)]" />
  ),
});

export default function PropertyMap(props: PropertyMapProps) {
  return <PropertyMapClient {...props} />;
}
