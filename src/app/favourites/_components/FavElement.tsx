'use client'

import React from 'react'

import { IProduct } from '@/models/Products'

interface FavElementProps {
  product: IProduct
}

export default function FavElement({ product }: FavElementProps) {
  return (
    <div className="flex items-center justify-between border-b p-4 pr-0">
      <div className="relative ml-4 grow">
        <p className="text-lg font-semibold">{product.name}</p>
        <p
          className={'font-medium text-placeholder'}
        >{` ${product.quantity} g.`}</p>
        <p className="right-0 top-0 text-lg font-semibold sm:absolute">{`$${product?.price?.toFixed(
          2,
        )}`}</p>
      </div>
    </div>
  )
}
