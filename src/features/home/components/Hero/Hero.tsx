'use client'

import SearchBar from '@/features/products/components/search/SearchBar'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-[#fafaf9] px-6 text-center sm:min-h-[400px]"
    >
      <div className="z-10 flex w-full max-w-2xl flex-col items-center gap-5 py-14 sm:py-18">
        <span className="rounded-full border border-black/8 bg-white px-4 py-1.5 text-xs font-medium tracking-wide text-black/50 uppercase">
          Curated for you
        </span>
        <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-[#0a0a0a] sm:text-6xl">
          Find what you love
        </h1>
        <p className="max-w-md text-base leading-relaxed text-black/50 sm:text-lg">
          Thousands of products from trusted sellers — all in one place.
        </p>
        <div className="w-full max-w-xl">
          <SearchBar heroMode />
        </div>
        <a
          href="#catalog"
          className="mt-1 inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2 text-sm font-medium text-black/60 transition hover:border-black/20 hover:text-black/80"
        >
          Browse Collection
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#00000008,_transparent_70%)]" />
    </section>
  )
}
