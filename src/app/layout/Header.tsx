'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/shared/config/routes'
import { usePathname } from 'next/navigation'
import LoginIcon from '@/features/auth/components/AuthIcon/LoginIcon'
import CartButton from '@/features/cart/components/CartButton'
import HeaderHeart from '@/features/favorites/components/HeaderHeart'
import { SearchBar } from '@/features/products/public'

export default function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [heroVisible, setHeroVisible] = useState(true)

  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    if (!isHome) {
      return
    }

    const hero = document.getElementById('hero')

    if (!hero) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: '-56px 0px 0px 0px' },
    )

    observer.observe(hero)

    return () => observer.disconnect()
  }, [isHome])

  const showSearch = isHome && !heroVisible

  return (
    <header className="sticky top-0 left-0 z-50 flex h-14 w-full items-center gap-4 border-b border-black/[0.06] bg-white px-4 sm:px-8">
      {mobileSearchOpen && showSearch ? (
        <div className="flex w-full items-center gap-2">
          <SearchBar autoFocus onBlur={() => setMobileSearchOpen(false)} />
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="shrink-0 text-sm font-medium text-brand"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <Link href={ROUTES.home} className="group flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center text-brand">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path
                  d="M10 10.5C10 10.5 11.5 8 16 8C20.5 8 22 10.5 22 10.5L20.5 22C20.5 22 19.5 24 16 24C12.5 24 11.5 22 11.5 22L10 10.5Z"
                  fill="white"
                  fillOpacity="0.95"
                />
                <ellipse cx="16" cy="10.5" rx="6" ry="2.5" fill="white" />
                <path
                  d="M22 13C22 13 24.5 13.5 24.5 15.5C24.5 17.5 22 18 22 18"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="hidden text-[17px] font-bold tracking-[-0.02em] text-brand sm:block">
              Iced Latte
            </span>
          </Link>

          {showSearch && (
            <div className="hidden flex-1 justify-center animate-[fade-in-down_0.25s_ease-out] sm:flex">
              <SearchBar />
            </div>
          )}

          <div className="ml-auto flex items-center gap-0.5">
            {showSearch && (
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/[0.04] animate-[fade-in-down_0.25s_ease-out] sm:hidden"
                aria-label="Open search"
              >
                <svg
                  className="h-[18px] w-[18px] text-black/50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            )}
            <HeaderHeart />
            <CartButton />
            <div className="ml-1.5">
              <LoginIcon />
            </div>
          </div>
        </>
      )}
    </header>
  )
}
