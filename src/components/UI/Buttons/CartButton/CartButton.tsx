'use client'
import Link from 'next/link'
import Image from 'next/image'
import cart_icon from '../../../../../public/cart_icon.svg'
import { useCombinedStore } from '@/store/store'

export default function CartButton() {
  const count = useCombinedStore((state) => state.count)

  return (
    <Link href={'/cart'}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5">
        <Image src={cart_icon} alt="Cart" priority />
        {!!count && (
          <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-solid text-[10px] font-bold text-white">
            {count}
          </div>
        )}
      </div>
    </Link>
  )
}
