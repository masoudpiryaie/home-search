"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

import { useAuth } from "@/app/context/AuthContext";
import LoadingScreen from "@/app/components/LoadingScreen";
import PropertyForm from "@/app/components/PropertyForm";
import { getDictionary, type Locale } from "@/app/lib/i18n";

type SubmitPropertyClientProps = {
  locale: Locale;
};

export default function SubmitPropertyClient({
  locale,
}: SubmitPropertyClientProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const t = getDictionary(locale);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [loading, user, router, locale]);

  if (loading) {
    return <LoadingScreen text={t.common.loading} />;
  }

  if (!user) {
    return (
      <LoadingScreen
        text={
          locale === "fa"
            ? "در حال انتقال به صفحه ورود..."
            : locale === "de"
              ? "Weiterleitung zum Login..."
              : "Redirecting to login..."
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/${locale}`}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm"
        >
          <ArrowLeft size={17} />
          {t.common.backHome}
        </Link>

        <section className="mb-6 rounded-[2rem] bg-[var(--color-primary)] p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">
                {t.nav.submitProperty}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                {t.submitProperty.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
                {t.submitProperty.subtitle}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-md">
              <ShieldCheck size={28} />

              <p className="mt-3 text-sm font-bold">
                {t.submitProperty.adminReview}
              </p>

              <p className="mt-1 text-xs leading-5 text-white/60">
                {t.submitProperty.adminReviewText}
              </p>
            </div>
          </div>
        </section>

        <PropertyForm submitMode="public" locale={locale} />
      </div>
    </main>
  );
}
