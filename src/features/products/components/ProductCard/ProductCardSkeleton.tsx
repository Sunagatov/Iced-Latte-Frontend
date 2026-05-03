export default function ProductCardSkeleton() {
  return (
    <li className="flex w-full max-w-[240px] animate-pulse flex-col justify-self-center rounded-2xl border border-black/6 bg-white sm:min-w-[190px]">
      <div className="h-[200px] w-full rounded-t-2xl bg-gray-100 sm:h-[220px]" />
      <div className="flex flex-1 flex-col gap-2 px-3 pt-3 pb-3">
        <div className="h-3 w-16 rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-3 w-24 rounded bg-gray-100" />
      </div>
      <div className="flex items-center justify-between border-t border-black/5 px-3 py-2.5">
        <div className="h-5 w-12 rounded bg-gray-100" />
        <div className="h-8 w-8 rounded-full bg-gray-100 sm:h-9 sm:w-9" />
      </div>
    </li>
  )
}
