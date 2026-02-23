'use client'
import Image from 'next/image'
import productImg from '@/../public/coffee.png'
import getImgUrl from '@/shared/utils/getImgUrl'
import Link from 'next/link'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { CartElementProps } from '@/features/cart/types'
import { handleFavouriteButtonClick } from '@/shared/utils/favUtils'
import { useCartStore } from '@/features/cart/store'
import { useEffect, useRef, useState } from 'react'

export default function CartElement({ product, add, remove, removeAll }: Readonly<CartElementProps>) {
  const { productInfo } = product
  const items = useCartStore((state) => state.itemsIds)
  const productQuantity = items?.find((item) => item.productId === productInfo.id)?.productQuantity ?? 0
  const totalProductPrice = (productInfo.price * productQuantity!).toFixed(2)

  const [pulse, setPulse] = useState(false)
  const prevQty = useRef(productQuantity)
  useEffect(() => {
    if (prevQty.current !== productQuantity) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 400)
      prevQty.current = productQuantity
      return () => clearTimeout(t)
    }
  }, [productQuantity])

  const token = useAuthStore((state) => state.token)
  const { addFavourite, removeFavourite, favourites, favouriteIds } = useFavouritesStore()
  const isFavourited = token
    ? favourites?.some((fav) => fav.id === productInfo.id)
    : favouriteIds.includes(productInfo.id)

  const handleButtonClick = async () => {
    try {
      await handleFavouriteButtonClick(productInfo.id, token, isFavourited, addFavourite, removeFavourite)
    } catch {
      // state already rolled back in favStore
    }
  }

  return (
    <div className="rounded-2xl border border-[#242D3429] bg-primary px-4 py-3 shadow-sm transition-shadow hover:shadow-md">

      {/* Top row: image + name + price */}
      <div className="flex items-center gap-3">
        <Link href={`/product/${productInfo.id}`} className="shrink-0">
          <div className="h-[72px] w-[72px] overflow-hidden rounded-xl bg-secondary">
            <Image
              src={getImgUrl(productInfo.productFileUrl, productImg)}
              alt={productInfo.name}
              width={72}
              height={72}
              className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
            />
          </div>
        </Link>

        <div className="flex flex-1 items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">{productInfo.brandName}</p>
            <Link href={`/product/${productInfo.id}`}>
              <p className="text-[15px] font-semibold leading-snug text-primary hover:text-brand">
                {productInfo.name}
              </p>
            </Link>
            <p className="text-xs text-secondary">by {productInfo.sellerName}</p>
          </div>
          <div className={`shrink-0 flex items-baseline gap-0.5 transition-all duration-300 ${pulse ? 'scale-110' : 'scale-100'}`}>
            <span className="text-xs font-medium text-secondary">$</span>
            <span className={`text-lg font-bold tabular-nums ${pulse ? 'text-brand' : 'text-primary'}`}>{totalProductPrice}</span>
          </div>
        </div>
      </div>

      {/* Bottom row: unit price + trash + heart + stepper */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-second px-2.5 py-0.5 text-xs font-semibold text-brand">
            ${productInfo.price} / unit
          </span>
          <button
            onClick={removeAll}
            className="flex h-7 w-7 items-center justify-center rounded-full text-secondary transition-all hover:bg-[#FFE5E5] hover:text-negative active:scale-90"
            aria-label="Remove item"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
          <button
            onClick={handleButtonClick}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-all hover:bg-secondary active:scale-90"
            aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavourited ? '#E12E3C' : 'none'} stroke={isFavourited ? '#E12E3C' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 rounded-full bg-inverted px-1 py-1">
          <button
            onClick={productQuantity === 1 ? removeAll : remove}
            className="flex h-7 w-7 items-center justify-center rounded-full text-inverted transition-colors hover:bg-white/20 active:scale-90"
            aria-label={productQuantity === 1 ? 'Remove item' : 'Decrease quantity'}
          >
            {productQuantity === 1 ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
          </button>
          <span className="w-6 text-center text-sm font-semibold text-inverted">{productQuantity}</span>
          <button
            onClick={add}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-solid text-inverted transition-colors hover:bg-brand-solid-hover active:scale-90"
            aria-label="Increase quantity"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}
