'use client'

import React, { useEffect } from 'react'
import { apiGetProductReviewsStatistics } from '@/features/reviews/api'
import { useProductReviewsStore } from '@/features/reviews/store'
import { IProduct } from '@/features/products/types'
import ReviewsSection from '@/features/reviews/components/ReviewsSection/ReviewsSection'
import ProductOverview from '@/features/products/components/ProductOverview/ProductOverview'
import { useErrorHandler } from '@/shared/utils/apiError'

interface IProductWithReviews {
  product: IProduct
}

const ProductWithReviews: React.FC<IProductWithReviews> = ({ product }) => {
  const {
    shouldRevalidateStatistics,
    setShouldRevalidateStatistics,
    setReviewsStatistics,
  } = useProductReviewsStore()
  const {
    handleError,
  } = useErrorHandler()

  useEffect(() => {
    async function getProductReviewsStatistics(productId: string) {
      try {
        const statistics = await apiGetProductReviewsStatistics(productId)

        setReviewsStatistics(statistics)
      } catch (error) {
        handleError(error)
      } finally {
        setShouldRevalidateStatistics(false)
      }
    }

    if (shouldRevalidateStatistics) {
      void getProductReviewsStatistics(product.id)
    }
  }, [
    product.id,
    shouldRevalidateStatistics,
    handleError,
    setShouldRevalidateStatistics,
    setReviewsStatistics,
  ])

  useEffect(() => {
    return () => setShouldRevalidateStatistics(true)
  }, [setShouldRevalidateStatistics])

  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-10 xl:pt-14" suppressHydrationWarning>
      <div className="flex flex-col items-center gap-8 sm:justify-center lg:flex-row lg:items-start xl:gap-16">
        <ProductOverview product={product} />
      </div>

      <div className="mt-14 xl:mt-24">
        <ReviewsSection product={product} />
      </div>
    </section>
  )
}

export default ProductWithReviews
