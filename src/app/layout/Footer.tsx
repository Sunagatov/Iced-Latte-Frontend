import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const copyrightYears = currentYear === 2024 ? '2024' : `2024-${currentYear}`

  return (
    <footer className="bg-[#1B4332] text-white">
      <div className="mx-auto max-w-[1384px] px-6 py-12 sm:px-20 sm:py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">
                Iced Latte
              </span>
            </div>
            <p className="max-w-[240px] text-sm leading-relaxed text-white/50">
              An open-source marketplace built by the community, for the
              community.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Sunagatov"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-white/40 transition hover:text-white"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
              </a>
              <a
                href="https://t.me/lucky_1uck"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="text-white/40 transition hover:text-white"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/zufar-sunagatov/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-white/40 transition hover:text-white"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">
              Shop
            </span>
            <nav className="flex flex-col gap-2 text-sm text-white/60">
              <Link href="/" className="transition hover:text-white">
                All Products
              </Link>
              <Link href="/favourites" className="transition hover:text-white">
                Favourites
              </Link>
              <Link href="/cart" className="transition hover:text-white">
                Cart
              </Link>
              <Link href="/orders" className="transition hover:text-white">
                Orders
              </Link>
            </nav>
          </div>

          {/* Project */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">
              Project
            </span>
            <nav className="flex flex-col gap-2 text-sm text-white/60">
              <a
                href="https://github.com/Sunagatov/Iced-Latte"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Backend Repo
              </a>
              <a
                href="https://github.com/Sunagatov/Iced-Latte-Frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Frontend Repo
              </a>
              <a
                href="https://github.com/Sunagatov/Iced-Latte#-guides--features"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                API Docs
              </a>
              <a
                href="https://github.com/Sunagatov/Iced-Latte/blob/development/.github/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Contribute
              </a>
              <Link href="/terms-of-use" className="transition hover:text-white">
                Terms of Use
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">
              Contact
            </span>
            <nav className="flex flex-col gap-2 text-sm text-white/60">
              <a
                href="mailto:zufar.sunagatov@gmail.com"
                className="transition hover:text-white"
              >
                zufar.sunagatov@gmail.com
              </a>
              <a
                href="https://t.me/lucky_1uck"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Telegram
              </a>
              <a
                href="https://wa.me/447405503609"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                WhatsApp
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/8 pt-6 sm:flex-row sm:items-center"
          suppressHydrationWarning
        >
          <span className="text-xs text-white/30">
            © {copyrightYears} Iced Latte · CC BY-NC 4.0
          </span>
          <span className="text-xs text-white/20">
            Built with <svg className="inline h-3 w-3 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> by open-source contributors
          </span>
        </div>
      </div>
    </footer>
  )
}
