"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash2 } from "lucide-react";

import { getDictionary, type Locale } from "../lib/i18n";
import type { PropertyImage } from "../types/property";

type CloudinaryUploadResult = {
  info?: {
    secure_url?: string;
    public_id?: string;
  };
};

type ImageUploaderProps = {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
  locale?: Locale;
  maxImages?: number;
};
export default function ImageUploader({
  images,
  onChange,
  locale = "en",
  maxImages = 5,
}: ImageUploaderProps) {
  const t = getDictionary(locale);

  function removeImage(publicId: string) {
    onChange(images.filter((image) => image.publicId !== publicId));
  }

  return (
    <div className="space-y-4">
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          multiple: true,
          maxFiles: 10,
          sources: ["local", "url", "camera"],
          folder: "home-rent/properties",
        }}
        onSuccess={(result) => {
          const uploadResult = result as CloudinaryUploadResult;

          const url = uploadResult.info?.secure_url;
          const publicId = uploadResult.info?.public_id;

          if (!url || !publicId) {
            return;
          }

          const alreadyExists = images.some(
            (image) => image.publicId === publicId,
          );

          if (alreadyExists) {
            return;
          }

          onChange([
            ...images,
            {
              url,
              publicId,
            },
          ]);
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-sm font-black text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
          >
            <ImagePlus size={22} />
            {t.form.uploadImages}
          </button>
        )}
      </CldUploadWidget>

      {images.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">
              {t.form.uploadedImages}
            </p>

            <p className="text-xs font-medium text-gray-400">
              {images.length}{" "}
              {locale === "fa"
                ? "عکس"
                : locale === "de"
                  ? images.length > 1
                    ? "Bilder"
                    : "Bild"
                  : images.length > 1
                    ? "images"
                    : "image"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={image.publicId}
                className="group relative overflow-hidden rounded-2xl bg-gray-100"
              >
                <img
                  src={image.url}
                  alt={`Property image ${index + 1}`}
                  className="h-40 w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    {t.form.mainImage}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(image.publicId)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm backdrop-blur-md transition hover:bg-red-50"
                  aria-label={t.common.delete}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm leading-6 text-gray-500">{t.form.imageHelp}</p>
      )}
    </div>
  );
}
