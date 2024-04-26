'use client'

import React from 'react'
import Image from 'next/image'
import getImgUrl from '@/utils/getImgUrl'
import { productSize } from '@/constants/product'
import { IProduct } from '@/types/Products'
import AddToCartButton from '@/components/Product/AddToCart/AddToCart'
import HeartWrapper from '@/components/Product/HeartWrapper/HeartWrapper'
import { useProductReviewsStore } from '@/store/reviewsStore'

interface IProductOverview {
  product: IProduct
}

const ProductOverview: React.FC<IProductOverview> = ({ product }) => {
  const { reviewsStatistics } = useProductReviewsStore()

  return (
    <>
      <Image
        src={getImgUrl(product.productFileUrl, 'coffee.png')}
        width={500}
        height={500}
        alt="product_image"
        className={
          'max-w-full md:h-[500px] md:w-full md:object-cover xl:w-[500px] xl:object-contain'
        }
      />

      <div className={'flex flex-col justify-center gap-6 pb-4 lg:self-start'}>
        <div className={'flex flex-col gap-[18px] '}>
          <h2 className={'text-4XL'}>{product.name}</h2>
          <div className={'flex items-center gap-2 text-L'}>
            <Image
              src="/star.png"
              alt="star"
              className={'inline-block'}
              width={16}
              height={15}
            />
            <span>{reviewsStatistics?.avgRating ?? 0}</span>
            <span>&#x2022; Reviews: {reviewsStatistics?.reviewsCount}</span>
            <span className={'text-placeholder'}>
              &#x2022; Size: {productSize} g.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddToCartButton product={product} />
          <HeartWrapper id={product.id} className="ml-2" />
        </div>
        <p className={'text-XL font-medium md:mt-4'}>{product.description}</p>
      </div>
    </>
  )
}

export default ProductOverview
