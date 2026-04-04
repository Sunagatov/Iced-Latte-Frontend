export default function FavouritesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[960px] px-4 pt-10 pb-16 animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <div className="h-9 w-40 rounded-lg bg-secondary" />
          <div className="h-4 w-16 rounded bg-secondary" />
        </div>
        <div className="h-10 w-20 rounded-xl bg-secondary" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
            <div className="h-24 w-24 shrink-0 bg-secondary" />
            <div className="flex flex-1 flex-col justify-between p-3 gap-2">
              <div className="h-3 w-1/4 rounded bg-secondary" />
              <div className="h-4 w-2/3 rounded bg-secondary" />
              <div className="h-3 w-1/3 rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
