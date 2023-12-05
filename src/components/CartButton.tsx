'use client'

import Image from 'next/image'
import cart_icon from '../../public/cart_icon.svg'
import { useStoreData } from '@/hooks/useStoreData'
import { useCombinedStore } from '@/store/store'
import Link from 'next/link'

export default function CartButton() {
  const count = useStoreData(useCombinedStore, (state) => state.count)

  const handleClick = () => {}

  return (
    <Link href={'/cart'}>
      <button
        onClick={handleClick}
        className={
          'relative flex items-center gap-2 rounded-full px-4 py-2 font-medium text-primary sm:bg-secondary'
        }
      >
        <div className={'h-[20px] w-[20px] sm:h-[17px] sm:w-[16px]'}>
          <Image src={cart_icon} width={20} height={20} alt="Cart" priority />
        </div>
        {!!count && (
          <div className="absolute left-[-16px] top-0 h-7 w-7 rounded-full bg-fullpage-tint p-1 text-XS leading-5 text-white sm:top-[-12px]">
            <span>{count}</span>
          </div>
        )}
        <p className={'hidden items-center sm:flex'}>Cart</p>
      </button>
    </Link>
  )
}
