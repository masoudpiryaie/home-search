"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, MapPin, Search, X } from "lucide-react";

import { buildAddress } from "@/app/lib/location";
import { geocodeAddress } from "@/app/lib/geocode";
import { getDictionary, type Locale } from "@/app/lib/i18n";

const LocationPickerMap = dynamic(
  () => import("@/app/components/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)] text-sm font-black text-[var(--color-primary)]">
        Loading map...
      </div>
    ),
  },
);

type LocationValue = {
  lat?: number;
  lng?: number;
};

type AddressValue = {
  country?: string;
  city?: string;
  district?: string;
  street?: string;
  postalCode?: string;
};

type LocationPickerModalProps = {
  open: boolean;
  locale: Locale;
  address: AddressValue;
  value: LocationValue;
  onClose: () => void;
  onConfirm: (coords: { lat: number; lng: number }) => void;
};

const defaultBerlin = {
  lat: 52.52,
  lng: 13.405,
};

export default function LocationPickerModal({
  open,
  locale,
  address,
  value,
  onClose,
  onConfirm,
}: LocationPickerModalProps) {
  const t = getDictionary(locale);
  const labels = t.locationPicker;

  const currentAddress = useMemo(() => buildAddress(address), [address]);

  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({
    lat: value.lat || defaultBerlin.lat,
    lng: value.lng || defaultBerlin.lng,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");

    if (value.lat && value.lng) {
      setCoords({
        lat: value.lat,
        lng: value.lng,
      });
    }

    setQuery(currentAddress);
  }, [open, value.lat, value.lng, currentAddress]);

  if (!open) return null;

  async function handleSearch() {
    const searchValue = query.trim() || currentAddress;

    if (!searchValue) return;

    setLoading(true);
    setError("");

    const result = await geocodeAddress(searchValue);

    if (!result) {
      setError(labels.notFound);
      setLoading(false);
      return;
    }

    setCoords({
      lat: result.lat,
      lng: result.lng,
    });

    setLoading(false);
  }

  function handleConfirm() {
    onConfirm({
      lat: coords.lat,
      lng: coords.lng,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm md:items-center md:p-6">
      <div
        dir={locale === "fa" ? "rtl" : "ltr"}
        className="w-full max-w-5xl overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-5 md:px-6">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-[var(--color-text)]">
              {labels.title}
            </h2>

            <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-[var(--color-muted)]">
              {labels.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-[360px_1fr] md:p-6">
          <div className="space-y-4">
            <div className="rounded-[22px] border border-[var(--color-border)] bg-[#fffdf9] p-4">
              <p className="text-sm font-black text-[var(--color-text)]">
                {labels.currentAddress}
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-muted)]">
                {currentAddress || "-"}
              </p>
            </div>

            <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-3 shadow-sm">
              <div className="flex h-12 items-center gap-2 rounded-[17px] border border-[var(--color-border)] bg-white px-3">
                <Search size={19} className="text-[var(--color-muted)]" />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch();
                  }}
                  placeholder={labels.searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--color-text)] placeholder:text-gray-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] text-sm font-black text-white shadow-[var(--shadow-button)] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                {labels.search}
              </button>

              {error && (
                <p className="mt-3 rounded-[14px] bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                  {error}
                </p>
              )}
            </div>

            <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-primary-soft)] p-4">
              <div className="flex items-center gap-2 text-sm font-black text-[var(--color-primary)]">
                <MapPin size={18} />
                {labels.selected}
              </div>

              <p className="mt-2 text-sm font-bold text-[var(--color-text)]">
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            </div>

            <div className="hidden gap-3 md:grid">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-accent)] text-sm font-black text-white shadow-[var(--shadow-button)]"
              >
                <Check size={18} />
                {labels.confirm}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-[16px] border border-[var(--color-border)] bg-white text-sm font-black text-[var(--color-text)] shadow-sm"
              >
                {labels.cancel}
              </button>
            </div>
          </div>

          <div className="h-[360px] overflow-hidden rounded-[22px] md:h-[560px]">
            <LocationPickerMap
              lat={coords.lat}
              lng={coords.lng}
              onChange={setCoords}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] p-4 md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-[16px] border border-[var(--color-border)] bg-white text-sm font-black text-[var(--color-text)] shadow-sm"
          >
            {labels.cancel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-accent)] text-sm font-black text-white shadow-[var(--shadow-button)]"
          >
            <Check size={18} />
            {labels.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
