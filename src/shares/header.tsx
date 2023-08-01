import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import cart_icon from './assets/cart.svg'

export const Header = () => {
  return (
    <header className="fixed left-0 top 0 w-full flex items-center justify-between p-5 h-24">
      <p>Logo</p>
      <div className="flex items-center gap-8">
        <Link href="/">All Coffe</Link>
        <Link
          className="flex gap-2 text-black bg-slate-300 font-medium py-2 px-4 rounded-full"
          href="cart"
        >
          <Image src={cart_icon} alt="cart" />
          <p>cart</p>
        </Link>
      </div>
    </header>
  )
}
