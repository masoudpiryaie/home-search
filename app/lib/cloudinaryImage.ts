type CloudinaryImageOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb";
  gravity?: "auto" | "center";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function getCloudinaryImageUrl(
  publicId: string | undefined,
  options: CloudinaryImageOptions = {},
) {
  if (!publicId || !cloudName) {
    return "";
  }

  const {
    width,
    height,
    crop = "fill",
    gravity = "auto",
    quality = "auto",
    format = "auto",
  } = options;

  const transformations = [
    format ? `f_${format}` : "",
    quality ? `q_${quality}` : "",
    crop ? `c_${crop}` : "",
    gravity ? `g_${gravity}` : "",
    width ? `w_${width}` : "",
    height ? `h_${height}` : "",
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

export function getPropertyImageSources(publicId: string | undefined) {
  return {
    thumb: getCloudinaryImageUrl(publicId, {
      width: 320,
      height: 220,
      crop: "fill",
    }),
    card: getCloudinaryImageUrl(publicId, {
      width: 640,
      height: 420,
      crop: "fill",
    }),
    card2x: getCloudinaryImageUrl(publicId, {
      width: 960,
      height: 630,
      crop: "fill",
    }),
    detail: getCloudinaryImageUrl(publicId, {
      width: 1200,
      height: 760,
      crop: "fill",
    }),
    detail2x: getCloudinaryImageUrl(publicId, {
      width: 1600,
      height: 1000,
      crop: "fill",
    }),
  };
}
