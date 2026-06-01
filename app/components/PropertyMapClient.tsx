"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import type { Locale } from "@/app/lib/i18n";

type PropertyMapProps = {
  lat?: number;
  lng?: number;
  locale: Locale;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapFixer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      map.setView([lat, lng], 14);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [map, lat, lng]);

  return null;
}

export default function PropertyMapClient({
  lat,
  lng,
  locale,
}: PropertyMapProps) {
  const hasLocation = typeof lat === "number" && typeof lng === "number";

  if (!hasLocation) {
    return (
      <div className="relative h-full min-h-[170px] overflow-hidden rounded-[22px] bg-[var(--color-primary-soft)]">
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(255,255,255,.65)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.65)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-center text-sm font-black text-white shadow-[var(--shadow-button)]">
          {locale === "fa"
            ? "موقعیت دقیق ثبت نشده"
            : locale === "de"
              ? "Kein genauer Standort"
              : "No exact location"}
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="z-0 h-full min-h-[170px] w-full rounded-[22px]"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFixer lat={lat} lng={lng} />

      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}
