'use client'

import { useEffect, useState } from 'react'
import CartEmpty from '@/features/cart/components/CartEmpty/CartEmpty'
import CartFull from '@/features/cart/components/CartFull/CartFull'
import {
  type CartSliceStore,
  type ICartItem,
  useCartStore,
} from '@/features/cart/public'
import Loader from '@/shared/ui/Loader/Loader'

const selectTempItems = (state: CartSliceStore): ICartItem[] => state.tempItems
const selectCount = (state: CartSliceStore): number => state.count
const selectStatus = (state: CartSliceStore): CartSliceStore['status'] =>
  state.status
const selectLastError = (state: CartSliceStore): string | null =>
  state.lastError
const selectHydrate = (
  state: CartSliceStore,
): CartSliceStore['hydrate'] => state.hydrate
const selectRetryHydration = (
  state: CartSliceStore,
): CartSliceStore['retryHydration'] => state.retryHydration

export default function CartPage() {
  const tempItems = useCartStore(selectTempItems)
  const count = useCartStore(selectCount)
  const status = useCartStore(selectStatus)
  const lastError = useCartStore(selectLastError)
  const hydrate = useCartStore(selectHydrate)
  const retryHydration = useCartStore(selectRetryHydration)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && count > 0 && tempItems.length === 0 && status === 'idle') {
      hydrate().then(
        () => {
          /* no-op */
        },
        () => {
          /* no-op */
        },
      )
    }
  }, [hydrated, count, tempItems.length, status, hydrate])

  if (!hydrated || status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-secondary text-sm">
          {lastError ?? 'Failed to load your cart.'}
        </p>
        <button
          className="bg-brand-solid text-inverted hover:bg-brand-solid-hover rounded-full px-5 py-2 text-sm font-semibold"
          onClick={retryHydration}
        >
          Try again
        </button>
      </div>
    )
  }

  return <>{tempItems.length > 0 ? <CartFull /> : <CartEmpty />}</>
}
