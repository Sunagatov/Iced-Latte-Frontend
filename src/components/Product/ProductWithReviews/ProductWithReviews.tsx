'use client'

import React from 'react'
import { IProduct } from '@/types/Products'
import ReviewsSection from '@/components/Review/ReviewsSection/ReviewsSection'
import ProductOverview from '@/components/Product/ProductOverview/ProductOverview'

interface IProductWithReviews {
  product: IProduct
}

const ProductWithReviews:React.FC<IProductWithReviews> = ({ product }) => {
  return (
    <section>
      <div
        className={
          'mx-5 flex flex-col items-center gap-[21px] sm:justify-center lg:flex-row xl:gap-12'
        }
      >
        <ProductOverview product={product}/>
      </div>

      <div className="mx-5 mt-12 xl:mt-20">
        <ReviewsSection productId={product.id} />
      </div>
    </section>
  )
}

export default ProductWithReviews