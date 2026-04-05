'use client'

import { useEffect, useState } from 'react'
import CartEmpty from '@/features/cart/components/CartEmpty/CartEmpty'
import CartFull from '@/features/cart/components/CartFull/CartFull'
import { type CartSliceStore, useCartStore } from '@/features/cart/store'
import type { ICartItem } from '@/features/cart/types'
import Loader from '@/shared/components/Loader/Loader'

const selectTempItems = (state: CartSliceStore): ICartItem[] => state.tempItems
const selectCount = (state: CartSliceStore): number => state.count
const selectStatus = (state: CartSliceStore): CartSliceStore['status'] =>
  state.status
const selectLastError = (state: CartSliceStore): string | null =>
  state.lastError
const selectGetCartItems = (
  state: CartSliceStore,
): CartSliceStore['getCartItems'] => state.getCartItems
const selectRetryHydration = (
  state: CartSliceStore,
): CartSliceStore['retryHydration'] => state.retryHydration

export default function Cart() {
  const tempItems = useCartStore(selectTempItems)
  const count = useCartStore(selectCount)
  const status = useCartStore(selectStatus)
  const lastError = useCartStore(selectLastError)
  const getCartItems = useCartStore(selectGetCartItems)
  const retryHydration = useCartStore(selectRetryHydration)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && count > 0 && tempItems.length === 0 && status === 'idle') {
      getCartItems().then(
        () => {
          /* no-op */
        },
        () => {
          /* no-op */
        },
      )
    }
  }, [hydrated, count, tempItems.length, status, getCartItems])

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
