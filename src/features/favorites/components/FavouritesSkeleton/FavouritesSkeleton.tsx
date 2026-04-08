export default function FavouritesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[960px] animate-pulse px-4 pt-10 pb-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <div className="bg-secondary h-9 w-40 rounded-lg" />
          <div className="bg-secondary h-4 w-16 rounded" />
        </div>
        <div className="bg-secondary h-10 w-20 rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            className="flex overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
            key={i}
          >
            <div className="bg-secondary h-24 w-24 shrink-0" />
            <div className="flex flex-1 flex-col justify-between gap-2 p-3">
              <div className="bg-secondary h-3 w-1/4 rounded" />
              <div className="bg-secondary h-4 w-2/3 rounded" />
              <div className="bg-secondary h-3 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
