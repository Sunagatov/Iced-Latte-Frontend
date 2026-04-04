'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { apiGetProductReviewsStatistics } from '@/features/reviews/api'
import { IProduct } from '@/features/products/types'
import { IProductReviewsStatistics } from '@/features/reviews/types'
import dynamic from 'next/dynamic'
import ProductOverview from '@/features/products/components/ProductOverview/ProductOverview'
import { useErrorHandler } from '@/shared/utils/apiError'

const ReviewsSection = dynamic(
  () => import('@/features/reviews/components/ReviewsSection/ReviewsSection'),
  { ssr: false },
)

interface IProductWithReviews {
  product: IProduct
}

const ProductWithReviews: React.FC<IProductWithReviews> = ({ product }) => {
  const [reviewsStatistics, setReviewsStatistics] = useState<IProductReviewsStatistics | null>(null)
  const { handleError } = useErrorHandler()

  const refreshStatistics = useCallback(async () => {
    try {

      const stats = await apiGetProductReviewsStatistics(product.id)
      setReviewsStatistics(stats)
    } catch (error) {
      handleError(error)
    }
  }, [product.id, handleError])

  useEffect(() => {
    setReviewsStatistics(null)
    void refreshStatistics()
  }, [refreshStatistics])

  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-10 xl:pt-14" suppressHydrationWarning>
      <div className="flex flex-col items-center gap-8 sm:justify-center lg:flex-row lg:items-start xl:gap-16">
        <ProductOverview product={product} reviewsStatistics={reviewsStatistics} />
      </div>

      <div className="mt-14 xl:mt-24">
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
