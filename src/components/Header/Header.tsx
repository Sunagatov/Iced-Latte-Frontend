import logo from '../../../public/logo.svg'
import Image from 'next/image'
import Link from 'next/link'
import CartButton from '../UI/Buttons/CartButton/CartButton'
import LoginIcon from '../UI/AuthIcon/LoginIcon'
import HeaderHeart from '../UI/HeaderHeart/HeaderHeart'

export default function Header() {
  return (
    <header
      className={'sticky left-0 top-0 z-10 mx-auto flex h-14 w-full items-center justify-between bg-primary pl-6 pr-6 mt-2'}>
      <Link href="/">
        <div className={' flex items-center gap-4'}>
          <div className={'h-[21px] w-[19px] sm:h-[31px] sm:w-[28px]'}>
            <Image src={logo} width={28} height={31} alt="Logo" priority />
          </div>
          <span className={'hidden items-center text-L sm:flex'}>
            Iced Latte
          </span>
          <span
            className={'flex items-center text-L font-medium text-primary sm:hidden'}>IL
          </span>
        </div>
      </Link>
      <div className={'flex justify-between gap-6 items-center'}>
        <HeaderHeart />
        <LoginIcon />
        <CartButton />
      </div>
    </header>
  )
}
