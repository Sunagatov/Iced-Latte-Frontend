'use client'
import Image from 'next/image'
import productImg from '../../../../public/coffee.png'
import star from '../../../../public/star.png'
import ButtonHeart from '@/components/UI/Heart/ButtonHeart'
import Link from 'next/link'
import AddToCartButton from '@/components/Product/AddToCart/AddToCart'
import getImgUrl from '@/utils/getImgUrl'
import { useAuthStore } from '@/store/authStore'
import { useFavouritesStore } from '@/store/favStore'
import { FavElementProps } from '@/types/FavElement'
import { handleFavouriteButtonClick } from '@/utils/favUtils'

export default function FavElement({ product }: Readonly<FavElementProps>) {
  const { addFavourite, removeFavourite, favourites, favouriteIds } =
    useFavouritesStore()
  const { token } = useAuthStore()

  const isFavourited = token ? favourites.some((fav) => fav.id === product.id) : favouriteIds.includes(product.id)

  const handleButtonClick = async () => {
    await handleFavouriteButtonClick(product.id, token, isFavourited, addFavourite, removeFavourite)
  }

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-primary/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${product.id}`} className="shrink-0">
        <div className="overflow-hidden rounded-xl bg-secondary">
          <Image
            src={getImgUrl(product.productFileUrl, productImg)}
            alt={product.name}
            width={112}
            height={112}
            className="h-[112px] w-[112px] object-contain"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.brandName && (
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-tertiary">{product.brandName}</p>
            )}
            <Link href={`/product/${product.id}`}>
              <p className="truncate text-base font-semibold text-primary transition-colors hover:text-brand-solid">{product.name}</p>
            </Link>
          </div>
          <p className="shrink-0 text-base font-bold text-primary">${product?.price?.toFixed(2)}</p>
        </div>

        <div className="flex items-center gap-1.5 text-sm">
          <Image src={star} alt="star" className="inline-block h-3.5 w-3.5" />
          <span className="font-semibold text-primary">{product.averageRating?.toFixed(1) ?? '—'}</span>
          <span className="text-tertiary">({product.reviewsCount ?? 0})</span>
          <span className="text-tertiary">·</span>
          <span className="text-tertiary">{product.quantity} g.</span>
        </div>

        {product.description && (
          <p className="line-clamp-1 text-sm text-tertiary">{product.description}</p>
        )}

        <div className="mt-2 flex items-center gap-2 scale-[0.82] origin-left">
          <AddToCartButton product={product} />
          <ButtonHeart active={isFavourited} onClick={handleButtonClick} />
        </div>
      </div>
    </div>
  )
}
