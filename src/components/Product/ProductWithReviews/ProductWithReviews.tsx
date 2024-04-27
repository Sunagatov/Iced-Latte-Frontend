'use client'

import React, { useEffect } from 'react'
import { apiGetProductReviewsStatistics } from '@/services/reviewService'
import { useProductReviewsStore } from '@/store/reviewsStore'
import { IProduct } from '@/types/Products'
import ReviewsSection from '@/components/Review/ReviewsSection/ReviewsSection'
import ProductOverview from '@/components/Product/ProductOverview/ProductOverview'
import { useErrorHandler } from '@/services/apiError/apiError'

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
    // errorMessage,
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

  return (
    <section>
      <div
        className={
          'mx-5 flex flex-col items-center gap-[21px] sm:justify-center lg:flex-row xl:gap-12'
        }
      >
        <ProductOverview product={product} />
      </div>

      <div className="mx-5 mt-12 xl:mt-20">
        <ReviewsSection productId={product.id} />
      </div>
    </section>
  )
}

export default ProductWithReviews
