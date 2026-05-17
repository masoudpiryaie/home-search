import Link from "next/link";
import { Bath, BedDouble, Heart, MapPin, Maximize2 } from "lucide-react";
import type { Property } from "../types/property";
import FavoriteButton from "./FavoriteButton";
import { getLocalizedText } from "@/app/lib/localizedText";
type Props = {
  property: Property;
};

export default function PropertyCard({ property }: Props) {
  const mainImage = property.images?.[0]?.url;
  const title = getLocalizedText(property.title, locale);
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-[1.8rem] border border-black/5 bg-white shadow-sm shadow-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
    >
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {mainImage ? (
          <img
            src={mainImage}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900 shadow-sm backdrop-blur-md">
          {property.listingType === "rent" ? "For rent" : "For sale"}
        </div>

        <FavoriteButton propertyId={property.id} />

        <div className="absolute bottom-4 left-4 rounded-full bg-black/80 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
          {property.price.toLocaleString("de-DE")} €
        </div>
      </div>

      <div className="p-5">
        <h2 className="line-clamp-1 text-lg font-bold tracking-tight text-gray-950">
          {title}
        </h2>

        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={15} />
          <span className="line-clamp-1">
            {property.location.city}
            {property.location.district
              ? `, ${property.location.district}`
              : ""}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="flex items-center justify-center gap-1 rounded-2xl bg-gray-50 px-2 py-3 text-xs font-medium text-gray-700">
            <BedDouble size={16} />
            {property.details.rooms} rooms
          </div>

          <div className="flex items-center justify-center gap-1 rounded-2xl bg-gray-50 px-2 py-3 text-xs font-medium text-gray-700">
            <Maximize2 size={16} />
            {property.details.area} m²
          </div>

          <div className="flex items-center justify-center gap-1 rounded-2xl bg-gray-50 px-2 py-3 text-xs font-medium text-gray-700">
            <Bath size={16} />
            {property.details.bathrooms || 1} bath
          </div>
        </div>
      </div>
    </Link>
  );
}
