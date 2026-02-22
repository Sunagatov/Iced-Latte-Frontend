export default function Hero() {
  return (
    <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a0533] via-[#2d1060] to-[#682EFF] px-6 text-center">
      <div className="z-10 flex flex-col items-center gap-6 pb-8 pt-20 sm:py-0">
        <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
          ☕ Premium Coffee Marketplace
        </span>
        <h1 className="max-w-2xl text-5xl font-bold leading-tight text-white sm:text-6xl">
          Discover Your Perfect Cup
        </h1>
        <p className="max-w-md text-lg text-white/70">
          Curated specialty coffees from the world's best roasters, delivered to your door.
        </p>
        <a href="#catalog" className="rounded-full bg-white px-8 py-3 text-base font-semibold text-brand transition hover:bg-white/90">
          Shop Now
        </a>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#682EFF33,_transparent_60%)]" />
    </section>
  )
}
