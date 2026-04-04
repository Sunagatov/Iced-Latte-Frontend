'use client'
import CartFull from '@/features/cart/components/CartFull/CartFull'
import CartEmpty from '@/features/cart/components/CartEmpty/CartEmpty'
import { useCartStore } from '@/features/cart/store'
import { useEffect, useState } from 'react'
import Loader from '@/shared/components/Loader/Loader'

export default function Cart() {
  const tempItems = useCartStore((state) => state.tempItems)
  const count = useCartStore((state) => state.count)
  const status = useCartStore((state) => state.status)
  const lastError = useCartStore((state) => state.lastError)
  const getCartItems = useCartStore((state) => state.getCartItems)
  const retryHydration = useCartStore((state) => state.retryHydration)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && count > 0 && tempItems.length === 0 && status === 'idle') {
      getCartItems().catch(() => {})
    }
  }, [hydrated, count, tempItems.length, status, getCartItems])

  if (!hydrated || status === 'loading') return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  )

  if (status === 'error') return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm text-secondary">{lastError ?? 'Failed to load your cart.'}</p>
      <button
        onClick={retryHydration}
        className="rounded-full bg-brand-solid px-5 py-2 text-sm font-semibold text-inverted hover:bg-brand-solid-hover"
      >
        Try again
      </button>
    </div>
  )

  return <>{tempItems.length > 0 ? <CartFull /> : <CartEmpty />}</>
}
