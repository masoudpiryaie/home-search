import {
  getPropertyImageSource,
  type PropertyImageSize,
} from "@/app/lib/cloudinaryImage";
import type { PropertyImage as PropertyImageType } from "@/app/types/property";

type PropertyImageProps = {
  image?: PropertyImageType;
  alt: string;
  size?: PropertyImageSize;
  className?: string;
  loading?: "lazy" | "eager";
  fallbackText?: string;
};

export default function PropertyImage({
  image,
  alt,
  size = "card",
  className = "h-full w-full object-cover",
  loading = "lazy",
  fallbackText = "No image",
}: PropertyImageProps) {
  const imageSource = image?.publicId || image?.url;
  const src = getPropertyImageSource(imageSource, size);

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 px-4 text-center text-xs font-bold text-[var(--color-muted)]">
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
    />
  );
}
