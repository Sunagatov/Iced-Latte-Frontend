import { useCartStore } from '@/features/cart/state/cartStore'

export default function CheckoutSummary() {
  const { tempItems, totalPrice } = useCartStore()

  return (
    <div className="bg-secondary mb-6 rounded-2xl p-4">
      <p className="text-secondary mb-2 text-xs font-bold tracking-widest uppercase">
        Order summary
      </p>
      <div className="flex flex-col gap-1">
        {tempItems.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="text-secondary min-w-0 truncate">
              {item.productInfo.name}{' '}
              <span className="opacity-60">×{item.productQuantity}</span>
            </span>
            <span className="text-primary font-medium tabular-nums">
              ${(item.productInfo.price * item.productQuantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between border-t border-black/10 pt-3">
        <span className="text-primary font-semibold">Total</span>
        <span className="text-brand text-xl font-bold tabular-nums">
          ${totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
