'use client'
import Link from 'next/link'
import { useCartStore } from '@/features/cart/state/cartStore'

export default function CartButton() {
  const count = useCartStore((state) => state.count)

  return (
    <Link href={'/cart'}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/[0.04]">
        <svg
          className="h-[18px] w-[18px] text-black/50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {!!count && (
          <div data-testid="header-cart-badge" className="absolute top-0.5 right-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#1B4332] px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </div>
        )}
      </div>
    </Link>
  )
}
