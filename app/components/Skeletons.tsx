export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-black/5 bg-white shadow-sm shadow-black/5">
      <div className="h-64 animate-pulse bg-gray-100" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-gray-100" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-100" />

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function PropertiesGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <PropertyCardSkeleton key={item} />
      ))}
    </div>
  );
}

export function AdminPropertySkeleton() {
  return (
    <div className="rounded-[1.7rem] bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-gray-100 md:h-28 md:w-36" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="w-full space-y-3">
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-gray-100" />
              <div className="h-4 w-1/3 animate-pulse rounded-full bg-gray-100" />
            </div>

            <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
            <div className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-gray-100" />
          </div>

          <div className="mt-4 flex gap-2">
            <div className="h-9 w-16 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-9 w-16 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-9 w-20 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminListSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4].map((item) => (
        <AdminPropertySkeleton key={item} />
      ))}
    </div>
  );
}

export function PropertyDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] pb-28 md:pb-10">
      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-10 w-24 animate-pulse rounded-full bg-white" />
          <div className="flex gap-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-white" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-white" />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="h-[340px] animate-pulse rounded-[2rem] bg-white sm:h-[460px] lg:h-[560px]" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="h-40 animate-pulse rounded-[1.5rem] bg-white sm:h-52 lg:h-full" />
            <div className="h-40 animate-pulse rounded-[1.5rem] bg-white sm:h-52 lg:h-full" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <div className="h-9 w-3/4 animate-pulse rounded-full bg-gray-100" />
              <div className="mt-4 h-5 w-1/2 animate-pulse rounded-full bg-gray-100" />

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="h-24 animate-pulse rounded-[1.3rem] bg-gray-100" />
                <div className="h-24 animate-pulse rounded-[1.3rem] bg-gray-100" />
                <div className="h-24 animate-pulse rounded-[1.3rem] bg-gray-100" />
                <div className="h-24 animate-pulse rounded-[1.3rem] bg-gray-100" />
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
              <div className="h-6 w-40 animate-pulse rounded-full bg-gray-100" />
              <div className="mt-5 space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-gray-100" />
                <div className="h-4 w-11/12 animate-pulse rounded-full bg-gray-100" />
                <div className="h-4 w-4/5 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-[2rem] bg-white" />
              <div className="h-64 animate-pulse rounded-[2rem] bg-white" />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
