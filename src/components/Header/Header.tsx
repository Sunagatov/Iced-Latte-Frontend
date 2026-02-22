'use client'

import logo from '../../../public/logo.svg'
import Image from 'next/image'
import Link from 'next/link'
import CartButton from '../UI/Buttons/CartButton/CartButton'
import LoginIcon from '../UI/AuthIcon/LoginIcon'
import HeaderHeart from '../UI/HeaderHeart/HeaderHeart'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="sticky left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-black/5 bg-white/90 px-4 backdrop-blur-md sm:px-8 gap-4">
      <Link href="/" className="flex shrink-0 items-center gap-3 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-solid shadow-sm transition group-hover:bg-brand-solid-hover">
          <Image src={logo} width={18} alt="Iced Latte" priority className="invert" />
        </div>
        <span className="hidden text-base font-semibold tracking-tight text-primary sm:block">
          Iced Latte
        </span>
      </Link>

      <SearchBar />

      <div className="flex shrink-0 items-center gap-1">
        <HeaderHeart />
        <CartButton />
        <div className="ml-2">
          <LoginIcon />
        </div>
      </div>
    </header>
  )
}
