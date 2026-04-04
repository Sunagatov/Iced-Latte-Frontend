'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  RiAddLine,
  RiDeleteBinLine,
  RiHeartFill,
  RiHeartLine,
  RiSubtractLine,
} from 'react-icons/ri'
import productImg from '@/../public/coffee.png'
import star from '@/../public/star.png'
import { useCartStore, type CartSliceStore } from '@/features/cart/store'
import { useFavouritesStore, type FavStoreState } from '@/features/favorites/store'
import type { FavElementProps } from '@/features/favorites/types'
import getImgUrl from '@/shared/utils/getImgUrl'

type Props = Readonly<FavElementProps & { view?: 'list' | 'grid' }>

export default function FavElement({ product, view = 'list' }: Props) {
  const toggleFavourite = useFavouritesStore(
    (state: FavStoreState): FavStoreState['toggleFavourite'] => state.toggleFavourite,
  )
  const favouriteIds = useFavouritesStore(
    (state: FavStoreState): string[] => state.favouriteIds,
  )
  const pendingIds = useFavouritesStore(
    (state: FavStoreState): Set<string> => state.pendingIds,
  )

  const add = useCartStore(
    (state: CartSliceStore): CartSliceStore['add'] => state.add,
  )
  const remove = useCartStore(
    (state: CartSliceStore): CartSliceStore['remove'] => state.remove,
  )
  const removeFullProduct = useCartStore(
    (state: CartSliceStore): CartSliceStore['removeFullProduct'] => state.removeFullProduct,
  )
  const items = useCartStore(
    (state: CartSliceStore): CartSliceStore['itemsIds'] => state.itemsIds,
  )

  const qty = items.find((item) => item.productId === product.id)?.productQuantity ?? 0
  const isFavourited = favouriteIds.includes(product.id)
  const isPending = pendingIds.has(product.id)

  const handleHeart = (): void => {
    if (!isPending) {
      void toggleFavourite(product.id)
    }
  }

  const handleGridHeartClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    handleHeart()
  }

  const HeartBtn = () => (
    <button
      aria-busy={isPending}
      aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavourited}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-red-50 disabled:opacity-50"
      disabled={isPending}
      onClick={handleHeart}
    >
      {isFavourited
        ? <RiHeartFill className="h-5 w-5 text-negative" />
        : <RiHeartLine className="h-5 w-5 text-secondary" />}
    </button>
  )

  const Stepper = () => (
    <div className="flex h-9 items-center">
      {qty > 0 ? (
        <div className="inline-flex items-center gap-1 rounded-full bg-inverted px-1 py-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full text-inverted hover:bg-white/20"
            onClick={() => (qty === 1 ? removeFullProduct(product.id) : remove(product.id))}
          >
            {qty === 1
              ? <RiDeleteBinLine className="h-3.5 w-3.5" />
              : <RiSubtractLine className="h-3.5 w-3.5" />}
          </button>
          <span className="w-5 text-center text-sm font-semibold text-inverted">{qty}</span>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-solid text-inverted hover:bg-brand-solid-hover"
            onClick={() => add(product.id)}
          >
            <RiAddLine className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          className="h-9 rounded-full bg-brand-solid px-4 text-xs font-semibold text-inverted transition hover:bg-brand-solid-hover"
          onClick={() => add(product.id)}
        >
          Add to cart
        </button>
      )}
    </div>
  )

  if (view === 'grid') {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
        <Link className="relative block bg-secondary" href={`/product/${product.id}`}>
          <Image
            alt={product.name}
            className="h-[140px] w-full object-contain p-3"
            height={160}
            src={getImgUrl(product.productFileUrl, productImg)}
            width={240}
          />
          <button
            aria-busy={isPending}
            aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
            aria-pressed={isFavourited}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm disabled:opacity-50"
            disabled={isPending}
            onClick={handleGridHeartClick}
          >
            {isFavourited
              ? <RiHeartFill className="h-4 w-4 text-negative" />
              : <RiHeartLine className="h-4 w-4 text-secondary" />}
          </button>
        </Link>
        <div className="flex flex-1 flex-col p-3">
          {product.brandName && (
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-tertiary">
              {product.brandName}
            </p>
          )}
          <Link href={`/product/${product.id}`}>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-primary hover:text-brand">
              {product.name}
            </p>
          </Link>
          <div className="mt-1 flex items-center gap-1 text-xs text-tertiary">
            <Image alt="star" className="h-3 w-3 shrink-0" src={star} />
            <span className="font-semibold text-primary">{product.averageRating?.toFixed(1) ?? '—'}</span>
            <span>({product.reviewsCount ?? 0})</span>
          </div>
          <p className="mt-1.5 text-base font-bold text-primary">${product.price.toFixed(2)}</p>
          <div className="mt-2">
            <Stepper />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm" data-testid="fav-element">
      <Link className="shrink-0" href={`/product/${product.id}`}>
        <Image
          alt={product.name}
          className="h-full w-24 bg-secondary object-cover"
          height={100}
          src={getImgUrl(product.productFileUrl, productImg)}
          width={100}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.brandName && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tertiary">
                {product.brandName}
              </p>
            )}
            <Link href={`/product/${product.id}`}>
              <p className="mt-0.5 text-[15px] font-bold text-primary hover:text-brand">{product.name}</p>
            </Link>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <Image alt="star" className="h-3 w-3 shrink-0" src={star} />
              <span className="font-semibold text-primary">{product.averageRating?.toFixed(1) ?? '—'}</span>
              <span className="text-tertiary">({product.reviewsCount ?? 0})</span>
              <span className="text-tertiary">· {product.quantity} g.</span>
            </div>
            {product.description && (
              <p className="mt-1.5 line-clamp-1 text-xs italic text-tertiary">{product.description}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <p className="text-base font-bold text-primary">${product.price.toFixed(2)}</p>
            <HeartBtn />
          </div>
        </div>
        <div className="mt-3">
          <Stepper />
        </div>
      </div>
    </div>
  )
}