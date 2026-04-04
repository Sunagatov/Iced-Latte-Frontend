import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import productImg from '@/../public/coffee.png'
import CircleAddBtn from '@/shared/components/Buttons/CircleAddBtn/CircleAddBtn'
import getImgUrl from '@/shared/utils/getImgUrl'
import { useCartStore } from '@/features/cart/store'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import { IProduct } from '@/features/products/types'
interface ICardProps { product: IProduct; priority?: boolean }
import ProductRating from '@/features/products/components/ProductRating/ProductRating'
import Counter from '@/shared/components/Counter/Counter'

export default memo(function ProductCard({ product, priority = false }: Readonly<ICardProps>) {
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
  const addToCart = useCartStore((state) => state.add)
  const removeFromCart = useCartStore((state) => state.remove)
  const removeFullProduct = useCartStore((state) => state.removeFullProduct)

  const productCartQuantity = cartItems?.find(
    (cartItem) => cartItem.productId === id,
  )?.productQuantity

  const token = useAuthStore((state) => state.token)

  const { toggleFavourite, favouriteIds, pendingIds } =
    useFavouritesStore()

  const isFavourited = favouriteIds.includes(id)
  const isPending = pendingIds.has(id)

  const handleButtonClick = () => { void toggleFavourite(id, token) }

  return (
    <li
      data-testid="product-card"
      className="group relative flex w-full max-w-[240px] flex-col justify-self-center overflow-hidden rounded-2xl border border-black/6 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-w-[190px]"
    >
      {/* Heart button — outside Link to avoid nested interactive elements */}
      <button
        onClick={handleButtonClick}
        disabled={isPending}
        data-testid="favourite-btn"
        data-active={isFavourited ? 'true' : 'false'}
        aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
        aria-pressed={isFavourited}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all outline-none focus:outline-none disabled:opacity-50 ${
          isFavourited
            ? 'bg-red-500/90 text-white'
            : 'bg-white/70 text-gray-400 hover:bg-white hover:text-red-400'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavourited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Image */}
      <Link href={`/product/${id}`} className="flex flex-1 flex-col">
        <div className="relative h-[200px] w-full bg-[#F7F7F9] sm:h-[220px]">
          <Image
            src={getImgUrl(productFileUrl, productImg)}
            alt={name}
            style={{ objectFit: 'contain', padding: '16px' }}
            fill={true}
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
          />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-3">
          <ProductRating rating={averageRating} reviewsCount={reviewsCount} />
          <h2 className="line-clamp-2 text-sm font-semibold leading-tight text-primary sm:text-base">{name}</h2>
          <p className="text-xs text-secondary">{brandName} · {sellerName}</p>
        </div>
      </Link>

      {/* Price row */}
      <div className="flex items-center justify-between border-t border-black/5 px-3 py-2.5">
        <p data-testid="product-price" className="text-base font-bold text-primary">${price}</p>
        {productCartQuantity ? (
          <Counter
            theme="light"
            className={'h-8 gap-1 px-1 text-[12px] sm:text-M'}
            count={productCartQuantity}
            removeProduct={() => productCartQuantity === 1 ? removeFullProduct(id) : removeFromCart(id)}
            addProduct={() => addToCart(id)}
          />
        ) : (
          <CircleAddBtn
            className="h-8 w-8 bg-brand-solid hover:bg-brand-solid-hover focus:bg-brand-solid active:bg-brand-solid sm:h-9 sm:w-9"
            iconClassName="h-3 w-3 sm:h-4 sm:w-4"
            onClick={() => addToCart(id)}
          />
        )}
      </div>
    </li>
  )
})
