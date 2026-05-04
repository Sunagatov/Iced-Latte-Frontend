'use client'
import Link from 'next/link'
import type { CartElementProps } from '@/features/cart/types/cartTypes'
import CartItemActions from '@/features/cart/components/CartItemActions/CartItemActions'
import { useCartElementState } from '@/features/cart/hooks/useCartElementState'
import ProductImage from '@/shared/ui/ProductImage/ProductImage'

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
      className="bg-primary rounded-2xl border border-[#242D3429] px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Top row: image + name + price */}
      <div className="flex items-center gap-3">
        <Link href={`/product/${productInfo.id}`} className="shrink-0">
          <div className="bg-secondary h-[72px] w-[72px] overflow-hidden rounded-xl">
            <ProductImage
              productFileUrl={productInfo.productFileUrl}
              alt={productInfo.name}
              width={72}
              height={72}
              className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-secondary text-[10px] font-bold tracking-widest uppercase">
              {productInfo.brandName}
            </p>
            <Link href={`/product/${productInfo.id}`}>
              <p className="text-primary hover:text-brand text-[15px] leading-snug font-semibold">
                {productInfo.name}
              </p>
            </Link>
            <p className="text-secondary text-xs">
              by {productInfo.sellerName}
            </p>
          </div>
          <div
            className={`flex shrink-0 items-baseline gap-0.5 transition-all duration-300 ${pulse ? 'scale-110' : 'scale-100'}`}
          >
            <span className="text-secondary text-xs font-medium">$</span>
            <span
              className={`text-lg font-bold tabular-nums ${pulse ? 'text-brand' : 'text-primary'}`}
            >
              {totalProductPrice}
            </span>
          </div>
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
  )
}
