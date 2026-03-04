'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import getImgUrl from '@/shared/utils/getImgUrl'

interface ProductImageGalleryProps {
  productFileUrl: string | null
  productImageUrls?: string[]
  productName: string
}

function buildGallery(productFileUrl: string | null, productImageUrls?: string[]): string[] {
  if (productImageUrls && productImageUrls.length > 0) {
    return productImageUrls.slice(0, 10)
  }
  const main = getImgUrl(productFileUrl, '/coffee.png')

  return [typeof main === 'string' ? main : '/coffee.png']
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productFileUrl,
  productImageUrls,
  productName,
}) => {
  const images = buildGallery(productFileUrl, productImageUrls)
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setActiveIndex((i) => (i + 1) % images.length), [images.length])

  useEffect(() => { setActiveIndex(0) }, [productFileUrl, productImageUrls])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX

    if (Math.abs(diff) > 40) {
      if (diff > 0) { next() } else { prev() }
    }
    touchStartX.current = null
  }

  const hasMany = images.length > 1

  return (
    <div
      className="flex flex-col gap-3 md:flex-row md:gap-3"
      role="region"
      aria-label={`${productName} image gallery`}
      suppressHydrationWarning
    >

      {/* Vertical thumbnail strip — desktop only */}
      {hasMany && (
        <div className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-1">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-brand-solid shadow-md scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex ? true : undefined}
            >
              <Image
                src={src}
                width={72}
                height={72}
                alt={`${productName} thumbnail ${i + 1}`}
                loading={i < 3 ? 'eager' : 'lazy'}
                className="h-[72px] w-[72px] object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div
        className="relative overflow-hidden rounded-3xl bg-secondary shadow-sm flex-1"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-live="polite"
        aria-atomic="true"
      >
        <Image
          src={images[activeIndex]}
          width={500}
          height={500}
          alt={productName}
          priority
          className="max-w-full md:h-[500px] md:w-full md:object-cover xl:w-[500px] xl:object-contain transition-opacity duration-200"
        />

        {/* Prev / Next arrows — desktop */}
        {hasMany && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              ›
            </button>
          </>
        )}

        {/* Counter badge */}
        {hasMany && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Dot strip — mobile only */}
      {hasMany && (
        <div className="flex md:hidden justify-center gap-1.5 pt-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'w-5 bg-brand-solid' : 'w-2 bg-primary/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductImageGallery
