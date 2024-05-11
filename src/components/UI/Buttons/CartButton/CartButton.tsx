'use client'
import Link from 'next/link'
import Image from 'next/image'
import cart_icon from '../../../../../public/cart_icon.svg'
import { useStoreData } from '@/hooks/useStoreData'
import { useCombinedStore } from '@/store/store'

export default function CartButton() {
  const count = useStoreData(useCombinedStore, (state) => state.count)

  return (
    <Link href={'/cart'}>
      <div className="relative flex h-[48px] items-center gap-2 px-4  ">
        <div className="flex flex-col items-center ">
          <Image src={cart_icon} width={24} height={24} alt="Cart" priority />
          <p className="hidden items-center font-medium text-primary text-opacity-50 sm:flex">
            cart
          </p>
        </div>
        {!!count && (
          <div className="absolute right-[13px] top-[9px] flex h-4 w-4 items-center justify-center rounded-full border  bg-brand-solid p-1 sm:right-[12px] sm:top-[-8px] sm:h-5 sm:w-5 ">
            <span className="text-[8px] text-white">{count}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
