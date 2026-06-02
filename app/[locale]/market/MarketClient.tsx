"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Package, PlusCircle } from "lucide-react";

import LoadingScreen from "@/app/components/LoadingScreen";
import PropertyImage from "@/app/components/PropertyImage";
import { getActiveMarketItems } from "@/app/lib/services/marketService";
import type { Locale } from "@/app/lib/i18n";
import type { MarketItem } from "@/app/types/marketItem";

type MarketClientProps = {
  locale: Locale;
};

const defaultImage = {
  url: "/images/default-market-item.jpg",
  publicId: "",
};

export default function MarketClient({ locale }: MarketClientProps) {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);

      try {
        const data = await getActiveMarketItems();
        setItems(data);
      } catch (error) {
        console.error(error);
        alert("امکان دریافت آگهی‌های فروش وسایل وجود ندارد.");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  if (loading) {
    return <LoadingScreen text="در حال بارگذاری آگهی‌های فروش وسایل..." />;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--color-bg)] px-3 pb-24 pt-4 md:px-5 md:pb-12 md:pt-6"
    >
      <section className="mx-auto max-w-[1488px] overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] md:rounded-[34px]">
        <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 py-7 text-white md:px-8 md:py-9">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80 backdrop-blur-md md:text-sm">
                فقط نسخه فارسی
              </p>

              <h1 className="mt-4 text-[30px] font-black leading-tight tracking-[-0.04em] md:text-[46px]">
                فروش وسایل خانه
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/75 md:text-base">
                اگر وسیله‌ای برای فروش داری، اینجا ثبت کن. کاربران می‌توانند
                آدرس، قیمت، تعداد و توضیحات را ببینند.
              </p>
            </div>

            <Link
              href={`/${locale}/market/new`}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-[18px] bg-white px-5 text-sm font-black text-[var(--color-primary)] shadow-[0_14px_34px_rgba(16,24,40,0.16)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)]"
            >
              <PlusCircle size={18} />
              ثبت آگهی فروش وسیله
            </Link>
          </div>
        </div>

        <div className="bg-[#fffdf9] px-4 py-5 md:px-6 md:py-6">
          {items.length === 0 ? (
            <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <Package size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-black text-[var(--color-text)]">
                هنوز آگهی‌ای ثبت نشده
              </h2>

              <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
                اولین آگهی فروش وسیله را ثبت کن.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <MarketItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function MarketItemCard({ item }: { item: MarketItem }) {
  const image = item.image || defaultImage;

  return (
    <article className="overflow-hidden rounded-[26px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(16,24,40,0.12)]">
      <div className="h-[220px] overflow-hidden bg-gray-100">
        <PropertyImage
          image={image}
          alt={item.title}
          size="card"
          loading="lazy"
          className="h-full w-full object-cover"
          fallbackText="بدون عکس"
        />
      </div>

      <div className="p-4 md:p-5">
        <h2 className="line-clamp-2 text-lg font-black leading-7 tracking-[-0.03em] text-[var(--color-text)]">
          {item.title}
        </h2>

        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted)]">
          <MapPin size={15} />
          <span className="line-clamp-1">{item.address}</span>
        </p>

        {item.description && (
          <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-[var(--color-muted)]">
            {item.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-[var(--color-muted)]">
          <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1.5 text-[var(--color-primary)]">
            {item.price.toLocaleString("de-DE")} €
          </span>

          <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
            تعداد: {item.quantity}
          </span>

          {item.availableAt && (
            <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
              زمان: {item.availableAt}
            </span>
          )}
        </div>

        <div className="mt-5 rounded-[18px] bg-[#fffdf9] p-3 text-sm font-bold leading-6 text-[var(--color-muted)] ring-1 ring-[var(--color-border)]">
          <p>تماس: {item.contactName}</p>

          {item.contactPhone && (
            <a
              href={`tel:${item.contactPhone}`}
              className="mt-1 block text-[var(--color-primary)]"
            >
              {item.contactPhone}
            </a>
          )}

          {item.contactEmail && (
            <a
              href={`mailto:${item.contactEmail}`}
              className="mt-1 block text-[var(--color-primary)]"
            >
              {item.contactEmail}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
