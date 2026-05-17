"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ImageUploader from "@/app/components/ImageUploader";
import { useAuth } from "@/app/context/AuthContext";
import { createProperty, updateProperty } from "@/app/lib/propertyService";
import {
  getZodErrorMessage,
  propertySchema,
} from "@/app/lib/propertyValidation";
import { getDictionary, type Locale } from "@/app/lib/i18n";
import { translatePropertyText } from "@/app/lib/translateProperty";
import { validateTextLanguage } from "@/app/lib/languageValidation";
import { Property, PropertyImage } from "../types/property";

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

function removeUndefinedValues<T extends Record<string, unknown>>(object: T) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return undefined;
  }

  const numberValue = Number(rawValue);

  if (Number.isNaN(numberValue)) {
    return undefined;
  }

  return numberValue;
}

function getInitialTextValue(
  value: Property["title"] | Property["description"] | undefined,
  locale: Locale,
) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  const localizedValue = value as Partial<Record<Locale, string>>;

  return (
    localizedValue[locale] ||
    localizedValue.en ||
    localizedValue.de ||
    localizedValue.fa ||
    ""
  );
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

  useEffect(() => {
    if (initialData) {
      setImages(initialData.images || []);
      setListingType(initialData.listingType || "rent");
    }
  }, [initialData]);

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

    const property: Property = {
      title: rawTitle,
      description: rawDescription,
      originalLanguage: locale,

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
        city: String(formData.get("city") || "").trim(),
        district: String(formData.get("district") || "").trim() || undefined,
        street: String(formData.get("street") || "").trim() || undefined,
        postalCode:
          String(formData.get("postalCode") || "").trim() || undefined,
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
          : undefined,
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

      const translatedText = await translatePropertyText({
        sourceLanguage: locale,
        title: rawTitle,
        description: rawDescription,
      });

      property.title = translatedText.title;
      property.description = translatedText.description;
      property.originalLanguage = locale;

      const validatedProperty = propertySchema.parse(property) as Property;

      if (mode === "edit" && propertyId) {
        await updateProperty(propertyId, validatedProperty);
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
      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">
          {t.form.basicInformation}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="title"
            required
            defaultValue={getInitialTextValue(data?.title, locale)}
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
          name="description"
          required
          defaultValue={getInitialTextValue(data?.description, locale)}
          placeholder={t.form.descriptionPlaceholder}
          rows={7}
          className="mt-4 w-full rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-900 placeholder:text-gray-400"
        />
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">
          {t.form.images}
        </h2>

        <ImageUploader images={images} onChange={setImages} locale={locale} />
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">
          {t.form.location}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="city"
            required
            defaultValue={data?.location?.city || ""}
            placeholder={t.form.city}
          />

          <Input
            name="district"
            defaultValue={data?.location?.district || ""}
            placeholder={t.form.district}
          />

          <Input
            name="street"
            defaultValue={data?.location?.street || ""}
            placeholder={t.form.street}
          />

          <Input
            name="postalCode"
            defaultValue={data?.location?.postalCode || ""}
            placeholder={t.form.postalCode}
          />
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">
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
        <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-5 text-xl font-black text-gray-950">
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

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">
          {t.form.features}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {featureItems.map(([name, label]) => (
            <label
              key={name}
              className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700"
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

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">
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

      <div className="sticky bottom-24 z-30 rounded-[1.5rem] border border-black/5 bg-white/90 p-3 shadow-xl shadow-black/10 backdrop-blur-xl md:bottom-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-black px-6 py-4 text-sm font-black text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50 md:w-auto"
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
      className={`rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-900 placeholder:text-gray-400 ${className}`}
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
      className={`rounded-2xl bg-gray-50 px-4 py-4 text-sm font-medium text-gray-700 ${className}`}
    />
  );
}
