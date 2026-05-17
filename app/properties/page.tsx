import { Suspense } from "react";

import PropertiesClient from "./PropertiesClient";
import { PropertiesGridSkeleton } from "../components/Skeletons";

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 md:px-6 md:py-10">
          <div className="mx-auto max-w-7xl">
            <PropertiesGridSkeleton />
          </div>
        </main>
      }
    >
      <PropertiesClient />
    </Suspense>
  );
}
