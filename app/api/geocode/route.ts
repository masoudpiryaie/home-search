import { NextResponse } from "next/server";

type GeocodeRequestBody = {
  address: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GeocodeRequestBody;
    const address = String(body.address || "").trim();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required." },
        { status: 400 },
      );
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");

    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "HomeRent/1.0 info@homerent.com",
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not geocode address." },
        { status: 500 },
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Location not found." },
        { status: 404 },
      );
    }

    const firstResult = data[0];

    return NextResponse.json({
      lat: Number(firstResult.lat),
      lng: Number(firstResult.lon),
      displayName: firstResult.display_name,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not geocode location." },
      { status: 500 },
    );
  }
}
