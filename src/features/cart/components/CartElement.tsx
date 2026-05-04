'use client'
import Link from 'next/link'
import type { CartElementProps } from '@/features/cart/cartTypes'
import CartItemActions from '@/features/cart/components/CartItemActions'
import { useCartElementState } from '@/features/cart/useCartElementState'
import ProductImage from '@/shared/ui/ProductImage'

export default function CartElement({
  product,
  isPending = false,
  add,
  remove,
  removeAll,
}: Readonly<CartElementProps>) {
  const { productInfo } = product
  const productQuantity = product.productQuantity
  const totalProductPrice = (productInfo.price * productQuantity).toFixed(2)
  const { isFavourited, isFavouritePending, pulse, toggleFavouriteStatus } =
    useCartElementState(productInfo.id, productQuantity)

  return (
    <div
      data-testid="cart-item"
      className="group rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex gap-4">
        <Link href={`/product/${productInfo.id}`} className="shrink-0">
          <div className="relative h-[100px] w-[100px] overflow-hidden rounded-xl bg-[#F8F7F4]">
            <ProductImage
              productFileUrl={productInfo.productFileUrl}
              alt={productInfo.name}
              fill
              sizes="100px"
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-widest uppercase text-black/30">
                {productInfo.brandName}
              </p>
              <Link href={`/product/${productInfo.id}`}>
                <p className="text-[15px] leading-snug font-semibold text-black/80 hover:text-[#1B4332]">
                  {productInfo.name}
                </p>
              </Link>
              <p className="text-xs text-black/40">by {productInfo.sellerName}</p>
            </div>
            <div
              className={`flex shrink-0 items-baseline gap-0.5 transition-all duration-300 ${pulse ? 'scale-110' : 'scale-100'}`}
            >
              <span className="text-xs font-medium text-black/40">$</span>
              <span
                className={`text-xl font-bold tabular-nums ${pulse ? 'text-[#1B4332]' : 'text-black/80'}`}
              >
                {totalProductPrice}
              </span>
            </div>
          </div>

          <CartItemActions
            isFavouritePending={isFavouritePending}
            isFavourited={isFavourited}
            isPending={isPending}
            onAdd={add}
            onRemove={remove}
            onRemoveAll={removeAll}
            onToggleFavourite={toggleFavouriteStatus}
            productPrice={productInfo.price}
            productQuantity={productQuantity}
          />
        </div>
      </div>
    </div>
  )
}
