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
      <div className="relative flex h-12 w-12 items-center justify-center gap-2 sm:pt-2 ">
        <div className=" flex flex-col items-center justify-center ">
          <Image src={cart_icon} alt="Cart" priority />
          <p className="hidden font-medium text-primary text-opacity-50 sm:flex">
            cart
          </p>
        </div>
        {!!count && (
          <div className=" absolute right-[8px] top-[8px] flex h-4 w-4 items-center justify-center rounded-full border bg-brand-solid  p-1 shadow-header sm:right-[4px] sm:top-[-2px] sm:h-5 sm:w-5 ">
            <span className="text-[12px] font-bold text-white sm:text-[14px]">
              {count}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
