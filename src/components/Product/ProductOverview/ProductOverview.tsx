'use client'

import React from 'react'
import Image from 'next/image'
import getImgUrl from '@/utils/getImgUrl'
import { productSize } from '@/constants/product'
import { IProduct } from '@/types/Products'
import AddToCartButton from '@/components/Product/AddToCart/AddToCart'
import HeartWrapper from '@/components/Product/HeartWrapper/HeartWrapper'
import Rating from '@/components/UI/Rating/Rating'
import { useProductReviewsStore } from '@/store/reviewsStore'

interface IProductOverview {
  product: IProduct
}

const ProductOverview: React.FC<IProductOverview> = ({ product }) => {
  const { reviewsStatistics } = useProductReviewsStore()

  const averageRating = reviewsStatistics ? +reviewsStatistics.avgRating : null

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-secondary shadow-sm">
        <Image
          src={getImgUrl(product.productFileUrl, 'coffee.png')}
          width={500}
          height={500}
          alt="product_image"
          className="max-w-full md:h-[500px] md:w-full md:object-cover xl:w-[500px] xl:object-contain"
        />
      </div>

      <div className="flex flex-col justify-center gap-6 pb-4 lg:self-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-tertiary">
            {averageRating ? (
              <>
                <Image src="/star.png" alt="star" className="inline-block" width={13} height={12} />
                <span className="font-semibold text-primary"><Rating rating={averageRating} /></span>
                <span>·</span>
                <span>{reviewsStatistics?.reviewsCount} reviews</span>
              </>
            ) : (
              <span>No rating yet</span>
            )}
            <span>·</span>
            <span>{productSize} g.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AddToCartButton product={product} />
          <HeartWrapper id={product.id} className="ml-1" />
        </div>

        <p className="max-w-[420px] text-base leading-relaxed text-secondary-foreground">
          {product.description || <span className="text-tertiary italic">No description available</span>}
        </p>
      </div>
    </>
  )
}

export default ProductOverview
