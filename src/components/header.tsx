import cart_icon from '../../public/cart_icon.svg'
import logo from '../../public/logo.svg'
import Image from 'next/image'
import Link from 'next/link'

export const Header = () => {
  return (
    <section className="fixed left-0 top-0 w-full flex items-center bg-white justify-between pl-9 pr-6 h-24 mx-auto">
      <div className="flex gap-4">
        <Link href="/">
          <div className="w-[19px] h-[21px] sm:w-[28px] sm:h-[31px]">
            <Image src={logo} width={28} height={31} alt="Logo" priority />
          </div>
        </Link>
        <Link href="/" className="hidden items-center sm:flex ">
          Good Folks Roasters
        </Link>
        <Link href="/" className="sm:hidden items-center flex">
          GFR
        </Link>
      </div>
      <div>
        <button className="flex items-center gap-2 text-black sm:bg-slate-300 font-medium py-2 px-4 rounded-full">
          <Image src={cart_icon} width={16} height={17} alt="Cart" priority />
          <p className="hidden items-center sm:flex ">Cart</p>
        </button>
      </div>
    </section>
  )
}
