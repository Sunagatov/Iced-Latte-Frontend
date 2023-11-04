import logo from '../../public/logo.svg'

import Image from 'next/image'
import Link from 'next/link'
import CartButton from './CartButton'

export const Header = () => {
  return (
    <section className="sticky left-0 top-0 mx-auto flex h-14 w-full items-center justify-between bg-primary pl-9 pr-6 sm:h-24">
      <Link href="/">
        <div className="flex items-center">
          <div className="h-[21px] w-[19px] sm:h-[31px] sm:w-[28px]">
            <Image src={logo} width={28} height={31} alt="Logo" priority />
          </div>
          <span className="items-center text-L sm:flex">
            Good Folks Roasters
          </span>
          <span className="sm:hidden"></span>
          <span className="flex items-center text-L font-medium text-primary">
            GFR
          </span>
        </div>
      </Link>
      <div>
        <CartButton />
      </div>
    </section>
  )
}
