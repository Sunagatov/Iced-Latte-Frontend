'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { useCartStore, type CartSliceStore } from '@/features/cart/store'
import type { ICartItem } from '@/features/cart/types'
import CartElement from '../CartElement/CartElement'

const selectTempItems = (state: CartSliceStore): ICartItem[] => state.tempItems
const selectTotalPrice = (state: CartSliceStore): number => state.totalPrice
const selectCount = (state: CartSliceStore): number => state.count
const selectStatus = (state: CartSliceStore): CartSliceStore['status'] => state.status
const selectPendingProductIds = (state: CartSliceStore): Set<string> => state.pendingProductIds
const selectAdd = (state: CartSliceStore): CartSliceStore['add'] => state.add
const selectRemove = (state: CartSliceStore): CartSliceStore['remove'] => state.remove
const selectRemoveFullProduct = (state: CartSliceStore): CartSliceStore['removeFullProduct'] => state.removeFullProduct
const selectClearCart = (state: CartSliceStore): CartSliceStore['clearCart'] => state.clearCart
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
        <h1 className="text-3xl font-bold text-primary">Shopping cart</h1>
        <span className="rounded-full bg-secondary px-3 py-0.5 text-sm font-medium text-secondary">
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
            className="mt-1 self-start text-sm text-secondary underline-offset-2 transition-colors hover:text-negative hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            disabled={status === 'syncing'}
            onClick={handleClearCart}
          >
            Clear all
          </button>
        </div>

        <div className="lg:sticky lg:top-6 lg:w-[320px]">
          <div className="overflow-hidden rounded-2xl border border-[#242D3429] bg-secondary shadow-sm">
            <div className="bg-brand-second px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand">
                Order summary
              </p>
            </div>

            <div className="px-5 py-4">
              <div className="mb-3 flex flex-col gap-1.5">
                {tempItems.map((item: ICartItem) => (
                  <div className="flex items-center justify-between gap-2" key={item.id}>
                    <span className="max-w-[180px] truncate text-sm text-secondary">
                      {item.productInfo.name}
                      <span className="ml-1 text-xs text-secondary opacity-60">
                        ×{item.productQuantity}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-primary">
                      ${(item.productInfo.price * item.productQuantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-3 border-t border-[#242D3429]" />

              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Subtotal</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs font-medium text-secondary">$</span>
                  <span className="text-2xl font-bold tabular-nums text-brand">
                    {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="block w-full rounded-[48px] bg-brand-solid py-3.5 text-center text-base font-semibold text-inverted transition-colors hover:bg-brand-solid-hover active:scale-[0.98]"
                onClick={handleCheckout}
              >
                Go to checkout →
              </button>

              <p className="mt-3 text-center text-xs text-secondary">
                🔒 Secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}