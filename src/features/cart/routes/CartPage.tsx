'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/public'
import CartEmpty from '@/features/cart/components/CartEmpty'
import CartFull from '@/features/cart/components/CartFull'
import {
  type CartSliceStore,
  type ICartItem,
  useCartStore,
} from '@/features/cart/public'
import Loader from '@/shared/ui/Loader'
import GuestDraftReview from '@/features/session/GuestDraftReview'

const selectTempItems = (state: CartSliceStore): ICartItem[] => state.tempItems
const selectCount = (state: CartSliceStore): number => state.count
const selectStatus = (state: CartSliceStore): CartSliceStore['status'] =>
  state.status
const selectLastError = (state: CartSliceStore): string | null =>
  state.lastError
const selectHydrate = (state: CartSliceStore): CartSliceStore['hydrate'] =>
  state.hydrate
const selectRetryHydration = (
  state: CartSliceStore,
): CartSliceStore['retryHydration'] => state.retryHydration

export default function CartPage() {
  const authStatus = useAuthStore((state) => state.status)
  const tempItems = useCartStore(selectTempItems)
  const count = useCartStore(selectCount)
  const status = useCartStore(selectStatus)
  const lastError = useCartStore(selectLastError)
  const hydrate = useCartStore(selectHydrate)
  const retryHydration = useCartStore(selectRetryHydration)
  const draft = useCartStore((state) => state.guestConflict)
  const editDraft = useCartStore((state) => state.editGuestDraft)
  const retryDraft = useCartStore((state) => state.retryGuestDraft)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (
      authStatus !== 'loading' &&
      hydrated &&
      count > 0 &&
      tempItems.length === 0 &&
      status === 'idle'
    ) {
      hydrate().then(
        () => {
          /* no-op */
        },
        () => {
          /* no-op */
        },
      )
    }
  }, [authStatus, hydrated, count, tempItems.length, status, hydrate])

  if (authStatus === 'loading' || !hydrated || status === 'loading') {
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

  return (
    <>
      {draft && (
        <GuestDraftReview
          message={draft.message}
          busy={status === 'syncing'}
          entries={draft.items.map((item) => ({
            id: item.productId,
            label:
              draft.names?.[item.productId] ??
              tempItems.find((row) => row.productInfo.id === item.productId)
                ?.productInfo.name ??
              `Unavailable product (${item.productId.slice(0, 8)})`,
            quantity: item.productQuantity,
          }))}
          onRemove={(id) =>
            editDraft(draft.items.filter((item) => item.productId !== id))
          }
          onQuantity={(id, quantity) =>
            editDraft(
              draft.items.map((item) =>
                item.productId === id
                  ? { ...item, productQuantity: quantity }
                  : item,
              ),
            )
          }
          onDiscard={() => editDraft([])}
          onRetry={() => {
            void retryDraft().catch(() => {})
          }}
        />
      )}
      {tempItems.length > 0 ? <CartFull /> : <CartEmpty />}
    </>
  )
}
