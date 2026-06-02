"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Save } from "lucide-react";

import ImageUploader from "@/app/components/ImageUploader";
import LoadingScreen from "@/app/components/LoadingScreen";
import { useAuth } from "@/app/context/AuthContext";
import type { Locale } from "@/app/lib/i18n";
import { createMarketItem } from "@/app/lib/services/marketService";
import type { PropertyImage } from "@/app/types/property";

type NewMarketItemClientProps = {
  locale: Locale;
};

export default function NewMarketItemClient({
  locale,
}: NewMarketItemClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [images, setImages] = useState<PropertyImage[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const price = Number(formData.get("price") || 0);
    const quantity = Number(formData.get("quantity") || 1);
    const availableAt = String(formData.get("availableAt") || "").trim();

    const contactName = String(formData.get("contactName") || "").trim();
    const contactPhone = String(formData.get("contactPhone") || "").trim();
    const contactEmail = String(formData.get("contactEmail") || "").trim();

    if (!title || !address || price <= 0 || quantity <= 0 || !contactName) {
      alert("لطفاً عنوان، آدرس، قیمت، تعداد و نام تماس را وارد کن.");
      return;
    }

    setSaving(true);

    try {
      await createMarketItem({
        title,
        description,
        address,
        price,
        quantity,
        image: images[0],
        availableAt: availableAt || undefined,
        contactName,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || user.email || undefined,
        status: "active",
        createdBy: user.uid,
      });

      router.push(`/${locale}/market`);
    } catch (error) {
      console.error(error);
      alert("امکان ثبت آگهی فروش وسیله وجود ندارد.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <LoadingScreen text="در حال بررسی حساب کاربری..." />;
  }

  if (!user) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10"
      >
        <div className="max-w-md rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <Package className="mx-auto text-[var(--color-primary)]" size={42} />

          <h1 className="mt-5 text-2xl font-black text-[var(--color-text)]">
            ورود لازم است
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
            برای ثبت آگهی فروش وسیله باید وارد حساب کاربری شوی.
          </p>

          <button
            type="button"
            onClick={() => router.push(`/${locale}/login`)}
            className="mt-6 rounded-[16px] bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-button)]"
          >
            رفتن به ورود
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--color-bg)] px-3 pb-24 pt-4 md:px-5 md:pb-12 md:pt-6"
    >
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:rounded-[34px]">
        <div className="bg-[var(--color-primary)] px-5 py-7 text-white md:px-8 md:py-9">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80 backdrop-blur-md">
            فروش وسایل خانه
          </p>

          <h1 className="mt-4 text-[30px] font-black leading-tight tracking-[-0.04em] md:text-[46px]">
            ثبت آگهی فروش وسیله
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/75 md:text-base">
            اطلاعات وسیله، آدرس، قیمت، تعداد و زمان مناسب را وارد کن.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#fffdf9] p-4 md:p-6">
          <div className="grid gap-4">
            <FormField label="عنوان آگهی" name="title" required />

            <div className="grid gap-2">
              <label className="text-sm font-black text-[var(--color-text)]">
                توضیحات
              </label>

              <textarea
                name="description"
                rows={5}
                className="rounded-[18px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm"
                placeholder="مثلاً وضعیت وسیله، دلیل فروش، شرایط تحویل..."
              />
            </div>

            <FormField label="آدرس" name="address" required />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                label="قیمت به یورو"
                name="price"
                type="number"
                required
              />

              <FormField
                label="تعداد"
                name="quantity"
                type="number"
                defaultValue="1"
                required
              />

              <FormField
                label="زمان مناسب"
                name="availableAt"
                placeholder="مثلاً شنبه عصر"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                label="نام تماس"
                name="contactName"
                defaultValue={user.displayName || ""}
                required
              />

              <FormField label="شماره تماس" name="contactPhone" />

              <FormField
                label="ایمیل"
                name="contactEmail"
                type="email"
                defaultValue={user.email || ""}
              />
            </div>

            <section className="rounded-[24px] border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black text-[var(--color-text)]">
                عکس وسیله
              </h2>

              <p className="mt-1 text-sm font-medium text-[var(--color-muted)]">
                فقط یک عکس اختیاری است. اگر عکس نگذاری، عکس پیش‌فرض نمایش داده
                می‌شود.
              </p>

              <div className="mt-4">
                <ImageUploader
                  images={images}
                  onChange={setImages}
                  locale={locale}
                  maxImages={1}
                />
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary)] text-sm font-black text-white shadow-[var(--shadow-button)] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <Save size={19} />
              )}

              {saving ? "در حال ثبت..." : "ثبت آگهی"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  placeholder = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-black text-[var(--color-text)]">
        {label}
      </label>

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-13 rounded-[18px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text)] shadow-sm placeholder:text-gray-400"
      />
    </div>
  );
}
