export default function FavouritesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1100px] animate-pulse px-4 pt-10 pb-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <div className="h-9 w-40 rounded-lg bg-black/[0.06]" />
          <div className="h-4 w-16 rounded bg-black/[0.06]" />
        </div>
        <div className="h-10 w-20 rounded-xl bg-black/[0.06]" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            className="flex overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"
            key={i}
          >
            <div className="h-[120px] w-[140px] shrink-0 bg-[#F8F7F4]" />
            <div className="flex flex-1 flex-col justify-between gap-2 p-4">
              <div className="h-3 w-1/4 rounded bg-black/[0.06]" />
              <div className="h-4 w-2/3 rounded bg-black/[0.06]" />
              <div className="h-3 w-1/3 rounded bg-black/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
