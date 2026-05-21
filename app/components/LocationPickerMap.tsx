"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

type LocationPickerMapProps = {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);

  return null;
}

function ClickHandler({
  onChange,
}: {
  onChange: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function LocationPickerMap({
  lat,
  lng,
  onChange,
}: LocationPickerMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom
      className="h-full min-h-[360px] w-full rounded-[22px]"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater lat={lat} lng={lng} />
      <ClickHandler onChange={onChange} />

      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}
