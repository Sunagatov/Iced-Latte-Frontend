'use client'

import SearchBar from '@/shared/components/Header/SearchBar'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a0533] via-[#2d1060] to-[#682EFF] px-6 text-center sm:min-h-[420px]"
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
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#682EFF33,_transparent_60%)]" />
    </section>
  )
}
