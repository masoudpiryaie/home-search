export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName?: string;
};

export async function geocodeAddress(address: string) {
  try {
    const cleanAddress = address.trim();

    if (!cleanAddress) {
      return null;
    }

    const response = await fetch("/api/geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: cleanAddress }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GeocodeResult;

    if (
      typeof data.lat !== "number" ||
      typeof data.lng !== "number" ||
      Number.isNaN(data.lat) ||
      Number.isNaN(data.lng)
    ) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Geocode error:", error);
    return null;
  }
}
