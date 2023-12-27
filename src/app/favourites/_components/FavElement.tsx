'use client'

import Image from 'next/image'
import productImg from '../../../../public/coffee.png'
import star from '../../../../public/star.png'
import { IProduct } from '@/models/Products'
import AddToCartButton from '@/app/product/_components/AddToCart'
import ButtonHeart from '@/components/Heart/ButtonHeart'

import { productRating } from '@/constants/product'
import Link from 'next/link'

interface FavElementProps {
  product: IProduct
}

export default function FavElement({ product }: FavElementProps) {
  return (
    <div className="flex items-center justify-between border-b p-4 pr-0">
      {/* Left side: Picture */}
      <Link href={`/product/${product.id}`} className="flex justify-center">
        <Image
          src={productImg}
          alt={product.name}
          width={200}
          height={200}
          className=" object-cover"
        />
      </Link>

      {/* Right side: Data */}
      <div className="relative ml-4 grow">
        <p className="text-lg font-semibold">{product.name}</p>
        <p
          className={'mb-3 font-medium text-placeholder'}
        >{` ${product.quantity} g.`}</p>

        <p className="right-0 top-0 mb-2 text-lg font-semibold sm:absolute">{`$${product?.price?.toFixed(
          2,
        )}`}</p>
        <div className="mb-3">
          <Image src={star} alt="star" className={'inline-block'} />

          <span>{productRating}</span>
        </div>
        <div className="flex">
          <AddToCartButton product={product} />
          <ButtonHeart id={product.id} className="ml-2" />
        </div>
      </div>
    </div>
  )
}
