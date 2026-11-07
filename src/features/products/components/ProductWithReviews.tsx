'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  apiGetProductReviewsStatistics,
  type IProductReviewsStatistics,
} from '@/features/reviews/public'
import { IProduct } from '@/features/products/types'
import dynamic from 'next/dynamic'
import ProductOverview from '@/features/products/components/ProductOverview'
import {
  buildGoogleAnalyticsItem,
  trackGoogleAnalyticsEvent,
} from '@/shared/analytics/googleAnalytics'
import { useToastErrorHandler } from '@/shared/utils/apiError'

const ReviewsSection = dynamic(
  () => import('@/features/reviews/public').then((mod) => mod.ReviewsSection),
  { ssr: false },
)

interface IProductWithReviews {
  product: IProduct
}

const ProductWithReviews: React.FC<IProductWithReviews> = ({ product }) => {
  const [reviewsStatistics, setReviewsStatistics] =
    useState<IProductReviewsStatistics | null>(null)
  const { handleError } = useToastErrorHandler()
  const viewTrackedProductIdRef = useRef<string | null>(null)
  const statisticsRequestRef = useRef(0)

  const refreshStatistics = useCallback(async () => {
    const requestId = ++statisticsRequestRef.current

    try {
      const stats: IProductReviewsStatistics =
        await apiGetProductReviewsStatistics(product.id)

      if (requestId === statisticsRequestRef.current)
        setReviewsStatistics(stats)
    } catch (error) {
      if (requestId === statisticsRequestRef.current) handleError(error)
    }
  }, [product.id, handleError])

  useEffect(() => {
    setReviewsStatistics(null)
    void refreshStatistics()

    return () => {
      statisticsRequestRef.current += 1
    }
  }, [refreshStatistics])

  useEffect(() => {
    if (viewTrackedProductIdRef.current === product.id) {
      return
    }

    viewTrackedProductIdRef.current = product.id
    trackGoogleAnalyticsEvent('view_item', {
      currency: 'USD',
      value: product.price,
      items: [
        buildGoogleAnalyticsItem({
          brandName: product.brandName,
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        }),
      ],
    })
  }, [product.brandName, product.id, product.name, product.price])

  return (
    <section
      className="mx-auto max-w-[1280px] px-5 pt-10 xl:pt-14"
      suppressHydrationWarning
    >
      <div className="flex flex-col items-center gap-8 sm:justify-center lg:flex-row lg:items-start xl:gap-16">
        <ProductOverview
          product={product}
          reviewsStatistics={reviewsStatistics}
        />
      </div>

      <div className="mt-10 xl:mt-14">
        <ReviewsSection
          product={product}
          reviewsStatistics={reviewsStatistics}
          refreshStatistics={refreshStatistics}
        />
      </div>
    </section>
  )
}

export default ProductWithReviews
