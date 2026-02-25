export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1384px] px-6 py-16 sm:px-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-4">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <span className="text-xl font-bold tracking-tight">Iced Latte</span>
            </div>
            <p className="max-w-[220px] text-sm leading-relaxed text-white/50">
              An open-source specialty coffee marketplace built by the community, for the community.
            </p>
            <a
              href="https://github.com/Sunagatov/Iced-Latte"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
            >
              ⭐ Star on GitHub
            </a>
          </div>

          {/* Shop */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Shop</span>
            <nav className="flex flex-col gap-2 text-sm text-white/60">
              <a href="/" className="transition hover:text-white">All Coffee</a>
              <a href="/favourites" className="transition hover:text-white">Favourites</a>
              <a href="/cart" className="transition hover:text-white">Cart</a>
              <a href="/orders" className="transition hover:text-white">Orders</a>
            </nav>
          </div>

          {/* Community */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Community</span>
            <nav className="flex flex-col gap-2 text-sm text-white/60">
              <a href="https://github.com/Sunagatov/Iced-Latte" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">GitHub</a>
              <a href="https://github.com/Sunagatov/Iced-Latte/issues" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Contribute</a>
              <a href="https://t.me/zufarexplained" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Telegram</a>
              <a href="https://www.linkedin.com/in/zufar-sunagatov/" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">LinkedIn</a>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4" suppressHydrationWarning>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Contact</span>
            <div className="flex flex-col gap-2 text-sm text-white/60" suppressHydrationWarning>
              <a href="tel:(555) 123-4567" className="transition hover:text-white">📞 (555) 123-4567</a>
              <a href="mailto:info@coffeetimecafe.com" className="transition hover:text-white">✉️ info@coffeetimecafe.com</a>
              <a
                href="https://www.linkedin.com/in/zufar-sunagatov/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                💼 Zufar Sunagatov
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/8 pt-6 sm:flex-row sm:items-center" suppressHydrationWarning>
          <span className="text-xs text-white/30">© 2024 Iced Latte. MIT License.</span>
          <span className="text-xs text-white/20">Built with ❤️ by open-source contributors</span>
        </div>
      </div>
    </footer>
  )
}
