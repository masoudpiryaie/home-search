export async function trackPropertyView(propertyId: string) {
  if (!propertyId) return false;

  try {
    const response = await fetch(`/api/properties/${propertyId}/view`, {
      method: "POST",
    });

    return response.ok;
  } catch (error) {
    console.warn("Could not track property view:", error);
    return false;
  }
}
