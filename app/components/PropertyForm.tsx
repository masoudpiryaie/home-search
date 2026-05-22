"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import ImageUploader from "@/app/components/ImageUploader";
import LocationPickerModal from "@/app/components/LocationPickerModal";
import { useAuth } from "@/app/context/AuthContext";
import {
  createProperty,
  updateProperty,
  updateUserProperty,
} from "@/app/lib/propertyService";
import {
  getZodErrorMessage,
  propertySchema,
} from "@/app/lib/propertyValidation";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import { translatePropertyText } from "@/app/lib/translateProperty";
import { validateTextLanguage } from "@/app/lib/languageValidation";
import { geocodeAddress } from "@/app/lib/geocode";
import { buildAddress } from "@/app/lib/location";
import type { Property, PropertyImage } from "@/app/types/property";

type PropertyFormProps = {
  initialData?: Property;
  propertyId?: string;
  mode?: "create" | "edit";
  submitMode?: "admin" | "public";
  locale?: Locale;
};

const defaultFeatures = {
  balcony: false,
  garden: false,
  elevator: false,
  parking: false,
  furnished: false,
  petsAllowed: false,
  cellar: false,
  fittedKitchen: false,
};

type PropertyDraft = Omit<Property, "title" | "description"> & {
  title: Property["title"];
  description: Property["description"];
};

function removeUndefinedValues<T extends Record<string, unknown>>(object: T) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const rawValue = String(value || "").trim();

  if (!rawValue) return undefined;

  const numberValue = Number(rawValue);

  return Number.isNaN(numberValue) ? undefined : numberValue;
}

function isLocalizedText(value: unknown): value is Record<Locale, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    ("en" in value || "fa" in value || "de" in value)
  );
}

function getInitialTextValue(
  value: unknown,
  locale: Locale,
  exactLanguage = false,
) {
  if (!value) return "";

  if (typeof value === "string") {
    return exactLanguage ? "" : value;
  }

  if (typeof value === "object" && value !== null) {
    const localizedValue = value as Partial<Record<Locale, string>>;

    if (exactLanguage) {
      return localizedValue[locale] || "";
    }

    return (
      localizedValue[locale] ||
      localizedValue.en ||
      localizedValue.de ||
      localizedValue.fa ||
      ""
    );
  }

  return "";
}

function mergeLocalizedText(
  currentValue: Property["title"] | Property["description"] | undefined,
  nextValue: string,
  language: Locale,
) {
  if (isLocalizedText(currentValue)) {
    return {
      en: currentValue.en || "",
      fa: currentValue.fa || "",
      de: currentValue.de || "",
      [language]: nextValue,
    };
  }

  return {
    en:
      language === "en"
        ? nextValue
        : typeof currentValue === "string"
          ? currentValue
          : "",
    fa: language === "fa" ? nextValue : "",
    de: language === "de" ? nextValue : "",
  };
}

