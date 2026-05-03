export default function ProductCardSkeleton() {
  return (
    <li className="relative flex w-full max-w-[240px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:min-w-[190px]">
      <div className="aspect-[3/4] w-full bg-black/[0.03]" />
      <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-2">
        <div className="h-4 w-full rounded bg-black/[0.04]" />
        <div className="h-3 w-20 rounded bg-black/[0.04]" />
        <div className="h-3 w-14 rounded bg-black/[0.04]" />
      </div>
      <div className="flex items-center justify-between px-4 pb-3.5">
        <div className="h-5 w-12 rounded bg-black/[0.04]" />
        <div className="h-8 w-8 rounded-full border border-black/[0.06]" />
      </div>
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </li>
  )
}
