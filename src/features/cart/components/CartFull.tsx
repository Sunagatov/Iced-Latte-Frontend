'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import {
  type CartSliceStore,
  useCartStore,
} from '@/features/cart/cartStore'
import { hostedCheckoutEnabled } from '@/features/payment/config'
import type { ICartItem as CartItem } from '@/features/cart/cartTypes'
import CartElement from './CartElement'

const selectTempItems = (state: CartSliceStore): CartItem[] => state.tempItems
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
const selectIsLoggedIn = (state: AuthStore): boolean => state.status === 'authenticated'

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

  const FREE_SHIPPING_THRESHOLD = 200
  const shippingProgress = Math.min(totalPrice / FREE_SHIPPING_THRESHOLD, 1)
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - totalPrice, 0)

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
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="text-3xl font-bold text-black/80">Shopping cart</h1>
        <span className="text-sm text-black/40">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Cart items */}
        <div className="flex flex-1 flex-col gap-3">
          {tempItems.map((item: CartItem) => (
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
            className="mt-1 self-start text-sm text-black/30 underline-offset-2 transition-colors hover:text-red-500 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            disabled={status === 'syncing'}
            onClick={handleClearCart}
          >
            Clear all
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-6 lg:w-[320px]">
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="px-5 pt-5 pb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-black/40">
                Order summary
              </p>
            </div>

            <div className="px-5 pb-5">
              {/* Free shipping progress */}
              <div className="mb-4 rounded-xl bg-[#F0F7F4] px-3.5 py-3">
                {amountToFreeShipping > 0 ? (
                  <p className="mb-2 text-xs text-black/50">
                    <span className="font-semibold text-[#1B4332]">${amountToFreeShipping.toFixed(2)}</span> away from free shipping
                  </p>
                ) : (
                  <p className="mb-2 text-xs font-semibold text-[#1B4332]">
                    You qualify for free shipping!
                  </p>
                )}
                <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full bg-[#1B4332] transition-all duration-500"
                    style={{ width: `${shippingProgress * 100}%` }}
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="mb-4 flex flex-col gap-2">
                {tempItems.map((item: CartItem) => (
                  <div
                    className="flex items-center justify-between gap-2"
                    key={item.id}
                  >
                    <span className="max-w-[180px] truncate text-sm text-black/50">
                      {item.productInfo.name}
                      <span className="ml-1 text-xs text-black/30">
                        x{item.productQuantity}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-black/70">
                      ${(item.productInfo.price * item.productQuantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/[0.06]" />

              <div className="mt-4 mb-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-black/70">Subtotal</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs font-medium text-black/40">$</span>
                  <span className="text-2xl font-bold tabular-nums text-[#1B4332]">
                    {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="block w-full rounded-full bg-[#1B4332] py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-[#143728] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!hostedCheckoutEnabled}
                onClick={handleCheckout}
              >
                Go to checkout
              </button>

              <p className="mt-3 flex items-center justify-center gap-1 text-xs text-black/30">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                {hostedCheckoutEnabled
                  ? 'Secure checkout'
                  : 'Checkout disabled in this environment'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
