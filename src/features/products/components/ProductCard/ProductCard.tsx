import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import productImg from '@/../public/coffee.png'
import getImgUrl from '@/shared/utils/getImgUrl'
import { useCartStore } from '@/features/cart/state/cartStore'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import { IProduct } from '@/features/products/types'
interface ICardProps {
  product: IProduct
  priority?: boolean
}
import ProductRating from '@/features/products/components/ProductRating/ProductRating'
import Counter from '@/shared/ui/Counter/Counter'

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

  const cartItems = useCartStore((state) => state.itemsIds)
  const pendingProductIds: Set<string> = useCartStore(
    (state) => state.pendingProductIds,
  )
  const addToCart = useCartStore((state) => state.add)
  const removeFromCart = useCartStore((state) => state.remove)
  const removeFullProduct = useCartStore((state) => state.removeFullProduct)

  const productCartQuantity = cartItems?.find(
    (cartItem) => cartItem.productId === id,
  )?.productQuantity
  const isCartPending = pendingProductIds.has(id)

  const { toggleFavourite, pendingIds } = useFavouritesStore()
  const favouriteIds: string[] = useFavouritesStore((s) => s.favouriteIds)

  const isFavourited = favouriteIds.includes(id)
  const isPending = pendingIds.has(id)

  const handleButtonClick = () => {
    void toggleFavourite(id)
  }

  return (
    <li
      data-testid="product-card"
      className="group relative flex w-full max-w-[240px] flex-col justify-self-center overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] sm:min-w-[190px]"
    >
      <div className="relative">
        <div className="relative h-[200px] w-full overflow-hidden bg-white sm:h-[220px]">
          <Link href={`/product/${id}`} className="relative block h-full w-full">
            <Image
              src={getImgUrl(productFileUrl, productImg)}
              alt={name}
              style={{ objectFit: 'contain', padding: '20px' }}
              fill={true}
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
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
              ? 'bg-red-500 text-white'
              : 'text-black/20 opacity-0 group-hover:opacity-100 hover:text-red-400'
          }`}
          data-active={isFavourited ? 'true' : 'false'}
          data-testid="favourite-btn"
          disabled={isPending}
          onClick={handleButtonClick}
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

      <Link href={`/product/${id}`} className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-1 px-4 pt-3 pb-2">
          <h2 className="text-primary line-clamp-2 text-[13px] leading-snug font-medium sm:text-sm">
            {name}
          </h2>
          <p className="text-[11px] text-black/35">
            {[brandName, sellerName].filter(Boolean).join(' · ')}
          </p>
          <ProductRating rating={averageRating} reviewsCount={reviewsCount} />
        </div>
      </Link>

      <div className="flex items-center justify-between px-4 pb-3.5">
        <p
          data-testid="product-price"
          className="text-[15px] font-semibold text-[#1B4332]"
        >
          {price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>
        {productCartQuantity ? (
          <Counter
            theme="light"
            className={'sm:text-M h-7 gap-1 px-1 text-[11px]'}
            count={productCartQuantity}
            disabled={isCartPending}
            removeProduct={() =>
              productCartQuantity === 1
                ? removeFullProduct(id)
                : removeFromCart(id)
            }
            addProduct={() => addToCart(id)}
          />
        ) : (
          <button
            data-testid="add-to-cart-circle-btn"
            disabled={isCartPending}
            onClick={() => addToCart(id)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1B4332]/20 text-[#1B4332] transition hover:bg-[#1B4332] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </div>
    </li>
  )
})
