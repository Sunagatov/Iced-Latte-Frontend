'use client'

import Image from 'next/image'
import cart_icon from '../../public/cart_icon.svg'
import { useRouter } from 'next/navigation'

export default function CartButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/cart')
  }

  return (
    <button
      onClick={handleClick}
      className={
        'flex items-center gap-2 rounded-full px-4 py-2 font-medium text-primary sm:bg-secondary'
      }
    >
      <div className={'h-[20px] w-[20px] sm:h-[17px] sm:w-[16px]'}>
        <Image src={cart_icon} width={20} height={20} alt="Cart" priority />
      </div>
      <p className={'hidden items-center sm:flex'}>Cart</p>
    </button>
  )
}
