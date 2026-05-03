'use client'

import SearchBar from '@/features/products/components/search/SearchBar'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a0f0a] via-[#2c1810] to-[#4a2c1a] px-6 text-center sm:min-h-[420px]"
    >
      <div className="z-10 flex w-full max-w-2xl flex-col items-center gap-6 py-16 sm:py-20">
        <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
          ☕ Premium Coffee Marketplace
        </span>
        <h1 className="text-4xl leading-tight font-bold text-white sm:text-6xl">
          Discover Your Perfect Cup
        </h1>
        <p className="max-w-md text-base text-white/70 sm:text-lg">
          Curated specialty coffees from the world&apos;s best roasters,
          delivered to your door.
        </p>
        <div className="w-full max-w-xl">
          <SearchBar heroMode />
        </div>
        <a
          href="#catalog"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
        >
          Browse Collection
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#8B451333,_transparent_60%)]" />
    </section>
  )
}
