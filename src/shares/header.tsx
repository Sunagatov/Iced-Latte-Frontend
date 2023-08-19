'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import cart_icon from './assets/cart.svg'
import { Login } from './login/login'

export const Header = () => {
  const [loginIsVisible, setLoginIsVisible] = useState(false)
  const LoginVisibleChange = () => {
    setLoginIsVisible(prev => !prev)
  }
  return (
    <header className="fixed left-0 top 0 w-full flex items-center justify-between p-5 h-24">
      <p>Logo</p>
      <div className="flex items-center gap-8">
        <Link href="/">All Coffee</Link>
        <button onClick={() => setLoginIsVisible(true)}
          className="flex items-center gap-2 text-black bg-slate-300 font-medium py-2 px-4 rounded-full"
        >
          <Image src={cart_icon} width={16} height={17} alt="cart" />
          <p>cart</p>
        </button>
      </div>
      {loginIsVisible && createPortal(<Login LoginVisibleChange={LoginVisibleChange} />, document.body)}
    </header>
  )
}
