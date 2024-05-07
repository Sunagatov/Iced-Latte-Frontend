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
      <div className="relative flex items-center gap-2 rounded-full px-4 font-medium text-primary">
        <div className="flex flex-col items-center ">
          <Image
            src={cart_icon}
            width={24}
            height={24}
            alt="Cart"
            priority
            className="sm:mb-2"
          />
          <p className="hidden items-center text-primary text-opacity-50 sm:flex">
            cart
          </p>
        </div>
        {!!count && (
          <div className="absolute right-[12px] top-[-5px] flex h-5 w-5 items-center justify-center rounded-full border bg-brand-solid p-1 sm:right-[15px] ">
            <span className="text-[8px] text-white">{count}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
