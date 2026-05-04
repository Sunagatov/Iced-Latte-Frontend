'use client'

import React from 'react'
import { IProduct } from '@/features/products/types'
import AddToCartButton from '@/features/products/components/AddToCart/AddToCart'
import HeartWrapper from '@/features/products/components/HeartWrapper/HeartWrapper'
import Rating from '@/shared/ui/Rating/Rating'
import type { IProductReviewsStatistics } from '@/features/reviews/types'
import ProductImageGallery from '@/features/products/components/ProductImageGallery/ProductImageGallery'

interface IProductOverview {
  product: IProduct
  reviewsStatistics: IProductReviewsStatistics | null
}

const ProductOverview: React.FC<IProductOverview> = ({
  product,
  reviewsStatistics,
}) => {
  const averageRating = reviewsStatistics
    ? +reviewsStatistics.avgRating
    : product.averageRating || null
  const reviewsCount = reviewsStatistics?.reviewsCount ?? product.reviewsCount

  const inStock = product.quantity > 0
  const lowStock = product.quantity > 0 && product.quantity <= 5

  return (
    <>
      {/* Image Gallery */}
      <ProductImageGallery
        productFileUrl={product.productFileUrl}
        productImageUrls={product.productImageUrls}
        productName={product.name}
      />

      {/* Info panel */}
      <div className="flex flex-col gap-5 pb-4 lg:max-w-[480px] lg:self-start">
        {/* Brand + seller */}
        <div className="flex flex-wrap gap-2">
          {product.brandName && (
            <span className="bg-brand-second text-brand-solid rounded-full px-3 py-1 text-xs font-semibold">
              {product.brandName}
            </span>
          )}
          {product.sellerName && (
            <span className="bg-secondary text-tertiary rounded-full px-3 py-1 text-xs">
              Sold by {product.sellerName}
            </span>
          )}
        </div>

        {/* Title + rating */}
        <div className="flex flex-col gap-1.5">
          <h1
            data-testid="product-name"
            className="text-primary text-4xl font-bold tracking-tight"
          >
            {product.name}
          </h1>
          <div className="text-tertiary flex flex-wrap items-center gap-1.5 text-sm">
            {averageRating ? (
              <>
                <svg className="inline-block h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-primary font-semibold">
                  <Rating rating={averageRating} />
                </span>
                <span>·</span>
                <span>{reviewsCount} reviews</span>
              </>
            ) : (
              <span>No rating yet</span>
            )}
          </div>
        </div>

        {/* Spec chips */}
        <div className="flex flex-wrap gap-2">
          {[
            '500 g',
            'Whole Bean',
            'Medium Roast',
            'Single Origin',
          ].map((label) => (
            <span
              key={label}
              className="border-primary/10 text-secondary-foreground rounded-xl border bg-white px-3 py-1.5 text-xs font-medium shadow-sm"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-2 text-sm">
          {inStock ? (
            <>
              <span className="bg-positive h-2 w-2 rounded-full" />
              <span className="text-positive font-medium">
                {lowStock ? `Only ${product.quantity} left` : 'In stock'}
              </span>
            </>
          ) : (
            <>
              <span className="bg-negative h-2 w-2 rounded-full" />
              <span className="text-negative font-medium">Out of stock</span>
            </>
          )}
        </div>

        {/* Price */}
        <p
          data-testid="product-price"
          className="text-3xl font-bold tracking-tight text-[#1B4332]"
        >
          ${product.price.toFixed(2)}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <AddToCartButton product={product} />
          <HeartWrapper id={product.id} className="ml-1" />
        </div>

        {/* Description */}
        {product.description && (
          <div className="border-t border-black/[0.06] pt-4">
            <p className="mb-1 text-xs font-semibold text-black/40">Description</p>
            <p className="text-sm leading-relaxed text-black/60">
              {product.description}
            </p>
          </div>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {[
            {
              icon: (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1m8-1a1 1 0 0 1-1 1H9m4-1V8a1 1 0 0 1 1-1h2.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1m-6-1a1 1 0 0 1 1 1h1" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
                </svg>
              ),
              label: 'Free shipping',
              sub: 'on orders over $30',
            },
            {
              icon: (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0ZM12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              label: 'Easy returns',
              sub: '30-day return policy',
            },
            {
              icon: (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              label: 'Fast delivery',
              sub: 'shipped within 48h',
            },
            {
              icon: (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              label: 'Secure checkout',
              sub: 'SSL encrypted',
            },
          ].map(({ icon, label, sub }) => (
            <div
              key={label}
              className="border-primary/8 flex items-start gap-2.5 rounded-2xl border bg-white p-3 shadow-sm"
            >
              <span className="text-brand-solid mt-0.5 shrink-0">{icon}</span>
              <div>
                <div className="text-primary text-xs font-semibold">
                  {label}
                </div>
                <div className="text-tertiary text-xs">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ProductOverview
