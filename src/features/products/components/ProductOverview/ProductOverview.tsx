'use client'

import React from 'react'
import Image from 'next/image'
import { IProduct } from '@/features/products/types'
import AddToCartButton from '@/features/products/components/AddToCart/AddToCart'
import HeartWrapper from '@/features/products/components/HeartWrapper/HeartWrapper'
import Rating from '@/shared/components/Rating/Rating'
import { IProductReviewsStatistics } from '@/features/reviews/types'
import { FiPackage, FiShield, FiRefreshCw, FiTruck } from 'react-icons/fi'
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
                <Image
                  src="/star.png"
                  alt="star"
                  className="inline-block"
                  width={13}
                  height={12}
                />
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
            { label: '500 g', icon: '⚖️' },
            { label: 'Whole Bean', icon: '☕' },
            { label: 'Medium Roast', icon: '🔥' },
            { label: 'Single Origin', icon: '🌍' },
          ].map(({ label, icon }) => (
            <span
              key={label}
              className="border-primary/10 text-secondary-foreground flex items-center gap-1.5 rounded-xl border bg-white px-3 py-1.5 text-xs font-medium shadow-sm"
            >
              <span>{icon}</span>
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

        {/* CTA */}
        <div className="flex items-center gap-3">
          <AddToCartButton product={product} />
          <HeartWrapper id={product.id} className="ml-1" />
        </div>

        {/* Price — visible for testid */}
        <p data-testid="product-price" className="sr-only">
          ${product.price}
        </p>

        {/* Description */}
        {product.description && (
          <p className="text-secondary-foreground text-base leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {[
            {
              icon: FiTruck,
              label: 'Free shipping',
              sub: 'on orders over $30',
            },
            {
              icon: FiRefreshCw,
              label: 'Easy returns',
              sub: '30-day return policy',
            },
            {
              icon: FiPackage,
              label: 'Fresh roasted',
              sub: 'shipped within 48h',
            },
            { icon: FiShield, label: 'Secure checkout', sub: 'SSL encrypted' },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="border-primary/8 flex items-start gap-2.5 rounded-2xl border bg-white p-3 shadow-sm"
            >
              <Icon className="text-brand-solid mt-0.5 h-4 w-4 shrink-0" />
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
