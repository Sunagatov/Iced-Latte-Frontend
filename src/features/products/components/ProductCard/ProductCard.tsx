import Link from 'next/link'
import { ROUTES } from '@/shared/config/routes'
import { memo } from 'react'
import { MAX_CART_ITEM_QUANTITY } from '@/features/cart/public'
import { useFavoriteProductActions } from '@/features/favorites/public'
import { IProduct } from '@/features/products/types'
interface ICardProps {
  product: IProduct
  priority?: boolean
}
import ProductRating from '@/features/products/components/ProductRating'
import ProductImage from '@/shared/ui/ProductImage'
import Counter from '@/shared/ui/Counter'

export default memo(function ProductCard({
  product,
  priority = false,
}: Readonly<ICardProps>) {
  const {
    id,
    name,
    productFileUrl,
    price,
    averageRating,
    reviewsCount,
    brandName,
    sellerName,
  } = product

  const {
    addToCart,
    decreaseCartQuantity,
    handleToggleFavourite,
    isCartPending,
    isFavourited,
    isPending,
    quantity,
    removeFromCart,
  } = useFavoriteProductActions(id)

  return (
    <li
      data-testid="product-card"
      className="group relative flex w-full max-w-[240px] flex-col justify-self-center overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] sm:min-w-[190px]"
    >
      <div className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Link href={ROUTES.product(id)} className="relative block h-full w-full">
            <ProductImage
              productFileUrl={productFileUrl}
              alt={name}
              style={{ objectFit: 'contain', padding: '12px' }}
              fill={true}
              sizes="(max-width: 768px) 50vw, 25vw"
              loading={priority ? 'eager' : 'lazy'}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        <button
          aria-busy={isPending}
          aria-label={
            isFavourited ? 'Remove from favourites' : 'Add to favourites'
          }
          aria-pressed={isFavourited}
          className={`focus-visible:ring-brand-solid absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${
            isFavourited
              ? 'bg-brand-solid text-white animate-[heart-pop_0.3s_ease-out]'
              : 'bg-white/80 text-black/40 hover:text-brand'
          }`}
          data-active={isFavourited ? 'true' : 'false'}
          data-testid="favourite-btn"
          disabled={isPending}
          onClick={handleToggleFavourite}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isFavourited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <Link href={ROUTES.product(id)} className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-1 px-4 pt-3 pb-2">
          <h2 className="text-primary line-clamp-2 text-sm leading-snug font-semibold">
            {name}
          </h2>
          <p className="text-[11px] text-black/40">
            {[brandName, sellerName].filter(Boolean).join(' · ')}
          </p>
          <ProductRating rating={averageRating} reviewsCount={reviewsCount} />
        </div>
      </Link>

      <div className="flex items-center justify-between px-4 pb-3.5">
        <p
          data-testid="product-price"
          className="text-base font-bold text-brand"
        >
          {price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>
        {quantity > 0 ? (
          <Counter
            theme="light"
            className={'sm:text-M h-7 gap-1 px-1 text-[11px]'}
            count={quantity}
            disabled={isCartPending}
            maxCount={MAX_CART_ITEM_QUANTITY}
            removeProduct={() =>
              quantity === 1 ? removeFromCart() : decreaseCartQuantity()
            }
            addProduct={addToCart}
          />
        ) : (
          <button
            data-testid="add-to-cart-circle-btn"
            disabled={isCartPending}
            onClick={addToCart}
            className="flex items-center gap-1 rounded-full border border-brand-solid/15 px-3 py-1.5 text-[11px] font-medium text-brand transition hover:bg-brand-solid hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        )}
      </div>
    </li>
  )
})
