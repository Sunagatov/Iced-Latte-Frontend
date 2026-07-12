export default function ProfileScreenSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="from-brand-solid to-brand-solid-hover bg-gradient-to-r">
        <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-white/20" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-7 w-48 rounded bg-white/20" />
              <div className="h-4 w-64 rounded bg-white/15" />
            </div>
            <div className="hidden h-10 w-28 rounded-xl bg-white/15 sm:block" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl animate-pulse px-4 py-6">
        <p className="mb-4 text-sm font-medium text-black/45">
          Loading your profile...
        </p>

        <div className="mb-6 flex gap-3 overflow-hidden">
          <div className="h-10 w-28 rounded-full bg-black/[0.06]" />
          <div className="h-10 w-32 rounded-full bg-black/[0.06]" />
          <div className="h-10 w-28 rounded-full bg-black/[0.06]" />
          <div className="h-10 w-28 rounded-full bg-black/[0.06]" />
        </div>

        <div className="flex gap-6">
          <aside className="hidden w-64 space-y-3 lg:block">
            <div className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]" />
            <div className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]" />
            <div className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]" />
          </aside>

          <main className="min-w-0 flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="h-32 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]" />
              <div className="h-32 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]" />
              <div className="h-32 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]" />
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06]">
              <div className="mb-4 h-4 w-32 rounded bg-black/[0.06]" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-20 rounded-xl bg-black/[0.04]" />
                <div className="h-20 rounded-xl bg-black/[0.04]" />
                <div className="h-20 rounded-xl bg-black/[0.04]" />
                <div className="h-20 rounded-xl bg-black/[0.04]" />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06]">
              <div className="mb-4 h-6 w-40 rounded bg-black/[0.06]" />
              <div className="space-y-4">
                <div className="h-5 w-full rounded bg-black/[0.04]" />
                <div className="h-5 w-full rounded bg-black/[0.04]" />
                <div className="h-5 w-full rounded bg-black/[0.04]" />
                <div className="h-5 w-2/3 rounded bg-black/[0.04]" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
