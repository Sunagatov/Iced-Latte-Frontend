import cart_icon from '../../public/cart_icon.svg'
import logo from '../../public/logo.svg'

import Image from 'next/image'
import Link from 'next/link'

export const Header = () => {
  return (
    <section className="fixed left-0 top-0 w-full flex items-center bg-primary justify-between pl-9 pr-6 h-14 sm:h-24 mx-auto">
      <div className="flex gap-3 items-center sm:gap-4">
        <Link href="/">
          <div className="w-[19px] h-[21px] sm:w-[28px] sm:h-[31px]">
            <Image src={logo} width={28} height={31} alt="Logo" priority />
          </div>
        </Link>
        <Link href="/" className="hidden text-L items-center sm:flex ">
          Good Folks Roasters
        </Link>
        <Link
          href="/"
          className="sm:hidden text-L font-medium items-center text-primary flex"
        >
          GFR
        </Link>
      </div>
      <div>
        <button className="flex items-center gap-2 text-primary sm:bg-secondary font-medium py-2 px-4 rounded-full">
          <div className="w-[20px] h-[20px] sm:w-[16px] sm:h-[17px]">
            <Image src={cart_icon} width={20} height={20} alt="Cart" priority />
          </div>

          <p className="hidden items-center sm:flex ">Cart</p>
        </button>
      </div>
    </section>
  )
}