export default function PropertyForm({
  initialData,
  propertyId,
  mode = "create",
  submitMode = "admin",
  locale = "en",
}: PropertyFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const t = getDictionary(locale);

  const [images, setImages] = useState<PropertyImage[]>([]);
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [contentLanguage, setContentLanguage] = useState<Locale>(
    initialData?.originalLanguage || locale,
  );

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [city, setCity] = useState(initialData?.location?.city || "");
  const [district, setDistrict] = useState(
    initialData?.location?.district || "",
  );
  const [street, setStreet] = useState(initialData?.location?.street || "");
  const [postalCode, setPostalCode] = useState(
    initialData?.location?.postalCode || "",
  );

  const [selectedLocation, setSelectedLocation] = useState<{
    lat?: number;
    lng?: number;
  }>({
    lat: initialData?.location?.lat,
    lng: initialData?.location?.lng,
  });

  useEffect(() => {
    if (!initialData) return;

    setImages(initialData.images || []);
    setListingType(initialData.listingType || "rent");
    setContentLanguage(initialData.originalLanguage || locale);

    setCity(initialData.location?.city || "");
    setDistrict(initialData.location?.district || "");
    setStreet(initialData.location?.street || "");
    setPostalCode(initialData.location?.postalCode || "");

    setSelectedLocation({
      lat: initialData.location?.lat,
      lng: initialData.location?.lng,
    });
  }, [initialData, locale]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const selectedListingType = formData.get("listingType") as "rent" | "sale";
    const price = Number(formData.get("price") || 0);
    const area = Number(formData.get("area") || 0);

    const rawTitle = String(formData.get("title") || "").trim();
    const rawDescription = String(formData.get("description") || "").trim();

    const sourceLanguage = submitMode === "admin" ? contentLanguage : locale;

    if (submitMode === "public") {
      const languageValidation = validateTextLanguage({
        locale,
        title: rawTitle,
        description: rawDescription,
      });

      if (!languageValidation.valid) {
        setErrorMessage(languageValidation.message);
        setLoading(false);
        return;
      }
    }

    const property: PropertyDraft = {
      title: rawTitle,
      description: rawDescription,
      originalLanguage: sourceLanguage,

      listingType: selectedListingType,
      propertyType: formData.get("propertyType") as Property["propertyType"],

      status:
        submitMode === "admin"
          ? (formData.get("status") as Property["status"])
          : "pending",

      price,
      currency: "EUR",

      location: removeUndefinedValues({
        country: "Germany",
        city: city.trim(),
        district: district.trim() || undefined,
        street: street.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      }),

      details: removeUndefinedValues({
        rooms: Number(formData.get("rooms") || 0),
        bedrooms: optionalNumber(formData.get("bedrooms")),
        bathrooms: optionalNumber(formData.get("bathrooms")),
        area,
        floor: optionalNumber(formData.get("floor")),
        totalFloors: optionalNumber(formData.get("totalFloors")),
        yearBuilt: optionalNumber(formData.get("yearBuilt")),
      }),

      features: {
        ...defaultFeatures,
        balcony: formData.get("balcony") === "on",
        garden: formData.get("garden") === "on",
        elevator: formData.get("elevator") === "on",
        parking: formData.get("parking") === "on",
        furnished: formData.get("furnished") === "on",
        petsAllowed: formData.get("petsAllowed") === "on",
        cellar: formData.get("cellar") === "on",
        fittedKitchen: formData.get("fittedKitchen") === "on",
      },

      images,

      contact: removeUndefinedValues({
        name: String(formData.get("contactName") || "").trim(),
        email: String(formData.get("contactEmail") || "").trim(),
        phone: String(formData.get("contactPhone") || "").trim() || undefined,
      }),

      submittedBy:
        submitMode === "public"
          ? removeUndefinedValues({
              uid: user?.uid,
              name:
                user?.displayName ||
                String(formData.get("contactName") || "").trim(),
              email:
                user?.email ||
                String(formData.get("contactEmail") || "").trim(),
            })
          : initialData?.submittedBy,
      editCount: initialData?.editCount || 0,
      lastEditedByUserAt: initialData?.lastEditedByUserAt,
    };

    if (selectedListingType === "rent") {
      property.rentDetails = removeUndefinedValues({
        coldRent: optionalNumber(formData.get("coldRent")),
        warmRent: optionalNumber(formData.get("warmRent")),
        utilities: optionalNumber(formData.get("utilities")),
        deposit: optionalNumber(formData.get("deposit")),
        availableFrom:
          String(formData.get("availableFrom") || "").trim() || undefined,
      });
    }

    if (selectedListingType === "sale") {
      property.saleDetails = {
        purchasePrice: price,
        pricePerSqm: area > 0 ? price / area : 0,
      };
    }

    try {
      if (submitMode === "public" && !user) {
        setErrorMessage(
          locale === "fa"
            ? "برای ثبت آگهی باید وارد حساب کاربری شوید."
            : locale === "de"
              ? "Bitte melde dich an, um eine Anzeige aufzugeben."
              : "You must be logged in to submit a listing.",
        );
        setLoading(false);
        return;
      }

      if (images.length === 0) {
        setErrorMessage(
          locale === "fa"
            ? "لطفاً حداقل یک عکس برای ملک آپلود کن."
            : locale === "de"
              ? "Bitte lade mindestens ein Bild hoch."
              : "Please upload at least one property image.",
        );
        setLoading(false);
        return;
      }

      if (submitMode === "public") {
        const translatedText = await translatePropertyText({
          sourceLanguage: locale,
          title: rawTitle,
          description: rawDescription,
        });

        property.title = translatedText.title;
        property.description = translatedText.description;
        property.originalLanguage = locale;
      } else {
        if (mode === "edit" && initialData) {
          property.title = mergeLocalizedText(
            initialData.title,
            rawTitle,
            sourceLanguage,
          );

          property.description = mergeLocalizedText(
            initialData.description,
            rawDescription,
            sourceLanguage,
          );

          property.originalLanguage =
            initialData.originalLanguage || sourceLanguage;
        } else {
          const translatedText = await translatePropertyText({
            sourceLanguage,
            title: rawTitle,
            description: rawDescription,
          });

          property.title = translatedText.title;
          property.description = translatedText.description;
          property.originalLanguage = sourceLanguage;
        }
      }

      const hasSelectedCoordinates =
        typeof selectedLocation.lat === "number" &&
        typeof selectedLocation.lng === "number";

      if (hasSelectedCoordinates) {
        property.location = {
          ...property.location,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        };
      } else {
        const address = buildAddress(property.location);
        const coordinates = await geocodeAddress(address);

        if (coordinates) {
          property.location = {
            ...property.location,
            lat: coordinates.lat,
            lng: coordinates.lng,
          };
        } else {
          setErrorMessage(
            locale === "fa"
              ? "موقعیت ملک پیدا نشد. لطفاً روی دکمه «انتخاب روی نقشه» بزن و نقطه دقیق خانه را روی نقشه انتخاب کن."
              : locale === "de"
                ? "Der Standort konnte nicht gefunden werden. Bitte wähle den genauen Punkt auf der Karte aus."
                : "The property location could not be found. Please choose the exact point on the map.",
          );

          setLoading(false);
          return;
        }
      }

      const validatedProperty = propertySchema.parse(property) as Property;

      if (mode === "edit" && propertyId) {
        if (submitMode === "public") {
          const currentEditCount = initialData?.editCount || 0;

          if (currentEditCount >= 2) {
            setErrorMessage(
              locale === "fa"
                ? "شما قبلاً ۲ بار این آگهی را ویرایش کرده‌اید و دیگر امکان ویرایش وجود ندارد."
                : locale === "de"
                  ? "Du hast diese Anzeige bereits 2 Mal bearbeitet. Weitere Änderungen sind nicht möglich."
                  : "You have already edited this listing 2 times. More edits are not allowed.",
            );

            setLoading(false);
            return;
          }

          await updateUserProperty(
            propertyId,
            validatedProperty,
            currentEditCount + 1,
          );
        } else {
          await updateProperty(propertyId, validatedProperty);
        }
      } else {
        await createProperty(validatedProperty);
      }

      if (submitMode === "public") {
        router.push(`/${locale}/submit-property/success`);
      } else {
        router.push("/admin/properties");
      }
    } catch (error) {
      console.error(error);

      const message = getZodErrorMessage(error);

      if (message !== "Something went wrong.") {
        setErrorMessage(message);
      } else {
        setErrorMessage(
          mode === "edit"
            ? locale === "fa"
              ? "امکان ویرایش آگهی وجود ندارد."
              : locale === "de"
                ? "Die Anzeige konnte nicht aktualisiert werden."
                : "Could not update property."
            : locale === "fa"
              ? "امکان ساخت آگهی وجود ندارد."
              : locale === "de"
                ? "Die Anzeige konnte nicht erstellt werden."
                : "Could not create property.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const data = initialData;
  const isAdminMode = submitMode === "admin";

  const featureItems: Array<[keyof Property["features"], string]> = [
    ["balcony", t.form.balcony],
    ["garden", t.form.garden],
    ["elevator", t.form.elevator],
    ["parking", t.form.parking],
    ["furnished", t.form.furnished],
    ["petsAllowed", t.form.petsAllowed],
    ["cellar", t.form.cellar],
    ["fittedKitchen", t.form.fittedKitchen],
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
        <h2 className="mb-5 text-xl font-black text-[var(--color-text)]">
          {t.form.basicInformation}
        </h2>

        {isAdminMode && (
          <div className="mb-5 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-primary-soft)] p-4">
            <label className="block text-sm font-black text-[var(--color-text)]">
              Listing content language
            </label>

            <p className="mt-1 text-xs font-semibold leading-5 text-[var(--color-muted)]">
              Choose which language you are editing. Other languages will not be
              removed.
            </p>

            <select
              value={contentLanguage}
              onChange={(event) =>
                setContentLanguage(event.target.value as Locale)
              }
              className="mt-3 h-12 w-full rounded-[16px] border border-[var(--color-border)] bg-white px-4 text-sm font-black text-[var(--color-text)] shadow-sm md:w-64"
            >
              <option value="en">English</option>
              <option value="fa">فارسی</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            key={`title-${contentLanguage}`}
            name="title"
            required
            defaultValue={getInitialTextValue(
              data?.title,
              isAdminMode ? contentLanguage : locale,
              isAdminMode,
            )}
            placeholder={t.form.titlePlaceholder}
          />

          <Select
            name="listingType"
            value={listingType}
            onChange={(event) =>
              setListingType(event.target.value as "rent" | "sale")
            }
          >
            <option value="rent">{t.form.forRent}</option>
            <option value="sale">{t.form.forSale}</option>
          </Select>

          <Select
            name="propertyType"
            defaultValue={data?.propertyType || "apartment"}
          >
            <option value="apartment">{t.form.apartment}</option>
            <option value="house">{t.form.house}</option>
            <option value="studio">{t.form.studio}</option>
            <option value="room">{t.form.room}</option>
          </Select>

          {submitMode === "admin" ? (
            <Select name="status" defaultValue={data?.status || "active"}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
            </Select>
          ) : (
            <input name="status" type="hidden" value="pending" />
          )}

          <Input
            name="price"
            required
            type="number"
            defaultValue={data?.price || ""}
            placeholder={
              listingType === "rent"
                ? t.form.monthlyPricePlaceholder
                : t.form.salePricePlaceholder
            }
          />

          <Input
            name="area"
            required
            type="number"
            defaultValue={data?.details?.area || ""}
            placeholder={t.form.area}
          />
        </div>

        <textarea
          key={`description-${contentLanguage}`}
          name="description"
          required
          defaultValue={getInitialTextValue(
            data?.description,
            isAdminMode ? contentLanguage : locale,
            isAdminMode,
          )}
          placeholder={t.form.descriptionPlaceholder}
          rows={7}
          className="mt-4 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 text-sm text-[var(--color-text)] shadow-sm placeholder:text-gray-400"
        />
      </section>

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
        <h2 className="mb-5 text-xl font-black text-[var(--color-text)]">
          {t.form.images}
        </h2>
        <ImageUploader
          images={images}
          onChange={setImages}
          locale={locale}
          maxImages={5}
        />
      </section>

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-[var(--color-text)]">
              {t.form.location}
            </h2>

            <p className="mt-1 text-sm font-medium text-[var(--color-muted)]">
              {t.locationPicker.helperText}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setLocationPickerOpen(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary)] px-5 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)]"
          >
            <MapPin size={18} />
            {t.locationPicker.chooseOnMap}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="city"
            required
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder={t.form.city}
          />

          <Input
            name="district"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            placeholder={t.form.district}
          />

          <Input
            name="street"
            value={street}
            onChange={(event) => setStreet(event.target.value)}
            placeholder={t.form.street}
          />

          <Input
            name="postalCode"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            placeholder={t.form.postalCode}
          />
        </div>

        {typeof selectedLocation.lat === "number" &&
          typeof selectedLocation.lng === "number" && (
            <div className="mt-4 flex flex-col gap-2 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-primary-soft)] px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm font-black text-[var(--color-primary)]">
                <MapPin size={18} />
                {t.locationPicker.mapSelected}
              </div>

              <p className="text-xs font-bold text-[var(--color-text)]">
                {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

        <LocationPickerModal
          open={locationPickerOpen}
          locale={locale}
          address={{
            country: "Germany",
            city,
            district,
            street,
            postalCode,
          }}
          value={selectedLocation}
          onClose={() => setLocationPickerOpen(false)}
          onConfirm={(coords) => {
            setSelectedLocation({
              lat: coords.lat,
              lng: coords.lng,
            });
          }}
        />
      </section>

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
        <h2 className="mb-5 text-xl font-black text-[var(--color-text)]">
          {t.form.details}
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="rooms"
            required
            type="number"
            step="0.5"
            defaultValue={data?.details?.rooms || ""}
            placeholder={t.form.rooms}
          />

          <Input
            name="bedrooms"
            type="number"
            defaultValue={data?.details?.bedrooms || ""}
            placeholder={t.form.bedrooms}
          />

          <Input
            name="bathrooms"
            type="number"
            defaultValue={data?.details?.bathrooms || ""}
            placeholder={t.form.bathrooms}
          />

          <Input
            name="floor"
            type="number"
            defaultValue={data?.details?.floor || ""}
            placeholder={t.form.floor}
          />

          <Input
            name="totalFloors"
            type="number"
            defaultValue={data?.details?.totalFloors || ""}
            placeholder={t.form.totalFloors}
          />

          <Input
            name="yearBuilt"
            type="number"
            defaultValue={data?.details?.yearBuilt || ""}
            placeholder={t.form.yearBuilt}
          />
        </div>
      </section>

      {listingType === "rent" && (
        <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
          <h2 className="mb-5 text-xl font-black text-[var(--color-text)]">
            {t.form.rentDetails}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              name="coldRent"
              type="number"
              defaultValue={data?.rentDetails?.coldRent || ""}
              placeholder={t.form.coldRent}
            />

            <Input
              name="warmRent"
              type="number"
              defaultValue={data?.rentDetails?.warmRent || ""}
              placeholder={t.form.warmRent}
            />

            <Input
              name="utilities"
              type="number"
              defaultValue={data?.rentDetails?.utilities || ""}
              placeholder={t.form.utilities}
            />

            <Input
              name="deposit"
              type="number"
              defaultValue={data?.rentDetails?.deposit || ""}
              placeholder={t.form.deposit}
            />

            <Input
              name="availableFrom"
              type="date"
              defaultValue={data?.rentDetails?.availableFrom || ""}
            />
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
        <h2 className="mb-5 text-xl font-black text-[var(--color-text)]">
          {t.form.features}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {featureItems.map(([name, label]) => (
            <label
              key={name}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 text-sm font-semibold text-[var(--color-text)] shadow-sm"
            >
              <input
                name={name}
                type="checkbox"
                defaultChecked={
                  data?.features ? Boolean(data.features[name]) : false
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
        <h2 className="mb-5 text-xl font-black text-[var(--color-text)]">
          {t.form.contact}
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="contactName"
            required
            defaultValue={data?.contact?.name || user?.displayName || ""}
            placeholder={t.form.contactName}
          />

          <Input
            name="contactEmail"
            required
            type="email"
            defaultValue={data?.contact?.email || user?.email || ""}
            placeholder={t.form.contactEmail}
          />

          <Input
            name="contactPhone"
            defaultValue={data?.contact?.phone || ""}
            placeholder={t.form.contactPhone}
          />
        </div>
      </section>

      {errorMessage && (
        <div className="whitespace-pre-line rounded-2xl bg-red-50 px-4 py-4 text-sm font-bold leading-6 text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="sticky bottom-24 z-30 rounded-[1.5rem] border border-[var(--color-border)] bg-white/90 p-3 shadow-[var(--shadow-card)] backdrop-blur-xl md:bottom-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)] disabled:opacity-50 md:w-auto"
        >
          {loading
            ? mode === "edit"
              ? t.form.updatingProperty
              : submitMode === "public"
                ? t.form.submittingListing
                : t.form.creatingProperty
            : mode === "edit"
              ? t.form.updateProperty
              : submitMode === "public"
                ? t.form.submitForReview
                : t.form.createProperty}
        </button>
      </div>
    </form>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 text-sm text-[var(--color-text)] shadow-sm placeholder:text-gray-400 ${className}`}
    />
  );
}

function Select({
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 text-sm font-medium text-[var(--color-text)] shadow-sm ${className}`}
    />
  );
}
