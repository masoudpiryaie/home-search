"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ImageUploader from "./ImageUploader";
import { createProperty, updateProperty } from "../lib/propertyService";
import { getZodErrorMessage, propertySchema } from "../lib/propertyValidation";
import type { Property, PropertyImage } from "../types/property";

type PropertyFormProps = {
  initialData?: Property;
  propertyId?: string;
  mode?: "create" | "edit";
  submitMode?: "admin" | "public";
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

export default function PropertyForm({
  initialData,
  propertyId,
  mode = "create",
  submitMode = "admin",
}: PropertyFormProps) {
  const router = useRouter();

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

    const property: Property = {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),

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
              name: String(formData.get("contactName") || "").trim(),
              email: String(formData.get("contactEmail") || "").trim(),
            })
          : undefined,
    };

    if (selectedListingType === "rent") {
      property.rentDetails = removeUndefinedValues({
        coldRent: optionalNumber(formData.get("coldRent")),
        warmRent: optionalNumber(formData.get("warmRent")),
        utilities: optionalNumber(formData.get("utilities")),
        deposit: optionalNumber(formData.get("deposit")),
        availableFrom: String(formData.get("availableFrom") || "") || undefined,
      });
    }

    if (selectedListingType === "sale") {
      property.saleDetails = {
        purchasePrice: price,
        pricePerSqm: area > 0 ? price / area : 0,
      };
    }

    try {
      if (images.length === 0) {
        setErrorMessage("Please upload at least one property image.");
        setLoading(false);
        return;
      }

      const validatedProperty = propertySchema.parse(property);

      if (mode === "edit" && propertyId) {
        await updateProperty(propertyId, validatedProperty);
      } else {
        await createProperty(validatedProperty);
      }

      if (submitMode === "public") {
        router.push("/submit-property/success");
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
            ? "Could not update property."
            : "Could not create property.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const data = initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">
          Basic information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="title"
            required
            defaultValue={data?.title || ""}
            placeholder="Title, for example Modern apartment in Berlin"
          />

          <Select
            name="listingType"
            value={listingType}
            onChange={(event) =>
              setListingType(event.target.value as "rent" | "sale")
            }
          >
            <option value="rent">For rent</option>
            <option value="sale">For sale</option>
          </Select>

          <Select
            name="propertyType"
            defaultValue={data?.propertyType || "apartment"}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
            <option value="room">Room</option>
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
                ? "Monthly price, for example 1450"
                : "Sale price"
            }
          />

          <Input
            name="area"
            required
            type="number"
            defaultValue={data?.details?.area || ""}
            placeholder="Area m², for example 65"
          />
        </div>

        <textarea
          name="description"
          required
          defaultValue={data?.description || ""}
          placeholder="Describe the property, location, rooms, condition, and important details..."
          rows={7}
          className="mt-4 w-full rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-900 placeholder:text-gray-400"
        />
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">Images</h2>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">Location</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="city"
            required
            defaultValue={data?.location?.city || ""}
            placeholder="City, for example Berlin"
          />

          <Input
            name="district"
            defaultValue={data?.location?.district || ""}
            placeholder="District, for example Mitte"
          />

          <Input
            name="street"
            defaultValue={data?.location?.street || ""}
            placeholder="Street"
          />

          <Input
            name="postalCode"
            defaultValue={data?.location?.postalCode || ""}
            placeholder="Postal code"
          />
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">Details</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="rooms"
            required
            type="number"
            step="0.5"
            defaultValue={data?.details?.rooms || ""}
            placeholder="Rooms"
          />

          <Input
            name="bedrooms"
            type="number"
            defaultValue={data?.details?.bedrooms || ""}
            placeholder="Bedrooms"
          />

          <Input
            name="bathrooms"
            type="number"
            defaultValue={data?.details?.bathrooms || ""}
            placeholder="Bathrooms"
          />

          <Input
            name="floor"
            type="number"
            defaultValue={data?.details?.floor || ""}
            placeholder="Floor"
          />

          <Input
            name="totalFloors"
            type="number"
            defaultValue={data?.details?.totalFloors || ""}
            placeholder="Total floors"
          />

          <Input
            name="yearBuilt"
            type="number"
            defaultValue={data?.details?.yearBuilt || ""}
            placeholder="Year built"
          />
        </div>
      </section>

      {listingType === "rent" && (
        <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-5 text-xl font-black text-gray-950">
            Rent details
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              name="coldRent"
              type="number"
              defaultValue={data?.rentDetails?.coldRent || ""}
              placeholder="Cold rent"
            />

            <Input
              name="warmRent"
              type="number"
              defaultValue={data?.rentDetails?.warmRent || ""}
              placeholder="Warm rent"
            />

            <Input
              name="utilities"
              type="number"
              defaultValue={data?.rentDetails?.utilities || ""}
              placeholder="Utilities"
            />

            <Input
              name="deposit"
              type="number"
              defaultValue={data?.rentDetails?.deposit || ""}
              placeholder="Deposit"
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
        <h2 className="mb-5 text-xl font-black text-gray-950">Features</h2>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[
            ["balcony", "Balcony"],
            ["garden", "Garden"],
            ["elevator", "Elevator"],
            ["parking", "Parking"],
            ["furnished", "Furnished"],
            ["petsAllowed", "Pets allowed"],
            ["cellar", "Cellar"],
            ["fittedKitchen", "Fitted kitchen"],
          ].map(([name, label]) => (
            <label
              key={name}
              className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700"
            >
              <input
                name={name}
                type="checkbox"
                defaultChecked={
                  data?.features
                    ? Boolean(data.features[name as keyof typeof data.features])
                    : false
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-black text-gray-950">Contact</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="contactName"
            required
            defaultValue={data?.contact?.name || ""}
            placeholder="Contact name"
          />

          <Input
            name="contactEmail"
            required
            type="email"
            defaultValue={data?.contact?.email || ""}
            placeholder="Contact email"
          />

          <Input
            name="contactPhone"
            defaultValue={data?.contact?.phone || ""}
            placeholder="Contact phone"
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
              ? "Updating property..."
              : submitMode === "public"
                ? "Submitting listing..."
                : "Creating property..."
            : mode === "edit"
              ? "Update property"
              : submitMode === "public"
                ? "Submit listing for review"
                : "Create property"}
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
