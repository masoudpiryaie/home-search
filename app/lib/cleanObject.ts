export function cleanObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cleanObject(item)) as T;
  }

  if (value !== null && typeof value === "object") {
    const cleanedEntries = Object.entries(value as Record<string, unknown>)
      .filter(([, itemValue]) => itemValue !== undefined)
      .map(([key, itemValue]) => [key, cleanObject(itemValue)]);

    return Object.fromEntries(cleanedEntries) as T;
  }

  return value;
}
