"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
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

export default function PropertyMap({ lat, lng, locale }: PropertyMapProps) {
  if (!lat || !lng) {
    return (
      <div className="relative h-full min-h-[170px] overflow-hidden rounded-[22px] bg-[var(--color-primary-soft)]">
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(255,255,255,.65)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.65)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="absolute left-1/2 top-1/2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-black text-white shadow-[var(--shadow-button)] -translate-x-1/2 -translate-y-1/2">
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
      className="h-full min-h-[170px] w-full rounded-[22px]"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}
