'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { useCartStore, type CartSliceStore } from '@/features/cart/store'
import type { ICartItem } from '@/features/cart/types'
import CartElement from '../CartElement/CartElement'

const selectTempItems = (state: CartSliceStore): ICartItem[] => state.tempItems
const selectTotalPrice = (state: CartSliceStore): number => state.totalPrice
const selectCount = (state: CartSliceStore): number => state.count
const selectStatus = (state: CartSliceStore): CartSliceStore['status'] =>
  state.status
const selectPendingProductIds = (state: CartSliceStore): Set<string> =>
  state.pendingProductIds
const selectAdd = (state: CartSliceStore): CartSliceStore['add'] => state.add
const selectRemove = (state: CartSliceStore): CartSliceStore['remove'] =>
  state.remove
const selectRemoveFullProduct = (
  state: CartSliceStore,
): CartSliceStore['removeFullProduct'] => state.removeFullProduct
const selectClearCart = (state: CartSliceStore): CartSliceStore['clearCart'] =>
  state.clearCart
const selectIsLoggedIn = (state: AuthStore): boolean => state.isLoggedIn

export default function CartFull() {
  const tempItems = useCartStore(selectTempItems)
  const totalPrice = useCartStore(selectTotalPrice)
  const count = useCartStore(selectCount)
  const status = useCartStore(selectStatus)
  const pendingProductIds = useCartStore(selectPendingProductIds)
  const add = useCartStore(selectAdd)
  const remove = useCartStore(selectRemove)
  const removeFullProduct = useCartStore(selectRemoveFullProduct)
  const clearCart = useCartStore(selectClearCart)

  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  const router = useRouter()

  const handleCheckout = (): void => {
    if (isLoggedIn) {
      router.push('/checkout')

      return
    }

    router.push('/signin?next=/checkout')
  }

  const handleClearCart = (): void => {
    void clearCart()
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-primary text-3xl font-bold">Shopping cart</h1>
        <span className="bg-secondary text-secondary rounded-full px-3 py-0.5 text-sm font-medium">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-3">
          {tempItems.map((item: ICartItem) => (
            <CartElement
              add={() => add(item.productInfo.id)}
              isPending={pendingProductIds.has(item.productInfo.id)}
              key={item.id}
              product={item}
              remove={() => remove(item.productInfo.id)}
              removeAll={() => removeFullProduct(item.productInfo.id)}
            />
          ))}

          <button
            className="text-secondary hover:text-negative mt-1 self-start text-sm underline-offset-2 transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            disabled={status === 'syncing'}
            onClick={handleClearCart}
          >
            Clear all
          </button>
        </div>

        <div className="lg:sticky lg:top-6 lg:w-[320px]">
          <div className="bg-secondary overflow-hidden rounded-2xl border border-[#242D3429] shadow-sm">
            <div className="bg-brand-second px-5 py-4">
              <p className="text-brand text-xs font-bold tracking-widest uppercase">
                Order summary
              </p>
            </div>

            <div className="px-5 py-4">
              <div className="mb-3 flex flex-col gap-1.5">
                {tempItems.map((item: ICartItem) => (
                  <div
                    className="flex items-center justify-between gap-2"
                    key={item.id}
                  >
                    <span className="text-secondary max-w-[180px] truncate text-sm">
                      {item.productInfo.name}
                      <span className="text-secondary ml-1 text-xs opacity-60">
                        ×{item.productQuantity}
                      </span>
                    </span>
                    <span className="text-primary shrink-0 text-sm font-medium tabular-nums">
                      $
                      {(item.productInfo.price * item.productQuantity).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-3 border-t border-[#242D3429]" />

              <div className="mb-5 flex items-center justify-between">
                <span className="text-primary text-sm font-semibold">
                  Subtotal
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-secondary text-xs font-medium">$</span>
                  <span className="text-brand text-2xl font-bold tabular-nums">
                    {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="bg-brand-solid text-inverted hover:bg-brand-solid-hover block w-full rounded-[48px] py-3.5 text-center text-base font-semibold transition-colors active:scale-[0.98]"
                onClick={handleCheckout}
              >
                Go to checkout →
              </button>

              <p className="text-secondary mt-3 text-center text-xs">
                🔒 Secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
