'use client'

import Link from 'next/link'
import Image from 'next/image'
import productImg from '@/../public/coffee.png'
import star from '@/../public/star.png'
import type { FavElementProps } from '@/features/favorites/types/favoritesTypes'
import FavoriteCartStepper from '@/features/favorites/components/FavoriteCartStepper/FavoriteCartStepper'
import FavoriteToggleButton from '@/features/favorites/components/FavoriteToggleButton/FavoriteToggleButton'
import { useFavoriteProductActions } from '@/features/favorites/hooks/useFavoriteProductActions'
import ProductImage from '@/shared/ui/ProductImage/ProductImage'

type Props = Readonly<FavElementProps & { view?: 'list' | 'grid' }>

export default function FavElement({ product, view = 'list' }: Props) {
  const {
    addToCart,
    decreaseCartQuantity,
    handleToggleFavourite,
    isFavourited,
    isPending,
    quantity,
    removeFromCart,
  } = useFavoriteProductActions(product.id)

  const handleGridHeartClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault()
    event.stopPropagation()
    handleToggleFavourite()
  }

  if (view === 'grid') {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
        <Link
          className="bg-secondary relative block"
          href={`/product/${product.id}`}
        >
          <ProductImage
            alt={product.name}
            className="h-[140px] w-full object-contain p-3"
            height={160}
            productFileUrl={product.productFileUrl}
            width={240}
          />
          <div className="absolute top-2 right-2">
            <FavoriteToggleButton
              compact
              isFavourited={isFavourited}
              isPending={isPending}
              onClick={handleGridHeartClick}
            />
          </div>
        </Link>
        <div className="flex flex-1 flex-col p-3">
          {product.brandName && (
            <p className="text-tertiary truncate text-[10px] font-semibold tracking-wider uppercase">
              {product.brandName}
            </p>
          )}
          <Link href={`/product/${product.id}`}>
            <p className="text-primary hover:text-brand mt-0.5 line-clamp-2 text-sm leading-snug font-semibold">
              {product.name}
            </p>
          </Link>
          <div className="text-tertiary mt-1 flex items-center gap-1 text-xs">
            <Image alt="star" className="h-3 w-3 shrink-0" src={star} />
            <span className="text-primary font-semibold">
              {product.averageRating?.toFixed(1) ?? '—'}
            </span>
            <span>({product.reviewsCount ?? 0})</span>
          </div>
          <p className="text-primary mt-1.5 text-base font-bold">
            ${product.price.toFixed(2)}
          </p>
          <div className="mt-2">
            <FavoriteCartStepper
              onAdd={addToCart}
              onRemove={decreaseCartQuantity}
              onRemoveAll={removeFromCart}
              quantity={quantity}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
      data-testid="fav-element"
    >
      <Link className="shrink-0" href={`/product/${product.id}`}>
        <ProductImage
          alt={product.name}
          className="bg-secondary h-full w-24 object-cover"
          height={100}
          productFileUrl={product.productFileUrl}
          width={100}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.brandName && (
              <p className="text-tertiary text-[10px] font-semibold tracking-widest uppercase">
                {product.brandName}
              </p>
            )}
            <Link href={`/product/${product.id}`}>
              <p className="text-primary hover:text-brand mt-0.5 text-[15px] font-bold">
                {product.name}
              </p>
            </Link>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <Image alt="star" className="h-3 w-3 shrink-0" src={star} />
              <span className="text-primary font-semibold">
                {product.averageRating?.toFixed(1) ?? '—'}
              </span>
              <span className="text-tertiary">
                ({product.reviewsCount ?? 0})
              </span>
              <span className="text-tertiary">· {product.quantity} g.</span>
            </div>
            {product.description && (
              <p className="text-tertiary mt-1.5 line-clamp-1 text-xs italic">
                {product.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <p className="text-primary text-base font-bold">
              ${product.price.toFixed(2)}
            </p>
            <FavoriteToggleButton
              isFavourited={isFavourited}
              isPending={isPending}
              onClick={handleToggleFavourite}
            />
          </div>
        </div>
        <div className="mt-3">
          <FavoriteCartStepper
            onAdd={addToCart}
            onRemove={decreaseCartQuantity}
            onRemoveAll={removeFromCart}
            quantity={quantity}
          />
        </div>
      </div>
    </div>
  )
}
