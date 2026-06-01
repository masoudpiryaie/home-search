type CloudinaryImageOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb";
  gravity?: "auto" | "center";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
  dpr?: "auto" | number;
};

export type PropertyImageSize =
  | "thumb"
  | "card"
  | "card2x"
  | "detail"
  | "detail2x"
  | "large";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function isCloudinaryUrl(value: string) {
  return (
    value.includes("res.cloudinary.com") && value.includes("/image/upload/")
  );
}

function buildTransformations(options: CloudinaryImageOptions = {}) {
  const {
    width,
    height,
    crop = "fill",
    gravity = "auto",
    quality = "auto",
    format = "auto",
    dpr = "auto",
  } = options;

  return [
    format ? `f_${format}` : "",
    quality ? `q_${quality}` : "",
    dpr ? `dpr_${dpr}` : "",
    crop ? `c_${crop}` : "",
    gravity ? `g_${gravity}` : "",
    width ? `w_${width}` : "",
    height ? `h_${height}` : "",
  ]
    .filter(Boolean)
    .join(",");
}

export function getCloudinaryImageUrl(
  source: string | undefined,
  options: CloudinaryImageOptions = {},
) {
  if (!source) {
    return "";
  }

  const transformations = buildTransformations(options);

  if (isCloudinaryUrl(source)) {
    if (!transformations) return source;

    return source.replace(
      "/image/upload/",
      `/image/upload/${transformations}/`,
    );
  }

  if (!cloudName) {
    return "";
  }

  if (!transformations) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${source}`;
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${source}`;
}

export function getPropertyImageSources(source: string | undefined) {
  return {
    thumb: getCloudinaryImageUrl(source, {
      width: 320,
      height: 220,
      crop: "fill",
      gravity: "auto",
    }),

    card: getCloudinaryImageUrl(source, {
      width: 640,
      height: 420,
      crop: "fill",
      gravity: "auto",
    }),

    card2x: getCloudinaryImageUrl(source, {
      width: 960,
      height: 630,
      crop: "fill",
      gravity: "auto",
    }),

    detail: getCloudinaryImageUrl(source, {
      width: 1200,
      height: 760,
      crop: "fill",
      gravity: "auto",
    }),

    detail2x: getCloudinaryImageUrl(source, {
      width: 1600,
      height: 1000,
      crop: "fill",
      gravity: "auto",
    }),

    large: getCloudinaryImageUrl(source, {
      width: 1800,
      crop: "limit",
      gravity: "auto",
    }),
  };
}

export function getPropertyImageSource(
  source: string | undefined,
  size: PropertyImageSize = "card",
) {
  return getPropertyImageSources(source)[size];
}
