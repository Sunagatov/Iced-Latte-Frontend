'use client'
import Link from 'next/link'
import { ROUTES } from '@/shared/config/routes'
import type { CartElementProps } from '@/features/cart/cartTypes'
import CartItemActions from '@/features/cart/components/CartItemActions'
import { useCartElementState } from '@/features/cart/useCartElementState'
import ProductImage from '@/shared/ui/ProductImage'
import Rating from '@/shared/ui/Rating'

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 text-amber-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

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
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href={ROUTES.product(productInfo.id)} className="shrink-0">
          <div className="relative h-[112px] w-full overflow-hidden rounded-xl bg-[#F8F7F4] sm:h-[100px] sm:w-[100px]">
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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link href={ROUTES.product(productInfo.id)}>
                <h2 className="line-clamp-2 text-[15px] leading-snug font-semibold text-black/80 transition-colors hover:text-brand">
                  {productInfo.name}
                </h2>
              </Link>
              {(productInfo.brandName || productInfo.sellerName) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {productInfo.brandName && (
                    <span className="rounded-full bg-brand-second px-2.5 py-1 text-[11px] leading-none font-semibold text-brand-solid">
                      {productInfo.brandName}
                    </span>
                  )}
                  {productInfo.sellerName && (
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] leading-none text-tertiary">
                      Sold by {productInfo.sellerName}
                    </span>
                  )}
                </div>
              )}
              {(productInfo.averageRating != null ||
                productInfo.reviewsCount != null ||
                productInfo.weight != null) && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {productInfo.averageRating != null ? (
                    <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 font-medium text-black/70">
                      <StarIcon />
                      <Rating rating={productInfo.averageRating} />
                      {productInfo.reviewsCount != null && (
                        <span className="font-normal text-black/35">
                          ({productInfo.reviewsCount})
                        </span>
                      )}
                    </span>
                  ) : productInfo.reviewsCount != null ? (
                    <span className="rounded-full border border-black/[0.06] bg-white px-2 py-0.5 text-black/40">
                      {productInfo.reviewsCount} reviews
                    </span>
                  ) : null}
                  {productInfo.weight != null && (
                    <span className="rounded-full border border-black/[0.06] bg-white px-2 py-0.5 font-medium text-black/45">
                      {productInfo.weight} g
                    </span>
                  )}
                </div>
              )}
              {productInfo.description && (
                <p className="mt-2 line-clamp-2 max-w-[520px] text-sm leading-5 text-black/55">
                  {productInfo.description}
                </p>
              )}
            </div>
            <div
              className={`flex shrink-0 items-baseline gap-0.5 transition-all duration-300 ${pulse ? 'scale-110' : 'scale-100'}`}
            >
              <span className="text-xs font-medium text-black/40">$</span>
              <span
                className={`text-xl font-bold tabular-nums ${pulse ? 'text-brand' : 'text-black/80'}`}
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
