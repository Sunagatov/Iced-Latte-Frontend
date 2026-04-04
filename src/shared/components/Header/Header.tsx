'use client'

import { useEffect, useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import logo from '@/../public/logo.svg'
import LoginIcon from '@/features/auth/components/AuthIcon/LoginIcon'
import HeaderHeart from '@/features/favorites/components/HeaderHeart/HeaderHeart'
import CartButton from '@/shared/components/Buttons/CartButton/CartButton'
import SearchBar from './SearchBar'

const logoSrc = logo as unknown as StaticImageData

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
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' },
    )

    observer.observe(hero)

    return () => observer.disconnect()
  }, [isHome])

  const showSearch = isHome && !heroVisible

  return (
    <header className="sticky left-0 top-0 z-50 flex h-16 w-full items-center gap-3 border-b border-black/5 bg-white/90 px-4 backdrop-blur-md sm:px-8">
      {mobileSearchOpen && showSearch ? (
        <div className="flex w-full items-center gap-2">
          <SearchBar
            autoFocus
            onBlur={() => setMobileSearchOpen(false)}
          />
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
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-solid shadow-sm transition group-hover:bg-brand-solid-hover">
              <Image
                src={logoSrc}
                width={18}
                alt="Iced Latte"
                className="invert"
              />
            </div>
            <span className="hidden text-base font-semibold tracking-tight text-primary sm:block">
              Iced Latte
            </span>
          </Link>

          {showSearch && (
            <div className="hidden flex-1 justify-center sm:flex">
              <SearchBar />
            </div>
          )}

          <div className="ml-auto flex items-center gap-1">
            {showSearch && (
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary sm:hidden"
                aria-label="Open search"
              >
                <svg
                  className="h-5 w-5 text-primary"
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
            <div className="ml-2">
              <LoginIcon />
            </div>
          </div>
        </>
      )}
    </header>
  )
}