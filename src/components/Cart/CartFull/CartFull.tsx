import CartElement from '../CartElement/CartElement'
import { useCombinedStore } from '@/store/store'
import { ICartItem } from '@/types/Cart'
import { useAuthStore } from '@/store/authStore'
import { UserData } from '@/types/services/UserServices'
import Link from 'next/link'

const hasValidAddress = (userData: UserData | null): boolean =>
  Boolean(userData?.address?.line && userData?.address?.city && userData?.address?.country)

const getCheckoutHref = (token: string | null, userData: UserData | null): string => {
  if (!token) return '/signin'
  if (!hasValidAddress(userData)) return '/profile'
  return '/checkout'
}

export default function CartFull() {
  const { tempItems, totalPrice, removeFullProduct, remove, add, resetCart } = useCombinedStore()
  const { token, userData } = useAuthStore()
  const checkoutHref = getCheckoutHref(token, userData)
  const itemCount = tempItems.length

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-3xl font-bold text-primary">Shopping cart</h1>
        <span className="rounded-full bg-secondary px-3 py-0.5 text-sm font-medium text-secondary">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Items list */}
        <div className="flex flex-1 flex-col gap-3">
          {tempItems.map((item: ICartItem) => (
            <CartElement
              key={item.id}
              product={item}
              remove={() => remove(item.productInfo.id)}
              removeAll={() => removeFullProduct(item.productInfo.id)}
              add={() => add(item.productInfo.id)}
            />
          ))}
          <button
            onClick={resetCart}
            className="mt-1 self-start text-sm text-secondary underline-offset-2 transition-colors hover:text-negative hover:underline"
          >
            Clear all
          </button>
        </div>

        {/* Sticky order summary */}
        <div className="lg:sticky lg:top-6 lg:w-[320px]">
          <div className="rounded-2xl border border-[#242D3429] bg-secondary overflow-hidden shadow-sm">

            {/* Header band */}
            <div className="bg-brand-second px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand">Order summary</p>
            </div>

            <div className="px-5 py-4">
              {/* Per-item breakdown */}
              <div className="mb-3 flex flex-col gap-1.5">
                {tempItems.map((item: ICartItem) => (
                  <div key={item.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-secondary max-w-[180px]">
                      {item.productInfo.name}
                      <span className="ml-1 text-xs text-secondary opacity-60">×{item.productQuantity}</span>
                    </span>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-primary">
                      ${(item.productInfo.price * item.productQuantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-3 border-t border-[#242D3429]" />

              {/* Subtotal */}
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Subtotal</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs font-medium text-secondary">$</span>
                  <span className="text-2xl font-bold tabular-nums text-brand">{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href={checkoutHref}
                className="block w-full rounded-[48px] bg-brand-solid py-3.5 text-center text-base font-semibold text-inverted transition-colors hover:bg-brand-solid-hover active:scale-[0.98]"
              >
                Go to checkout →
              </Link>

              {/* Trust line */}
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
