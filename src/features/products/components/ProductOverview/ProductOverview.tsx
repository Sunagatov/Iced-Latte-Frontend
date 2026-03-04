'use client'

import React from 'react'
import Image from 'next/image'
import { IProduct } from '@/features/products/types'
import AddToCartButton from '@/features/products/components/AddToCart/AddToCart'
import HeartWrapper from '@/features/products/components/HeartWrapper/HeartWrapper'
import Rating from '@/shared/components/Rating/Rating'
import { useProductReviewsStore } from '@/features/reviews/store'
import { FiPackage, FiShield, FiRefreshCw, FiTruck } from 'react-icons/fi'
import ProductImageGallery from '@/features/products/components/ProductImageGallery/ProductImageGallery'

interface IProductOverview {
  product: IProduct
}

const ProductOverview: React.FC<IProductOverview> = ({ product }) => {
  const { reviewsStatistics } = useProductReviewsStore()
  const averageRating = reviewsStatistics ? +reviewsStatistics.avgRating : (product.averageRating || null)
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
      <div className="flex flex-col gap-5 pb-4 lg:self-start lg:max-w-[480px]">

        {/* Brand + seller */}
        <div className="flex flex-wrap gap-2">
          {product.brandName && (
            <span className="rounded-full bg-brand-second px-3 py-1 text-xs font-semibold text-brand-solid">
              {product.brandName}
            </span>
          )}
          {product.sellerName && (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-tertiary">
              Sold by {product.sellerName}
            </span>
          )}
        </div>

        {/* Title + rating */}
        <div className="flex flex-col gap-1.5">
          <h1 data-testid="product-name" className="text-4xl font-bold tracking-tight text-primary">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-tertiary">
            {averageRating ? (
              <>
                <Image src="/star.png" alt="star" className="inline-block" width={13} height={12} />
                <span className="font-semibold text-primary"><Rating rating={averageRating} /></span>
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
              className="flex items-center gap-1.5 rounded-xl border border-primary/10 bg-white px-3 py-1.5 text-xs font-medium text-secondary-foreground shadow-sm"
            >
              <span>{icon}</span>{label}
            </span>
          ))}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-2 text-sm">
          {inStock ? (
            <>
              <span className="h-2 w-2 rounded-full bg-positive" />
              <span className="text-positive font-medium">
                {lowStock ? `Only ${product.quantity} left` : 'In stock'}
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-negative" />
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
        <p data-testid="product-price" className="sr-only">${product.price}</p>

        {/* Description */}
        {product.description && (
          <p className="text-base leading-relaxed text-secondary-foreground">
            {product.description}
          </p>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {[
            { icon: FiTruck, label: 'Free shipping', sub: 'on orders over $30' },
            { icon: FiRefreshCw, label: 'Easy returns', sub: '30-day return policy' },
            { icon: FiPackage, label: 'Fresh roasted', sub: 'shipped within 48h' },
            { icon: FiShield, label: 'Secure checkout', sub: 'SSL encrypted' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-2.5 rounded-2xl border border-primary/8 bg-white p-3 shadow-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-solid" />
              <div>
                <div className="text-xs font-semibold text-primary">{label}</div>
                <div className="text-xs text-tertiary">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ProductOverview
