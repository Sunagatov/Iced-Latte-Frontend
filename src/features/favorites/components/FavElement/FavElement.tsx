'use client'
import Image from 'next/image'
import productImg from '@/../public/coffee.png'
import star from '@/../public/star.png'
import Link from 'next/link'
import getImgUrl from '@/shared/utils/getImgUrl'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import { useCartStore } from '@/features/cart/store'
import { FavElementProps } from '@/features/favorites/types'
import { handleFavouriteButtonClick } from '@/shared/utils/favUtils'
import { RiHeartFill, RiHeartLine, RiSubtractLine, RiAddLine, RiDeleteBinLine } from 'react-icons/ri'

type Props = Readonly<FavElementProps & { view?: 'list' | 'grid' }>

export default function FavElement({ product, view = 'list' }: Props) {
  const { addFavourite, removeFavourite, favourites, favouriteIds } = useFavouritesStore()
  const { token } = useAuthStore()
  const add = useCartStore((s) => s.add)
  const remove = useCartStore((s) => s.remove)
  const removeFullProduct = useCartStore((s) => s.removeFullProduct)
  const items = useCartStore((s) => s.itemsIds)

  const qty = items?.find((i) => i.productId === product.id)?.productQuantity ?? 0
  const isFavourited = token ? favourites.some((f) => f.id === product.id) : favouriteIds.includes(product.id)

  const handleHeart = async () => {
    await handleFavouriteButtonClick(product.id, token, isFavourited, addFavourite, removeFavourite)
  }

  const HeartBtn = () => (
    <button
      onClick={handleHeart}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-red-50"
      aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
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
            onClick={() => qty === 1 ? removeFullProduct(product.id) : remove(product.id)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-inverted hover:bg-white/20"
          >
            {qty === 1
              ? <RiDeleteBinLine className="h-3.5 w-3.5" />
              : <RiSubtractLine className="h-3.5 w-3.5" />}
          </button>
          <span className="w-5 text-center text-sm font-semibold text-inverted">{qty}</span>
          <button
            onClick={() => add(product.id)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-solid text-inverted hover:bg-brand-solid-hover"
          >
            <RiAddLine className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => add(product.id)}
          className="h-9 rounded-full bg-brand-solid px-4 text-xs font-semibold text-inverted transition hover:bg-brand-solid-hover"
        >
          Add to cart
        </button>
      )}
    </div>
  )

  if (view === 'grid') {
    return (
      <div className="flex flex-col rounded-2xl border border-black/8 bg-white shadow-sm overflow-hidden">
        <Link href={`/product/${product.id}`} className="relative block bg-secondary">
          <Image
            src={getImgUrl(product.productFileUrl, productImg)}
            alt={product.name}
            width={240}
            height={160}
            className="w-full h-[140px] object-contain p-3"
          />
          <button
            onClick={handleHeart}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm"
            aria-label="Toggle favourite"
          >
            {isFavourited
              ? <RiHeartFill className="h-4 w-4 text-negative" />
              : <RiHeartLine className="h-4 w-4 text-secondary" />}
          </button>
        </Link>
        <div className="flex flex-1 flex-col p-3">
          {product.brandName && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary truncate">{product.brandName}</p>
          )}
          <Link href={`/product/${product.id}`}>
            <p className="mt-0.5 text-sm font-semibold text-primary line-clamp-2 leading-snug hover:text-brand">{product.name}</p>
          </Link>
          <div className="mt-1 flex items-center gap-1 text-xs text-tertiary">
            <Image src={star} alt="star" className="h-3 w-3 shrink-0" />
            <span className="font-semibold text-primary">{product.averageRating?.toFixed(1) ?? '—'}</span>
            <span>({product.reviewsCount ?? 0})</span>
          </div>
          <p className="mt-1.5 text-base font-bold text-primary">${product?.price?.toFixed(2)}</p>
          <div className="mt-2">
            <Stepper />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="fav-element" className="flex overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
      <Link href={`/product/${product.id}`} className="shrink-0">
        <Image
          src={getImgUrl(product.productFileUrl, productImg)}
          alt={product.name}
          width={100}
          height={100}
          className="h-full w-24 object-cover bg-secondary"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.brandName && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tertiary">{product.brandName}</p>
            )}
            <Link href={`/product/${product.id}`}>
              <p className="mt-0.5 text-[15px] font-bold text-primary hover:text-brand">{product.name}</p>
            </Link>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <Image src={star} alt="star" className="h-3 w-3 shrink-0" />
              <span className="font-semibold text-primary">{product.averageRating?.toFixed(1) ?? '—'}</span>
              <span className="text-tertiary">({product.reviewsCount ?? 0})</span>
              <span className="text-tertiary">· {product.quantity} g.</span>
            </div>
            {product.description && (
              <p className="mt-1.5 line-clamp-1 text-xs italic text-tertiary">{product.description}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <p className="text-base font-bold text-primary">${product?.price?.toFixed(2)}</p>
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
