import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import PropertyForm from "../components/PropertyForm";

export default function SubmitPropertyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm"
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <section className="mb-6 rounded-[2rem] bg-black p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">
                Submit your property
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                Add your property listing
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
                Your listing will be reviewed by our admin before it becomes
                visible on the website.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-md">
              <ShieldCheck size={28} />
              <p className="mt-3 text-sm font-bold">Admin review</p>
              <p className="mt-1 text-xs leading-5 text-white/60">
                This helps us keep listings clean and trusted.
              </p>
            </div>
          </div>
        </section>

        <PropertyForm submitMode="public" />
      </div>
    </main>
  );
}
