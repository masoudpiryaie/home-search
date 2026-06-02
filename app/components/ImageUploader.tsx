"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";

import type { Locale } from "@/app/lib/i18n";
import type { PropertyImage } from "@/app/types/property";

type ImageUploaderProps = {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
  locale?: Locale;
  maxImages?: number;
};

type CloudinaryResponse = {
  secure_url: string;
  public_id: string;
};

function getLabels(locale: Locale = "en") {
  if (locale === "fa") {
    return {
      title: "آپلود عکس‌های ملک",
      subtitle: "حداکثر ۷ عکس می‌توانید آپلود کنید.",
      upload: "انتخاب عکس",
      uploading: "در حال آپلود...",
      maxReached: "حداکثر تعداد عکس‌ها انتخاب شده است.",
      remove: "حذف عکس",
      count: "عکس",
      error: "آپلود عکس انجام نشد. لطفاً دوباره تلاش کن.",
      mainImage: "عکس اصلی",
    };
  }

  if (locale === "de") {
    return {
      title: "Immobilienbilder hochladen",
      subtitle: "Du kannst bis zu 7 Bilder hochladen.",
      upload: "Bilder auswählen",
      uploading: "Wird hochgeladen...",
      maxReached: "Die maximale Anzahl an Bildern wurde erreicht.",
      remove: "Bild entfernen",
      count: "Bilder",
      error: "Bild konnte nicht hochgeladen werden. Bitte erneut versuchen.",
      mainImage: "Hauptbild",
    };
  }

  return {
    title: "Upload property photos",
    subtitle: "You can upload up to 7 photos.",
    upload: "Choose photos",
    uploading: "Uploading...",
    maxReached: "Maximum number of photos reached.",
    remove: "Remove image",
    count: "photos",
    error: "Image upload failed. Please try again.",
    mainImage: "Main image",
  };
}

export default function ImageUploader({
  images,
  onChange,
  locale = "en",
  maxImages = 7,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const labels = getLabels(locale);

  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const remainingSlots = Math.max(0, maxImages - images.length);
  const isMaxReached = images.length >= maxImages;

  async function uploadSingleImage(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "properties");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Image upload failed.");
    }

    const data = (await response.json()) as CloudinaryResponse;

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  }

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    setErrorMessage("");

    const filesToUpload = selectedFiles.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setErrorMessage(labels.maxReached);
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const uploadedImages: PropertyImage[] = [];

      for (const file of filesToUpload) {
        const uploadedImage = await uploadSingleImage(file);
        uploadedImages.push(uploadedImage);
      }

      onChange([...images, ...uploadedImages]);
    } catch (error) {
      console.error(error);
      setErrorMessage(labels.error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(publicId: string) {
    onChange(images.filter((image) => image.publicId !== publicId));
  }

  function moveImageToFirst(index: number) {
    if (index === 0) return;

    const nextImages = [...images];
    const selectedImage = nextImages[index];

    nextImages.splice(index, 1);
    nextImages.unshift(selectedImage);

    onChange(nextImages);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-[#fffdf9] p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <UploadCloud size={24} />
            </div>

            <div>
              <p className="text-sm font-black text-[var(--color-text)]">
                {labels.title}
              </p>

              <p className="mt-1 text-sm font-medium leading-6 text-[var(--color-muted)]">
                {labels.subtitle}
              </p>

              <p className="mt-1 text-xs font-bold text-[var(--color-primary)]">
                {images.length} / {maxImages} {labels.count}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || isMaxReached}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ImagePlus size={18} />
            )}

            {uploading ? labels.uploading : labels.upload}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading || isMaxReached}
            onChange={handleFilesChange}
            className="hidden"
          />
        </div>

        {isMaxReached && (
          <p className="mt-4 rounded-[16px] bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
            {labels.maxReached}
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded-[16px] bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {errorMessage}
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.publicId}
              className="group relative overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => moveImageToFirst(index)}
                className="block h-36 w-full overflow-hidden bg-gray-100 sm:h-40"
              >
                <img
                  src={image.url}
                  alt={`Property image ${index + 1}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </button>

              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-[10px] font-black text-white shadow-sm">
                  {labels.mainImage}
                </span>
              )}

              <button
                type="button"
                onClick={() => removeImage(image.publicId)}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-600 shadow-sm transition hover:bg-red-50"
                aria-label={labels.remove}
              >
                <Trash2 size={17} />
              </button>

              <div className="px-3 py-2">
                <p className="text-xs font-bold text-[var(--color-muted)]">
                  {index + 1} / {images.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
