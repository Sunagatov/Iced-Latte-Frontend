'use client'

import SearchBar from '@/features/products/components/search/SearchBar'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-[#1B4332] px-6 text-center sm:min-h-[440px]"
    >
      <div className="z-10 flex w-full max-w-2xl flex-col items-center gap-5 py-16 sm:py-20">
        <span className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-medium tracking-[0.15em] text-white/60 uppercase">
          Curated for you
        </span>
        <h1 className="text-4xl leading-[1.08] font-light tracking-[-0.03em] text-white sm:text-[56px]">
          Discover something
          <span className="block font-semibold italic">extraordinary</span>
        </h1>
        <p className="max-w-sm text-[15px] leading-relaxed text-white/50">
          Premium products from trusted sellers, delivered with care.
        </p>
        <div className="w-full max-w-xl">
          <SearchBar heroMode />
        </div>
        <a
          href="#catalog"
          className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
        >
          Browse Collection
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_#2D6A4F33,_transparent_70%)]" />
    </section>
  )
}
